/**
 * Space Pixel Avatar & Curated Color System for SaveDino
 *
 * Provides 24+ handcrafted space & arcade 8x8 pixel art sprites
 * and 16+ harmonious complementary color palettes.
 */

export interface SpacePixelArt {
  id: string;
  name: string;
  matrix: number[][]; // 8x8 grid (0 = transparent, 1 = foreground, 2 = accent glint/visor/flame)
}

export interface ColorScheme {
  id: string;
  name: string;
  bgHex: string;
  bgGradient: [string, string];
  borderColor: string;
  fgHex: string;
  accentHex: string;
}

// -------------------------------------------------------------
// 1. EXPANDED CATALOG OF 24 HANDCRAFTED SPACE PIXEL ARTS
// -------------------------------------------------------------
export const SPACE_PIXEL_ARTS: SpacePixelArt[] = [
  {
    id: "dino",
    name: "Arcade Dino",
    matrix: [
      [0, 0, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 2, 1, 1, 0], // Eye
      [0, 0, 0, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0], // Legs
    ],
  },
  {
    id: "astronaut",
    name: "Astronaut",
    matrix: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 2, 2, 2, 1, 1], // Visor
      [1, 1, 2, 2, 2, 2, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: "rocket",
    name: "Star Rocket",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0], // Porthole
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0], // Flame
    ],
  },
  {
    id: "ufo",
    name: "Flying Saucer",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0], // Glass dome
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1], // Disk body
      [1, 2, 1, 2, 2, 1, 2, 1], // Lights
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 2, 0, 0, 2, 0, 0], // Tractor beam emission
      [0, 2, 2, 0, 0, 2, 2, 0],
    ],
  },
  {
    id: "planet",
    name: "Ringed Saturn",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [2, 2, 1, 2, 1, 1, 2, 2], // Ring
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [2, 2, 0, 1, 1, 0, 2, 2],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: "meteor",
    name: "Asteroid Impact",
    matrix: [
      [2, 0, 0, 0, 0, 0, 0, 0], // Spark
      [0, 2, 0, 0, 1, 1, 1, 0],
      [0, 0, 2, 1, 1, 2, 1, 1], // Crater
      [0, 0, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 2, 1, 1, 2, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: "observatory",
    name: "Telescope Dome",
    matrix: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0], // Aperture slit
      [1, 1, 1, 2, 2, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0], // Door
      [1, 1, 1, 1, 1, 1, 1, 1], // Foundation
    ],
  },
  {
    id: "satellite",
    name: "Orbital Satellite",
    matrix: [
      [1, 1, 0, 0, 0, 0, 1, 1], // Solar panels
      [1, 2, 1, 0, 0, 1, 2, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [0, 0, 1, 2, 2, 1, 0, 0], // Comms dish
      [0, 0, 1, 2, 2, 1, 0, 0],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 2, 1, 0, 0, 1, 2, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
    ],
  },
  {
    id: "alien",
    name: "Alien Scout",
    matrix: [
      [1, 0, 0, 0, 0, 0, 0, 1], // Antennae
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0], // Head
      [1, 1, 2, 1, 1, 2, 1, 1], // Big eyes
      [1, 1, 2, 1, 1, 2, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0], // Smile
      [0, 1, 0, 1, 1, 0, 1, 0],
    ],
  },
  {
    id: "cannon",
    name: "Laser Cannon",
    matrix: [
      [0, 0, 0, 0, 0, 0, 2, 2], // Laser blast
      [0, 0, 1, 1, 1, 1, 1, 2],
      [0, 1, 1, 2, 1, 1, 1, 2], // Energy core
      [1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0], // Grip
      [0, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: "supernova",
    name: "Supernova Star",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [1, 1, 2, 2, 2, 2, 1, 1], // Fusion core
      [1, 1, 2, 2, 2, 2, 1, 1],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    id: "radar",
    name: "Deep Space Radar",
    matrix: [
      [0, 0, 0, 2, 2, 0, 0, 0], // Signal wave
      [0, 0, 2, 0, 0, 2, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0], // Parabolic dish
      [1, 1, 2, 1, 1, 2, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0], // Tripod
      [0, 1, 1, 0, 0, 1, 1, 0],
    ],
  },
  {
    id: "rover",
    name: "Mars Rover",
    matrix: [
      [0, 0, 2, 0, 0, 0, 0, 0], // Camera mast
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0], // Chassis
      [1, 1, 2, 1, 1, 2, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 0, 0, 1, 1, 1], // Rocker wheels
      [1, 2, 1, 0, 0, 1, 2, 1],
    ],
  },
  {
    id: "shuttle",
    name: "Space Shuttle",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0], // Cockpit
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1], // Wings
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 2, 1, 1, 2, 0, 0], // Thrusters
    ],
  },
  {
    id: "blackhole",
    name: "Black Hole Singularity",
    matrix: [
      [0, 0, 2, 2, 2, 2, 0, 0], // Accretion disk
      [0, 2, 1, 1, 1, 1, 2, 0],
      [2, 1, 1, 0, 0, 1, 1, 2], // Void event horizon
      [2, 1, 0, 0, 0, 0, 1, 2],
      [2, 1, 0, 0, 0, 0, 1, 2],
      [2, 1, 1, 0, 0, 1, 1, 2],
      [0, 2, 1, 1, 1, 1, 2, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
    ],
  },
  {
    id: "lander",
    name: "Lunar Lander",
    matrix: [
      [0, 0, 1, 1, 1, 1, 0, 0], // Ascent module
      [0, 1, 1, 2, 2, 1, 1, 0], // Windows
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1], // Descent stage
      [1, 2, 1, 1, 1, 1, 2, 1],
      [0, 1, 0, 2, 2, 0, 1, 0], // Legs
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 1, 0, 0, 0, 0, 1, 1], // Footpads
    ],
  },
  {
    id: "comet",
    name: "Ice Comet",
    matrix: [
      [0, 0, 0, 0, 0, 1, 1, 1], // Tail
      [0, 0, 0, 0, 1, 1, 2, 1],
      [0, 0, 0, 1, 1, 2, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 1, 0, 0, 0], // Icy coma
      [1, 1, 2, 1, 0, 0, 0, 0], // Nucleus
      [1, 2, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: "galaxy",
    name: "Spiral Galaxy",
    matrix: [
      [0, 0, 1, 1, 1, 0, 0, 0], // Top arm
      [0, 1, 1, 0, 1, 1, 0, 0],
      [1, 1, 0, 2, 2, 1, 1, 0],
      [1, 0, 2, 2, 2, 2, 0, 1], // Core
      [1, 0, 2, 2, 2, 2, 0, 1],
      [0, 1, 1, 2, 2, 0, 1, 1],
      [0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 1, 0, 0], // Bottom arm
    ],
  },
  {
    id: "dino-helmet",
    name: "Cosmic Dino",
    matrix: [
      [0, 0, 1, 1, 1, 1, 1, 0], // Helmet dome
      [0, 1, 1, 2, 2, 2, 1, 1], // Dino snout in visor
      [0, 1, 1, 2, 2, 2, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0], // Neck
      [1, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0], // Dino suit
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0], // Boots
    ],
  },
  {
    id: "crystal",
    name: "Astral Crystal",
    matrix: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0], // Facets
      [1, 1, 2, 2, 2, 2, 1, 1],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    id: "probe",
    name: "Voyager Probe",
    matrix: [
      [0, 0, 0, 2, 2, 0, 0, 0], // High-gain dish
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 2, 1, 1, 2, 1, 1],
      [0, 0, 0, 1, 1, 0, 0, 0], // Bus
      [1, 1, 1, 1, 1, 1, 1, 1], // Boom
      [0, 0, 1, 2, 2, 1, 0, 0], // RTG power
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0], // Magnetometer
    ],
  },
  {
    id: "sun",
    name: "Solar Flare",
    matrix: [
      [0, 1, 0, 0, 0, 0, 1, 0], // Rays
      [0, 0, 1, 1, 1, 1, 0, 0],
      [1, 1, 1, 2, 2, 1, 1, 1],
      [0, 1, 2, 2, 2, 2, 1, 0], // Corona
      [0, 1, 2, 2, 2, 2, 1, 0],
      [1, 1, 1, 2, 2, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0],
    ],
  },
  {
    id: "beacon",
    name: "Beacon Light",
    matrix: [
      [0, 0, 2, 2, 2, 2, 0, 0], // Signal light
      [0, 2, 1, 2, 2, 1, 2, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0], // Tower
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1], // Base
    ],
  },
  {
    id: "plasma-orb",
    name: "Energy Plasma Orb",
    matrix: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 1], // Blinding core
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
];

