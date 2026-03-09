"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, createCoordinates } from "@vnedyalk0v/react19-simple-maps";
import type { Position } from "@vnedyalk0v/react19-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, RotateCcw, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    "New Zealand": "NZ",
};

// Regional species data — only species with matching products
const REGIONAL_DATA: Record<string, {
    name: string;
    description: string;
    species: Array<{ name: string; desc: string; emoji: string; productSlug: string }>;
    images: string[];
}> = {
    "QLD": {
        name: "Queensland",
        description: "The Great Barrier Reef and tropical currents provide sweet, unique seafood.",
        species: [
            { name: "Barramundi", desc: "Iconic Australian sportfish, mild flavor.", emoji: "\u{1F41F}", productSlug: "barramundi-fillets-skin-on" },
            { name: "Mud Crab", desc: "Sweet, moist meat packed with flavor.", emoji: "\u{1F980}", productSlug: "cooked-mud-crabs" },
            { name: "Tiger Prawn", desc: "Crisp texture, sweet taste, bold stripes.", emoji: "\u{1F990}", productSlug: "large-cooked-tiger-prawns" }
        ],
        images: ["mud-crab-cooked", "jumbo-raw-tiger-prawns", "cooked-tiger-prawns-2"],
    },
    "NSW": {
        name: "New South Wales",
        description: "Pristine estuaries and deep off-shore canyons.",
        species: [
            { name: "Sydney Rock Oyster", desc: "Rich, creamy, with a lasting mineral tang.", emoji: "\u{1F9AA}", productSlug: "sydney-rock-bistro-oysters-1-dozen" },
            { name: "Yellowtail Kingfish", desc: "Firm, white flesh ideal for sashimi.", emoji: "\u{1F41F}", productSlug: "kingfish-sashimi" },
            { name: "Snapper", desc: "Delicate, sweet flavor with medium texture.", emoji: "\u{1F420}", productSlug: "local-snapper-fillets" }
        ],
        images: ["pacific-plate-oysters", "local-snapper-whole", "hira-masa-king-fish-whole"],
    },
    "SA": {
        name: "South Australia",
        description: "Cold, clean waters of the Great Australian Bight.",
        species: [
            { name: "Southern Rock Lobster", desc: "Premium, firm, sweet white meat.", emoji: "\u{1F99E}", productSlug: "cooked-southern-rock-lobster" },
            { name: "King George Whiting", desc: "Delicate, sweet flavor. A national treasure.", emoji: "\u{1F41F}", productSlug: "king-george-whiting-fillets" }
        ],
        images: ["king-george-whitining-whole", "wa-cray-fish-cooked"],
    },
    "TAS": {
        name: "Tasmania",
        description: "The coldest, purest waters in the world.",
        species: [
            { name: "Atlantic Salmon", desc: "Rich in Omega-3, buttery texture.", emoji: "\u{1F363}", productSlug: "salmon-fillets-skin-on" },
            { name: "Pacific Oysters", desc: "Plump, salty, and incredibly fresh.", emoji: "\u{1F9AA}", productSlug: "pacific-plate-oysters-1-dozen" },
            { name: "Ocean Trout", desc: "Vibrant color and a luxurious melt-in-the-mouth feel.", emoji: "\u{1F41F}", productSlug: "ocean-trout-fillets" }
        ],
        images: ["king-ora-salmon-whole", "ocean-trout-fillets", "tasmania-scallops-meat"],
    },
    "WA": {
        name: "Western Australia",
        description: "Wild, rugged coastlines spanning thousands of kilometers.",
        species: [
            { name: "Western Rock Lobster", desc: "Highly sought after for its rich, sweet flavor.", emoji: "\u{1F99E}", productSlug: "cooked-western-crayfish" }
        ],
        images: ["wa-cray-fish-live", "wa-cray-fish-cooked"],
    },
    "VIC": {
        name: "Victoria",
        description: "Stormy southern seas producing resilient, deep-flavored seafood.",
        species: [
            { name: "Scallops", desc: "Plump, sweet, and perfect for a quick sear.", emoji: "\u{1F9AA}", productSlug: "roe-on-tassie-scallops" }
        ],
        images: ["tasmania-scallops-meat", "tassie-scollop-meats"],
    },
    "NT": {
        name: "Northern Territory",
        description: "Vast tidal rivers and warm Arafura Sea waters.",
        species: [
            { name: "Spanish Mackerel", desc: "Thick, meaty steaks perfect for the BBQ.", emoji: "\u{1F41F}", productSlug: "spanish-mackerel-fillets" },
            { name: "Goldband Snapper", desc: "Exceptional eating with a firm, flaky texture.", emoji: "\u{1F420}", productSlug: "gold-band-snapper-fillets" },
            { name: "Mud Crab", desc: "Massive claws with incredibly sweet, rich meat.", emoji: "\u{1F980}", productSlug: "live-mud-crabs" }
        ],
        images: ["gold-band-snapper-whole", "spanish-mackerel-fillet", "live-mud-crabs"],
    },
    "NZ": {
        name: "New Zealand",
        description: "Crystal-clear waters surrounding the islands produce world-class seafood.",
        species: [
            { name: "Green-lipped Mussels", desc: "Plump, sweet, and uniquely New Zealand.", emoji: "\u{1F9AA}", productSlug: "greenlip-mussels-loose" },
            { name: "Crayfish", desc: "Sweet, succulent rock lobster from pristine waters.", emoji: "\u{1F99E}", productSlug: "cooked-western-crayfish" }
        ],
        images: ["fresh-black-mussels", "wa-cray-fish-live-2"],
    }
};

