"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ComposableMap, Geographies, Geography, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
// Static import — bundled & gzip-compressed by Next.js (~586KB → ~80KB gzipped)
import australiaGeoData from "../../data/australia.json";

const regionMapping: Record<string, string> = {
    Queensland: "QLD",
    "New South Wales": "NSW",
    Victoria: "VIC",
    Tasmania: "TAS",
    "South Australia": "SA",
    "Western Australia": "WA",
    "Northern Territory": "NT",
    "Australian Capital Territory": "ACT",
    "New Zealand": "NZ",
};


const REGIONAL_DATA: Record<
    string,
    {
        name: string;
        tagline: string;
        species: Array<{ name: string; emoji: string; productSlug: string }>;
    }
> = {
    QLD: {
        name: "Queensland",
        tagline: "Tropical reefs & warm currents",
        species: [
            { name: "Barramundi", emoji: "🐟", productSlug: "qld-barramundi-whole" },
            { name: "Mud Crab", emoji: "🦀", productSlug: "mud-crab-cooked" },
            { name: "Tiger Prawn", emoji: "🦐", productSlug: "cooked-tiger-prawns" },
        ],
    },
    NSW: {
        name: "New South Wales",
        tagline: "Deep canyons & pristine estuaries",
        species: [
            { name: "Pacific Oyster", emoji: "🦪", productSlug: "pacific-plate-oyster" },
            { name: "Kingfish", emoji: "🐟", productSlug: "kingfish" },
            { name: "Snapper", emoji: "🐠", productSlug: "local-snapper-whole" },
        ],
    },
    SA: {
        name: "South Australia",
        tagline: "The Great Australian Bight",
        species: [
            { name: "Crayfish", emoji: "🦞", productSlug: "wa-crayfish-cooked" },
            { name: "King George Whiting", emoji: "🐟", productSlug: "king-george-whiting-whole" },
        ],
    },
    TAS: {
        name: "Tasmania",
        tagline: "Cold, pure southern waters",
        species: [
            { name: "Salmon", emoji: "🐟", productSlug: "king-ora-salmon-whole" },
            { name: "Pacific Oysters", emoji: "🦪", productSlug: "jumbo-pacific-oyster" },
            { name: "Ocean Trout", emoji: "🐟", productSlug: "ocean-trout-fillets" },
        ],
    },
    WA: {
        name: "Western Australia",
        tagline: "Wild rugged coastline",
        species: [
            { name: "Rock Lobster", emoji: "🦞", productSlug: "wa-crayfish-live" },
        ],
    },
    VIC: {
        name: "Victoria",
        tagline: "Stormy southern seas",
        species: [
            { name: "Scallops", emoji: "🦪", productSlug: "tasmanian-scallop-meat" },
        ],
    },
    NT: {
        name: "Northern Territory",
        tagline: "Arafura Sea & tidal rivers",
        species: [
            { name: "Spanish Mackerel", emoji: "🐟", productSlug: "spanish-mackerel-fillet" },
            { name: "Goldband Snapper", emoji: "🐠", productSlug: "gold-band-snapper-whole" },
            { name: "Mud Crab", emoji: "🦀", productSlug: "live-mud-crabs" },
        ],
    },
    NZ: {
        name: "New Zealand",
        tagline: "Crystal waters & world-class shellfish",
        species: [
            { name: "Mussels", emoji: "🦪", productSlug: "fresh-black-mussels" },
            { name: "Crayfish", emoji: "🦞", productSlug: "wa-crayfish-cooked" },
        ],
    },
};