// -------------------------------------------------------------
// 2. CURATED 16 COMPLEMENTARY COLOR SCHEMES
// -------------------------------------------------------------
export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: "electric-violet",
    name: "Electric Violet",
    bgHex: "#150f28",
    bgGradient: ["#150f28", "#271549"],
    borderColor: "#581c87",
    fgHex: "#8b5cf6",
    accentHex: "#ffffff",
  },
  {
    id: "emerald-nebula",
    name: "Emerald Nebula",
    bgHex: "#041f18",
    bgGradient: ["#041f18", "#083e30"],
    borderColor: "#047857",
    fgHex: "#10b981",
    accentHex: "#a7f3d0",
  },
  {
    id: "cosmic-cyan",
    name: "Cosmic Cyan",
    bgHex: "#051f2c",
    bgGradient: ["#051f2c", "#0a3a52"],
    borderColor: "#0284c7",
    fgHex: "#06b6d4",
    accentHex: "#ffffff",
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    bgHex: "#260e03",
    bgGradient: ["#260e03", "#451a05"],
    borderColor: "#b45309",
    fgHex: "#f59e0b",
    accentHex: "#fef08a",
  },
  {
    id: "laser-pink",
    name: "Laser Pink",
    bgHex: "#240616",
    bgGradient: ["#240616", "#450a2b"],
    borderColor: "#be185d",
    fgHex: "#ec4899",
    accentHex: "#fce7f3",
  },
  {
    id: "sky-horizon",
    name: "Sky Horizon",
    bgHex: "#091629",
    bgGradient: ["#091629", "#112c52"],
    borderColor: "#0369a1",
    fgHex: "#38bdf8",
    accentHex: "#ffffff",
  },
  {
    id: "neon-matrix",
    name: "Neon Matrix",
    bgHex: "#06180f",
    bgGradient: ["#06180f", "#0c301e"],
    borderColor: "#15803d",
    fgHex: "#4ade80",
    accentHex: "#ffffff",
  },
  {
    id: "hyperdrive-purple",
    name: "Hyperdrive Purple",
    bgHex: "#170524",
    bgGradient: ["#170524", "#320b4d"],
    borderColor: "#7e22ce",
    fgHex: "#a855f7",
    accentHex: "#fae8ff",
  },
  {
    id: "asteroid-gold",
    name: "Asteroid Gold",
    bgHex: "#201604",
    bgGradient: ["#201604", "#3d2b07"],
    borderColor: "#a16207",
    fgHex: "#eab308",
    accentHex: "#ffffff",
  },
  {
    id: "quantum-indigo",
    name: "Quantum Indigo",
    bgHex: "#0d0e24",
    bgGradient: ["#0d0e24", "#1b1d47"],
    borderColor: "#4338ca",
    fgHex: "#6366f1",
    accentHex: "#e0e7ff",
  },
  {
    id: "supernova-crimson",
    name: "Supernova Crimson",
    bgHex: "#24050e",
    bgGradient: ["#24050e", "#450a1a"],
    borderColor: "#be123c",
    fgHex: "#f43f5e",
    accentHex: "#fef08a",
  },
  {
    id: "aqua-stellar",
    name: "Aqua Stellar",
    bgHex: "#041c1e",
    bgGradient: ["#041c1e", "#093b3f"],
    borderColor: "#0f766e",
    fgHex: "#2dd4bf",
    accentHex: "#ffffff",
  },
  {
    id: "deep-space-slate",
    name: "Deep Space Slate",
    bgHex: "#121315",
    bgGradient: ["#121315", "#1c1d21"],
    borderColor: "#38393e",
    fgHex: "#f3f4f6",
    accentHex: "#8b5cf6",
  },
  {
    id: "plasma-orange",
    name: "Plasma Orange",
    bgHex: "#250d03",
    bgGradient: ["#250d03", "#431505"],
    borderColor: "#c2410c",
    fgHex: "#f97316",
    accentHex: "#ffedd5",
  },
  {
    id: "stellar-blue",
    name: "Stellar Blue",
    bgHex: "#081329",
    bgGradient: ["#081329", "#0f2347"],
    borderColor: "#1d4ed8",
    fgHex: "#3b82f6",
    accentHex: "#dbeafe",
  },
  {
    id: "atomic-lime",
    name: "Atomic Lime",
    bgHex: "#0d1a06",
    bgGradient: ["#0d1a06", "#1a330b"],
    borderColor: "#4d7c0f",
    fgHex: "#84cc16",
    accentHex: "#ecfccb",
  },
];