const DEFAULT_CENTER = createCoordinates(150, -30);

export default function RegionalMap() {
    const [activeRegion, setActiveRegion] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [geoData, setGeoData] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
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

    const handleMoveEnd = useCallback((position: Position) => {
        setZoom(position.zoom);
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev * 1.5, 5));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev / 1.5, 1));
    }, []);

    const handleReset = useCallback(() => {
        setZoom(1);
    }, []);

    const regionData = activeRegion ? REGIONAL_DATA[activeRegion] : null;
    const mapScale = isMobile ? 380 : 750;
    const projConfig = { scale: mapScale, center: DEFAULT_CENTER };

    if (!geoData) {
        return (
            <div className="w-full bg-[#0A192F] rounded-3xl overflow-hidden border border-theme-accent/20 shadow-2xl">
                <div className="relative w-full h-[500px] md:h-[600px] lg:h-[800px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-theme-accent/30 border-t-theme-accent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Loading map...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Info panel content — shared between mobile and desktop
    const infoPanelContent = regionData ? (
        <div className="px-4 md:px-6 lg:px-6 py-5 md:py-8 lg:py-6">
            <div className="max-w-4xl mx-auto lg:max-w-none">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div>
                        <p className="text-theme-accent text-xs font-bold tracking-[0.3em] uppercase mb-1">Regional Seafood</p>
                        <h3 className="text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-serif font-bold text-white drop-shadow-md">
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

                {/* Product Image Strip */}
                <div className="flex gap-3 overflow-x-auto pb-2 mb-6 md:mb-8 lg:mb-4 scrollbar-hide">
                    {regionData.images.map((img, idx) => (
                        <div key={idx} className="relative w-36 h-[120px] md:w-44 md:h-[130px] lg:w-full lg:h-[100px] flex-shrink-0 lg:flex-shrink rounded-xl overflow-hidden border border-white/10">
                            <Image
                                src={`/assets/products/${img}.webp`}
                                alt={`${regionData.name} seafood`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 144px, (max-width: 1024px) 176px, 300px"
                            />
                        </div>
                    ))}
                </div>

                <p className="text-slate-300 font-sans mb-6 md:mb-8 lg:mb-4 leading-relaxed max-w-2xl lg:max-w-none text-sm md:text-base lg:text-sm">
                    {regionData.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4 lg:gap-2">
                    {regionData.species.map((sp, idx) => (
                        <Link
                            key={idx}
                            href={`/product/${sp.productSlug}`}
                            className="block bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 lg:p-3 group hover:border-theme-accent/30 transition-all"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-10 lg:h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-2xl md:text-3xl lg:text-xl shadow-inner border border-white/5 group-hover:scale-110 group-hover:border-theme-accent/50 transition-all flex-shrink-0">
                                    {sp.emoji}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-sm md:text-base lg:text-sm tracking-wide mb-1 group-hover:text-theme-accent transition-colors">{sp.name}</h4>
                                    <p className="text-slate-400 text-xs md:text-sm lg:text-xs leading-snug">{sp.desc}</p>
                                    <span className="text-theme-accent text-xs font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                                        View Product &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="w-full bg-[#0A192F] rounded-3xl overflow-hidden border border-theme-accent/20 shadow-2xl">

            {/* Desktop: Side-by-side layout | Mobile: Stacked */}
            <div className="flex flex-col lg:flex-row">

                {/* Map Section */}
                <div className={`relative w-full lg:w-2/3 h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center ${!isMobile ? 'perspective-[1000px]' : ''}`}>

                    {/* Hero Text Overlay */}
                    <div className="absolute top-6 md:top-10 left-0 w-full z-20 pointer-events-none text-center flex flex-col items-center px-4">
                        <p className="text-theme-accent text-xs font-bold tracking-[0.3em] uppercase mb-2">Sourcing Map</p>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-2 md:mb-4">
                            Explore Our Waters
                        </h2>
                        <p className="hidden sm:block text-slate-300 max-w-lg mx-auto text-xs md:text-sm leading-relaxed backdrop-blur-sm bg-[#0A192F]/50 p-2 md:p-3 rounded-xl border border-white/5">
                            Discover the premium seafood species we source from the pristine waters around Australia &amp; New Zealand.
                            <span className="text-white font-semibold"> Tap a region to see what we catch.</span>
                        </p>
                        <p className="sm:hidden text-slate-400 text-xs mt-1">Pinch to zoom, drag to pan</p>
                    </div>

                    {/* Map Container */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

                        {/* 3D Transform Wrapper -- flat on mobile, isometric on desktop */}
                        <div
                            className="w-full h-full"
                            style={isMobile ? {} : {
                                transform: "rotateX(55deg) rotateZ(-30deg) translateZ(0)",
                                transformStyle: "preserve-3d",
                                transition: "all 0.5s ease-in-out",
                            }}
                        >
                            {/* Shadow Layer (Faux 3D Depth) -- desktop only */}
                            {!isMobile && (
                                <div className="absolute inset-0 translate-y-8 translate-x-4 mix-blend-multiply opacity-50 blur-md pointer-events-none">
                                    <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                        <ZoomableGroup center={DEFAULT_CENTER} zoom={zoom} minZoom={1} maxZoom={5} onMoveEnd={handleMoveEnd}>
                                            <Geographies geography={geoData}>
                                                {({ geographies }) =>
                                                    geographies.map((geo, idx) => (
                                                        <Geography key={`shadow-${geo.rsmKey || idx}`} geography={geo} fill="#000000" stroke="none" />
                                                    ))
                                                }
                                            </Geographies>
                                        </ZoomableGroup>
                                    </ComposableMap>
                                </div>
                            )}

                            {/* Extrusion / Base Layer (Faux 3D Depth) -- desktop only */}
                            {!isMobile && (
                                <div className="absolute inset-0 translate-y-3 translate-x-1.5 pointer-events-none">
                                    <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                        <ZoomableGroup center={DEFAULT_CENTER} zoom={zoom} minZoom={1} maxZoom={5} onMoveEnd={handleMoveEnd}>
                                            <Geographies geography={geoData}>
                                                {({ geographies }) =>
                                                    geographies.map((geo, idx) => (
                                                        <Geography key={`base-${geo.rsmKey || idx}`} geography={geo} fill="#020C1B" stroke="#020C1B" strokeWidth={1} />
                                                    ))
                                                }
                                            </Geographies>
                                        </ZoomableGroup>
                                    </ComposableMap>
                                </div>
                            )}

                            {/* Interactive Top Layer */}
                            <div className="absolute inset-0 pointer-events-auto">
                                <ComposableMap projection="geoMercator" projectionConfig={projConfig} className="w-full h-full">
                                    <ZoomableGroup center={DEFAULT_CENTER} zoom={zoom} minZoom={1} maxZoom={5} onMoveEnd={handleMoveEnd}>
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
                                    </ZoomableGroup>
                                </ComposableMap>
                            </div>

                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                        <button
                            onClick={handleZoomIn}
                            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-theme-accent/80 hover:border-theme-accent transition-all"
                            aria-label="Zoom in"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-theme-accent/80 hover:border-theme-accent transition-all"
                            aria-label="Zoom out"
                        >
                            <Minus size={16} />
                        </button>
                        <button
                            onClick={handleReset}
                            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-theme-accent/80 hover:border-theme-accent transition-all"
                            aria-label="Reset zoom"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <p className="hidden md:block text-slate-500 text-[10px] text-center mt-1 leading-tight max-w-[72px]">
                            Scroll to zoom<br />Drag to pan
                        </p>
                    </div>

                </div>

                {/* Desktop Info Panel — always visible, right side */}
                <div className="hidden lg:block w-full lg:w-1/3 lg:h-[700px] overflow-y-auto border-l border-white/10">
                    {infoPanelContent ? (
                        infoPanelContent
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                <MapPin size={28} className="text-theme-accent/60" />
                            </div>
                            <h3 className="text-white font-serif font-bold text-xl mb-2">Select a Region</h3>
                            <p className="text-slate-400 text-sm max-w-[200px] leading-relaxed">
                                Click on any highlighted region on the map to explore the species we source from those waters.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Mobile Info Panel — below the map with animation */}
            <div className="lg:hidden">
                <AnimatePresence>
                    {activeRegion && regionData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="overflow-hidden border-t border-white/10"
                        >
                            {infoPanelContent}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