export default function RegionalMap() {
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    const [pinned, setPinned] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Click pins the card open so user can interact with it
    const handleRegion = useCallback(
        (code: string | null) => {
            if (!code || !REGIONAL_DATA[code]) return;
            if (leaveTimer.current) clearTimeout(leaveTimer.current);
            setActiveRegion((p) => {
                if (p === code) { setPinned(false); return null; }
                setPinned(true);
                return code;
            });
        },
        []
    );

    const handleEnter = useCallback(
        (code: string | null) => {
            if (isMobile || !code || !REGIONAL_DATA[code]) return;
            if (leaveTimer.current) clearTimeout(leaveTimer.current);
            if (!pinned) setActiveRegion(code);
        },
        [isMobile, pinned]
    );

    const handleLeave = useCallback(() => {
        if (isMobile || pinned) return;
        // Delay so user can move mouse to the card
        leaveTimer.current = setTimeout(() => setActiveRegion(null), 600);
    }, [isMobile, pinned]);

    const data = activeRegion ? REGIONAL_DATA[activeRegion] : null;

    return (
        <div
            className="w-full rounded-3xl overflow-hidden relative"
            style={{ background: "#06111f" }}
            onClick={(e) => {
                if (!isMobile) return;
                const t = e.target as HTMLElement;
                if (!t.closest("[data-card]") && !t.closest("path")) { setActiveRegion(null); setPinned(false); }
            }}
        >
            {/* Ambient ocean gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(10,40,70,0.5) 0%, transparent 70%)",
                }}
            />

            {/* Header — overlaid top-left */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 pt-6 md:pt-8">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-[#FF8543] text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase block mb-1.5">
                            Sourcing Map
                        </span>
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                            Our Waters
                        </h2>
                        <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-xs leading-relaxed">
                            Discover the waters we source from across Australia &amp; New Zealand.
                        </p>
                    </div>
                </div>
            </div>

            {/* Map + info card layout */}
            <div className="relative h-[600px] md:h-[650px]">

                {/* Full-bleed SVG map — z-0 so info card sits above */}
                <div className="absolute inset-0 z-0">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: isMobile ? 450 : 680, center: createCoordinates(148, -29) }}
                        className="w-full h-full"
                    >
                        <Geographies geography={australiaGeoData}>
                            {({ geographies }) =>
                                geographies.map((geo, idx) => {
                                    const name = geo.properties.STATE_NAME;
                                    const code = regionMapping[name] || null;
                                    const active = activeRegion === code;
                                    const supported = !!code && !!REGIONAL_DATA[code];

                                    return (
                                        <Geography
                                            key={geo.rsmKey || idx}
                                            geography={geo}
                                            onClick={() => handleRegion(code)}
                                            onMouseEnter={() => handleEnter(code)}
                                            onMouseLeave={handleLeave}
                                            style={{
                                                default: {
                                                    fill: active
                                                        ? "#FF8543"
                                                        : supported
                                                        ? "#112240"
                                                        : "#0a1830",
                                                    stroke: active ? "#ffaa75" : "#1a3355",
                                                    strokeWidth: active ? 1.2 : 0.3,
                                                    outline: "none",
                                                    transition: "all 0.3s ease",
                                                    opacity: active ? 1 : supported ? 0.85 : 0.5,
                                                },
                                                hover: {
                                                    fill: supported ? "#1a3a5c" : "#0a1830",
                                                    stroke: supported ? "#FF8543" : "#1a3355",
                                                    strokeWidth: supported ? 0.8 : 0.3,
                                                    outline: "none",
                                                    cursor: supported ? "pointer" : "default",
                                                    opacity: 1,
                                                },
                                                pressed: { outline: "none" },
                                            }}
                                        />
                                    );
                                })
                            }
                        </Geographies>
                    </ComposableMap>
                </div>


                {/* Info card — fixed bottom-left, never clips */}
                <AnimatePresence mode="wait">
                    {data && (
                        <motion.div
                            key={activeRegion}
                            data-card
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.97 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute bottom-6 left-6 md:bottom-8 md:left-10 z-40 w-[280px] md:w-[320px] pointer-events-auto"
                            onMouseEnter={() => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }}
                            onMouseLeave={() => { if (!pinned && !isMobile) { leaveTimer.current = setTimeout(() => setActiveRegion(null), 400); } }}
                        >
                            <div
                                className="rounded-2xl overflow-hidden"
                                style={{
                                    background: "rgba(8,18,32,0.92)",
                                    backdropFilter: "blur(20px) saturate(1.2)",
                                    border: "1px solid rgba(255,133,67,0.12)",
                                    boxShadow:
                                        "0 24px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05) inset",
                                }}
                            >
                                {/* Accent top line */}
                                <div
                                    className="h-[2px]"
                                    style={{
                                        background: "linear-gradient(90deg, #FF8543, #FF6B1A 40%, transparent 100%)",
                                    }}
                                />

                                <div className="p-5 md:p-6">
                                    {/* Region header */}
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-white font-serif font-bold text-lg md:text-xl leading-tight">
                                            {data.name}
                                        </h3>
                                        {isMobile && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveRegion(null);
                                                    setPinned(false);
                                                }}
                                                className="p-1.5 -mr-1 -mt-1 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[#FF8543]/50 text-[11px] md:text-xs tracking-[0.1em] uppercase font-medium mb-4">
                                        {data.tagline}
                                    </p>

                                    {/* Species */}
                                    <div className="flex flex-col gap-1.5">
                                        {data.species.map((sp, i) => (
                                            <Link
                                                key={i}
                                                href={`/product/${sp.productSlug}`}
                                                className="group flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-xl transition-all duration-200 hover:bg-white/[0.04]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <span className="text-lg leading-none">{sp.emoji}</span>
                                                <span className="text-[13px] md:text-sm text-slate-300 group-hover:text-white font-medium transition-colors flex-1">
                                                    {sp.name}
                                                </span>
                                                <span className="text-[11px] text-[#FF8543] opacity-0 group-hover:opacity-80 transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0">
                                                    &rarr;
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Instruction hint — bottom right, fades when card is shown */}
                <div
                    className="absolute bottom-6 right-6 md:bottom-8 md:right-10 z-10 transition-opacity duration-300"
                    style={{ opacity: data ? 0 : 0.5 }}
                >
                    <p className="text-slate-500 text-[11px] md:text-xs tracking-wide text-right">
                        {isMobile ? "Tap" : "Hover over"} a region<br />
                        <span className="text-slate-600">to see what we source</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
