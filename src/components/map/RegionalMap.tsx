"use client";

import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Map region IDs from the JSON to standard state abbreviations
const regionMapping: Record<string, string> = {
    "Queensland": "QLD",
    "New South Wales": "NSW",
    "Victoria": "VIC",
    "Tasmania": "TAS",
    "South Australia": "SA",
    "Western Australia": "WA",
    "Northern Territory": "NT",
    "Australian Capital Territory": "ACT",
};

// Regional species data
const REGIONAL_DATA: Record<string, {
    name: string;
    description: string;
    species: Array<{ name: string, desc: string, emoji: string }>;
    categorySlug?: string;
}> = {
    "QLD": {
        name: "Queensland",
        description: "The Great Barrier Reef and tropical currents provide sweet, unique seafood.",
        species: [
            { name: "Barramundi", desc: "Iconic Australian sportfish, mild flavor.", emoji: "🐟" },
            { name: "Mud Crab", desc: "Sweet, moist meat packed with flavor.", emoji: "🦀" },
            { name: "Tiger Prawn", desc: "Crisp texture, sweet taste, bold stripes.", emoji: "🦐" }
        ],
        categorySlug: "prawns",
    },
    "NSW": {
        name: "New South Wales",
        description: "Pristine estuaries and deep off-shore canyons.",
        species: [
            { name: "Sydney Rock Oyster", desc: "Rich, creamy, with a lasting mineral tang.", emoji: "🦪" },
            { name: "Yellowtail Kingfish", desc: "Firm, white flesh ideal for sashimi.", emoji: "🐟" },
            { name: "Snapper", desc: "Delicate, sweet flavor with medium texture.", emoji: "🐠" }
        ],
        categorySlug: "oyster",
    },
    "SA": {
        name: "South Australia",
        description: "Cold, clean waters of the Great Australian Bight.",
        species: [
            { name: "Southern Rock Lobster", desc: "Premium, firm, sweet white meat.", emoji: "🦞" },
            { name: "King George Whiting", desc: "Delicate, sweet flavor. A national treasure.", emoji: "🐟" },
            { name: "Blue Swimmer Crab", desc: "Sweet, nutty flavor with delicate meat.", emoji: "🦀" }
        ],
        categorySlug: "crabs-lobsters-bugs",
    },
    "TAS": {
        name: "Tasmania",
        description: "The coldest, purest waters in the world.",
        species: [
            { name: "Atlantic Salmon", desc: "Rich in Omega-3, buttery texture.", emoji: "🍣" },
            { name: "Pacific Oysters", desc: "Plump, salty, and incredibly fresh.", emoji: "🦪" },
            { name: "Ocean Trout", desc: "Vibrant color and a luxurious melt-in-the-mouth feel.", emoji: "🐟" }
        ],
        categorySlug: "fish-fillet",
    },
    "WA": {
        name: "Western Australia",
        description: "Wild, rugged coastlines spanning thousands of kilometers.",
        species: [
            { name: "Western Rock Lobster", desc: "Highly sought after for its rich, sweet flavor.", emoji: "🦞" },
            { name: "Pearl Meat", desc: "A rare delicacy, sweet and firm like abalone.", emoji: "🐚" },
            { name: "Dhufish", desc: "The ultimate WA table fish, superb thick white fillets.", emoji: "🐟" }
        ],
        categorySlug: "shellfish",
    },
    "VIC": {
        name: "Victoria",
        description: "Stormy southern seas producing resilient, deep-flavored seafood.",
        species: [
            { name: "Abalone", desc: "Highly prized, sweet buttery flavor and firm texture.", emoji: "🐚" },
            { name: "Scallops", desc: "Plump, sweet, and perfect for a quick sear.", emoji: "🦪" },
            { name: "Gummy Shark", desc: "Boneless, sweet white fillets. Classic 'flake'.", emoji: "🦈" }
        ],
        categorySlug: "shellfish",
    },
    "NT": {
        name: "Northern Territory",
        description: "Vast tidal rivers and warm Arafura Sea waters.",
        species: [
            { name: "Spanish Mackerel", desc: "Thick, meaty steaks perfect for the BBQ.", emoji: "🐟" },
            { name: "Goldband Snapper", desc: "Exceptional eating with a firm, flaky texture.", emoji: "🐠" },
            { name: "Mud Crab", desc: "Massive claws with incredibly sweet, rich meat.", emoji: "🦀" }
        ],
        categorySlug: "whole-fish",
    }
};