// Deterministic string hasher (DJB2)
function hashString(str: string): number {
  let hash = 5381;
  const normalized = (str || "savedino-explorer").trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  return Math.abs(hash >>> 0);
}

export interface SeedAvatarData {
  seed: string;
  characterName: string;
  colorSchemeName: string;
  bgHex: string;
  bgGradient: [string, string];
  borderColor: string;
  fgHex: string;
  accentHex: string;
  matrix: number[][];
}

/**
 * Generate visual profile deterministically from any seed string
 * by rotating through predefined space pixel arts and defined complementary color schemes.
 */
export function generateSeedProfile(inputSeed?: string | null): SeedAvatarData {
  const seed = inputSeed && inputSeed.trim().length > 0 ? inputSeed.trim() : "Astro-Dino-42";
  const hash = hashString(seed);

  // Rotate between predefined space pixel arts
  const artIdx = hash % SPACE_PIXEL_ARTS.length;
  const selectedArt = SPACE_PIXEL_ARTS[artIdx];

  // Rotate between predefined complementary color schemes
  const colorIdx = Math.floor(hash / SPACE_PIXEL_ARTS.length) % COLOR_SCHEMES.length;
  const selectedScheme = COLOR_SCHEMES[colorIdx];

  return {
    seed,
    characterName: selectedArt.name,
    colorSchemeName: selectedScheme.name,
    bgHex: selectedScheme.bgHex,
    bgGradient: selectedScheme.bgGradient,
    borderColor: selectedScheme.borderColor,
    fgHex: selectedScheme.fgHex,
    accentHex: selectedScheme.accentHex,
    matrix: selectedArt.matrix,
  };
}

