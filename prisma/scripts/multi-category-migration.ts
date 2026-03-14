import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Creating product_categories table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "product_categories" (
                "id" TEXT NOT NULL,
                "product_id" TEXT NOT NULL,
                "category_id" TEXT NOT NULL,
                "is_primary" BOOLEAN NOT NULL DEFAULT false,
                CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
            )
        `);

        console.log('2. Populating from existing category_id...');
        const result = await client.query(`
            INSERT INTO "product_categories" ("id", "product_id", "category_id", "is_primary")
            SELECT gen_random_uuid(), "id", "category_id", true
            FROM "products"
            WHERE "category_id" IS NOT NULL
            ON CONFLICT DO NOTHING
        `);
        console.log(`   Inserted ${result.rowCount} rows`);

        console.log('3. Creating indexes...');
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_product_id_category_id_key"
            ON "product_categories"("product_id", "category_id")
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS "product_categories_category_id_idx"
            ON "product_categories"("category_id")
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS "product_categories_product_id_idx"
            ON "product_categories"("product_id")
        `);

        console.log('4. Creating partial unique index for isPrimary...');
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "product_categories_primary_unique"
            ON "product_categories" ("product_id") WHERE "is_primary" = true
        `);

        console.log('5. Adding foreign keys...');
        // Check if FK exists before adding
        const fkCheck = await client.query(`
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'product_categories_product_id_fkey'
        `);
        if (fkCheck.rowCount === 0) {
            await client.query(`
                ALTER TABLE "product_categories"
                ADD CONSTRAINT "product_categories_product_id_fkey"
                FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);
            await client.query(`
                ALTER TABLE "product_categories"
                ADD CONSTRAINT "product_categories_category_id_fkey"
                FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
            `);
        }

        console.log('6. Dropping old category_id column...');
        // Check if column still exists
        const colCheck = await client.query(`
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'category_id'
        `);
        if (colCheck.rowCount! > 0) {
            await client.query(`DROP INDEX IF EXISTS "products_category_id_idx"`);
            await client.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_category_id_fkey"`);
            await client.query(`ALTER TABLE "products" DROP COLUMN "category_id"`);
        }

        await client.query('COMMIT');
        console.log('Migration complete!');

        // Verify
        const count = await client.query('SELECT COUNT(*) FROM product_categories');
        console.log(`Verification: ${count.rows[0].count} product_categories rows`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed, rolled back:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