export default function RegionalMap() {
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [geoData, setGeoData] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetch("/australia.geojson")
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error("Failed to load geojson:", err));
    }, []);

    const regionData = activeRegion ? REGIONAL_DATA[activeRegion] : null;
    const mapScale = isMobile ? 480 : 800;
    const projConfig = { scale: mapScale, center: createCoordinates(135, -28) };

    if (!geoData) {
        return (
            <div className="w-full bg-[#0A192F] rounded-3xl overflow-hidden border border-[#FF8543]/20 shadow-2xl">
                <div className="relative w-full h-[400px] md:h-[600px] lg:h-[800px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#FF8543]/30 border-t-[#FF8543] rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading map...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#0A192F] rounded-3xl overflow-hidden border border-[#FF8543]/20 shadow-2xl">

            {/* Map Section */}
            <div className={`relative w-full h-[400px] md:h-[600px] lg:h-[800px] flex items-center justify-center ${!isMobile ? 'perspective-[1000px]' : ''}`}>

                {/* Hero Text Overlay */}
                <div className="absolute top-6 md:top-10 left-0 w-full z-20 pointer-events-none text-center flex flex-col items-center px-4">
                    <p className="text-[#FF8543] text-xs font-bold tracking-[0.3em] uppercase mb-2">Sourcing Map</p>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 md:mb-4">
                        Explore Our Waters
                    </h2>
                    <p className="hidden sm:block text-slate-300 max-w-lg mx-auto text-xs md:text-sm leading-relaxed backdrop-blur-sm bg-[#0A192F]/50 p-2 md:p-3 rounded-xl border border-white/5">
                        Discover the premium seafood species we source from the pristine waters around Australia.
                        <span className="text-white font-semibold"> Tap a region to see what we catch.</span>
                    </p>
                </div>

                {/* Map Container — flat on mobile, oversized isometric on desktop */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isMobile ? 'w-full h-full' : 'w-[120%] h-[120%] -mt-20'}`}>

                    {/* 3D Transform Wrapper — flat on mobile, isometric on desktop */}
                    <div
                        className="w-full h-full"
                        style={isMobile ? {} : {
                            transform: "rotateX(55deg) rotateZ(-30deg) translateZ(0)",
                            transformStyle: "preserve-3d",
                            transition: "all 0.5s ease-in-out",
                        }}
                    >
                        {/* Shadow Layer (Faux 3D Depth) — desktop only */}
                        {!isMobile && (
                            <div className="absolute inset-0 translate-y-8 translate-x-4 mix-blend-multiply opacity-50 blur-md pointer-events-none">
                                <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                    <Geographies geography={geoData}>
                                        {({ geographies }) =>
                                            geographies.map((geo, idx) => (
                                                <Geography key={`shadow-${geo.rsmKey || idx}`} geography={geo} fill="#000000" stroke="none" />
                                            ))
                                        }
                                    </Geographies>
                                </ComposableMap>
                            </div>
                        )}

                        {/* Extrusion / Base Layer (Faux 3D Depth) — desktop only */}
                        {!isMobile && (
                            <div className="absolute inset-0 translate-y-3 translate-x-1.5 pointer-events-none">
                                <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                    <Geographies geography={geoData}>
                                        {({ geographies }) =>
                                            geographies.map((geo, idx) => (
                                                <Geography key={`base-${geo.rsmKey || idx}`} geography={geo} fill="#020C1B" stroke="#020C1B" strokeWidth={1} />
                                            ))
                                        }
                                    </Geographies>
                                </ComposableMap>
                            </div>
                        )}

                        {/* Interactive Top Layer */}
                        <div className="absolute inset-0 pointer-events-auto">
                            <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                <Geographies geography={geoData}>
                                    {({ geographies }) =>
                                        geographies.map((geo, idx) => {
                                            const regionName = geo.properties.STATE_NAME;
                                            const regionCode = regionMapping[regionName] || null;
                                            const isActive = activeRegion === regionCode;
                                            const isSupported = !!regionCode && !!REGIONAL_DATA[regionCode];

                                            return (
                                                <Geography
                                                    key={`top-${geo.rsmKey || idx}`}
                                                    geography={geo}
                                                    onClick={() => {
                                                        if (isSupported) setActiveRegion(isActive ? null : regionCode);
                                                    }}
                                                    style={{
                                                        default: {
                                                            fill: isActive ? "#FF8543" : "#d1d5db",
                                                            stroke: "#0A192F",
                                                            strokeWidth: 0.5,
                                                            outline: "none",
                                                            transform: isActive ? "translateZ(20px)" : "translateZ(0px)",
                                                            transition: "all 0.3s ease"
                                                        },
                                                        hover: {
                                                            fill: isActive ? "#FF8543" : "#e5e7eb",
                                                            stroke: "#0A192F",
                                                            strokeWidth: 0.5,
                                                            outline: "none",
                                                            cursor: isSupported ? "pointer" : "default",
                                                            transform: isActive ? "translateZ(20px)" : "translateZ(10px)",
                                                            transition: "all 0.3s ease"
                                                        },
                                                        pressed: {
                                                            outline: "none",
                                                            transform: "translateZ(5px)"
                                                        },
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>
                            </ComposableMap>
                        </div>

                    </div>
                </div>

            </div>

            {/* Region Info Panel — Below the map */}
            <AnimatePresence>
                {activeRegion && regionData && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/10 px-4 md:px-6 lg:px-10 py-5 md:py-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex justify-between items-start mb-4 md:mb-6">
                                    <div>
                                        <p className="text-[#FF8543] text-xs font-bold tracking-[0.3em] uppercase mb-1">Regional Seafood</p>
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-md">
                                            {regionData.name}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveRegion(null)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white mt-1"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <p className="text-slate-300 font-sans mb-6 md:mb-8 leading-relaxed max-w-2xl text-sm md:text-base">
                                    {regionData.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                                    {regionData.species.map((sp, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 group hover:border-[#FF8543]/30 transition-all">
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-2xl md:text-3xl shadow-inner border border-white/5 mb-3 md:mb-4 group-hover:scale-110 group-hover:border-[#FF8543]/50 transition-all">
                                                {sp.emoji}
                                            </div>
                                            <h4 className="text-white font-bold text-sm md:text-base tracking-wide mb-1 group-hover:text-[#FF8543] transition-colors">{sp.name}</h4>
                                            <p className="text-slate-400 text-xs md:text-sm leading-snug">{sp.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={regionData.categorySlug ? `/our-business/online-delivery?category=${regionData.categorySlug}` : "/our-business/online-delivery"}
                                    className="inline-block bg-gradient-to-r from-[#FF8543] to-[#E2743A] hover:to-[#c45e2e] text-white font-bold py-3 md:py-3.5 px-6 md:px-8 rounded-xl shadow-[0_4px_14px_rgba(255,133,67,0.4)] hover:shadow-[0_6px_20px_rgba(255,133,67,0.6)] transition-all uppercase tracking-wider text-xs md:text-sm"
                                >
                                    Shop {regionData.name} Products
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