// Preset Random Seed Generator for rolling new avatars
const SEED_PREFIXES = [
  "Astro",
  "Cosmic",
  "Solar",
  "Quantum",
  "Nebula",
  "Cyber",
  "Retro",
  "Lunar",
  "Orbital",
  "Stellar",
  "Nova",
  "Chrono",
  "Laser",
  "Arcade",
  "Pixel",
  "Galaxy",
  "Comet",
  "Hyper",
  "Vortex",
  "Matrix",
  "Plasma",
  "Photon",
  "Pulsar",
  "Radiant",
  "Apex",
];

const SEED_NOUNS = [
  "Dino",
  "Raptor",
  "Hunter",
  "Explorer",
  "Pilot",
  "Radar",
  "Seeker",
  "Rover",
  "Astronaut",
  "Voyager",
  "Comet",
  "Scout",
  "Watcher",
  "Beacon",
  "Pioneer",
  "Shuttle",
  "Lander",
  "Crystal",
  "Star",
  "Cruiser",
  "Saucer",
  "Cannon",
  "Orbit",
  "Signal",
  "Ranger",
];

export function getRandomSeed(): string {
  const prefix = SEED_PREFIXES[Math.floor(Math.random() * SEED_PREFIXES.length)];
  const noun = SEED_NOUNS[Math.floor(Math.random() * SEED_NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100); // 100 - 999 for high entropy
  return `${prefix}-${noun}-${num}`;
}
