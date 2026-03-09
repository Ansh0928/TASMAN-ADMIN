import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockAddItem = vi.fn();

vi.mock('@/components/CartProvider', () => ({
    useCart: () => ({ addItem: mockAddItem }),
}));

vi.mock('@/components/WishlistProvider', () => ({
    useWishlist: () => ({
        isInWishlist: () => false,
        addToWishlist: vi.fn(),
        removeFromWishlist: vi.fn(),
    }),
}));

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('next/image', () => ({
    default: (props: any) => <img {...props} />,
}));

import ProductCard, { ProductCardData } from '@/components/ProductCard';

function createProduct(overrides: Partial<ProductCardData> = {}): ProductCardData {
    return {
        id: 'prod-1',
        name: 'Atlantic Salmon',
        slug: 'atlantic-salmon',
        price: '29.99',
        imageUrls: ['https://example.com/salmon.jpg'],
        unit: 'KG',
        stockQuantity: 50,
        category: { id: 'cat-1', name: 'Fish', slug: 'fish' },
        isFeatured: false,
        isTodaysSpecial: false,
        tags: [],
        ...overrides,
    };
}

describe('ProductCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders product name, price, and unit', () => {
        render(<ProductCard product={createProduct()} />);

        expect(screen.getByText('Atlantic Salmon')).toBeInTheDocument();
        expect(screen.getByText('$29.99')).toBeInTheDocument();
        expect(screen.getByText('/kg')).toBeInTheDocument();
    });

    it('renders product image', () => {
        render(<ProductCard product={createProduct()} />);

        const img = screen.getByAltText('Atlantic Salmon');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/salmon.jpg');
    });

    it('shows fallback when no image', () => {
        render(<ProductCard product={createProduct({ imageUrls: [] })} />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByText('🐟')).toBeInTheDocument();
    });

    it('displays badge when provided as Best Buy', () => {
        render(<ProductCard product={createProduct()} badge="Best Buy" />);

        expect(screen.getByText('Best Buy')).toBeInTheDocument();
    });

    it('displays badge when provided as Fresh Pick', () => {
        render(<ProductCard product={createProduct()} badge="Fresh Pick" />);

        expect(screen.getByText('Fresh Pick')).toBeInTheDocument();
    });

    it('does not display badge when not provided', () => {
        render(<ProductCard product={createProduct()} />);

        expect(screen.queryByText('Best Buy')).not.toBeInTheDocument();
        expect(screen.queryByText('Fresh Pick')).not.toBeInTheDocument();
    });

    it('shows out of stock overlay when stockQuantity is 0', () => {
        render(<ProductCard product={createProduct({ stockQuantity: 0 })} />);

        expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('does not show add to cart button when out of stock', () => {
        render(<ProductCard product={createProduct({ stockQuantity: 0 })} />);

        expect(screen.queryByLabelText('Add to cart')).not.toBeInTheDocument();
    });

    it('shows add to cart button when in stock', () => {
        render(<ProductCard product={createProduct()} />);

        expect(screen.getByLabelText('Add to cart')).toBeInTheDocument();
    });

    it('add to cart button calls addItem with correct data', async () => {
        const user = userEvent.setup();
        render(<ProductCard product={createProduct()} />);

        const addButton = screen.getByLabelText('Add to cart');
        await user.click(addButton);

        expect(mockAddItem).toHaveBeenCalledTimes(1);
        expect(mockAddItem).toHaveBeenCalledWith({
            productId: 'prod-1',
            name: 'Atlantic Salmon',
            price: 29.99,
            quantity: 1,
            image: 'https://example.com/salmon.jpg',
            unit: 'KG',
            slug: 'atlantic-salmon',
        });
    });

    it('button shows checkmark after adding', async () => {
        const user = userEvent.setup();
        render(<ProductCard product={createProduct()} />);

        const addButton = screen.getByLabelText('Add to cart');
        expect(addButton).toHaveTextContent('+');

        await user.click(addButton);

        // After clicking, the button should no longer show '+' (it shows a Check icon)
        expect(addButton).not.toHaveTextContent('+');
    });

    it('links to the product detail page', () => {
        render(<ProductCard product={createProduct()} />);

        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/product/atlantic-salmon');
    });

    it('formats price to two decimal places', () => {
        render(<ProductCard product={createProduct({ price: '10' })} />);

        expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
});
