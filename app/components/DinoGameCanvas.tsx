"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { audioSynth } from "./AudioSynthesizer";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface DinoGameCanvasProps {
  onScoreUpdate?: (score: number, high: number, meteorsDestroyed: number) => void;
  onNightModeChange?: (isNight: boolean) => void;
  nightModeOverride?: boolean | null;
  onOpenLeaderboard?: () => void;
}

interface Meteor {
  id: number;
  type: "small" | "medium" | "giant";
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  hp: number;
}

interface ExpandingBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  distanceTraveled: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

const MAX_CHARGES = 3;
const RECHARGE_FRAMES_PER_CHARGE = 40; // ~0.65s per charge

// Offscreen Sprite Cache for High-Performance 60fps Blitting
const spriteCache: Record<string, HTMLCanvasElement> = {};

// 8-Bit Pixel Art Color Palette for Retro Asteroid Sprites
const PIXEL_PALETTE: Record<string, string> = {
  ".": "transparent",
  E: "#ef4444", // Outer plasma re-entry fire aura
  O: "#18181b", // Dark 8-bit pixel outline
  R: "#44403c", // Dark stone basalt
  M: "#78716c", // Mid stone
  H: "#a8a29e", // Light stone highlight
  W: "#f5f5f4", // Specular glint white
  C: "#0c0a09", // Deep crater cavity
  F: "#ea580c", // Magma fissure
  Y: "#fde047", // Molten heat core
};

// Handcrafted 8-Bit Retro Pixel Art Asteroid Matrices
const SMALL_ASTEROID = [
  "....EEEE....",
  "..EEOOOOEE..",
  ".EOOMMMMRROE.",
  ".EOMMHWMMMRE.",
  "EOMMMCYMMFFOE",
  "EOMMMCFFMFFOE",
  "EORMMMMMMRROE",
  ".EORRRRRRROE.",
  "..EEOOOOEE..",
  "....EEEE....",
];

const MEDIUM_ASTEROID = [
  ".....EEEEEE.....",
  "..EEEOOOOOOEEE..",
  ".EEOOMMMHHMMROOE",
  ".EOMMMHHWWHMMROE",
  "EOMMMMHWHHHMMCROE",
  "EOMMMMMHHHHMCYROE",
  "EOMMMCMMMMFFMCROE",
  "EOMMCYCMFFFFMMROE",
  "EOMMMCMMMFFMMRROE",
  "EOMMMMMMCMMMRROE",
  ".EORRRMMCYMRROE.",
  ".EORRRMMCMFRROE.",
  "..EEOOOOOOOOEE..",
  ".....EEEEEE.....",
];

const GIANT_ASTEROID = [
  ".......EEEEEEEE.......",
  "....EEEOOOOOOOOOEEE...",
  "..EEOOMMMHHHHHHMMROOE.",
  ".EEOOMMHHHWWWHHHMMROOE",
  ".EOMMMHHWWWWWHHHMMCROE",
  "EOMMMMMHHWWWHHHMCCYROE",
  "EOMMMMHHMMHHHMMMCCMROE",
  "EOMMMMCMMMMMMMMFFFMMROE",
  "EOMMMCYCMMMMFFFFYFFMROE",
  "EOMMMMCMMMMFFFFFFFMMROE",
  "EOMMMMMMMMCMMMMFFFMROE",
  "EOMMMMMMMCYCMMMMMMMRROE",
  "EORRRMMMMMCMMMMMMMRROE",
  ".EORRRMMMMCYCMMMMRROE.",
  ".EORRRRMMMCCCMMMRRROE.",
  "..EEOORRRRRRRRRROOEE..",
  "....EEEOOOOOOOOOEEE...",
  ".......EEEEEEEE.......",
];

function getMeteorSprite(
  type: "small" | "medium" | "giant",
  rad: number,
  step: number
): HTMLCanvasElement {
  const key = `${type}_${rad}_${step}`;
  if (spriteCache[key]) return spriteCache[key];

  const grid =
    type === "giant" ? GIANT_ASTEROID : type === "medium" ? MEDIUM_ASTEROID : SMALL_ASTEROID;

  const rows = grid.length;
  const cols = grid[0].length;
  const pixelSize = Math.max(2, Math.floor((rad * 2.2) / cols));
  const width = cols * pixelSize;
  const height = rows * pixelSize;

  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const sCtx = c.getContext("2d");
  if (!sCtx) return c;

  sCtx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    const rowStr = grid[r];
    for (let col = 0; col < cols; col++) {
      const char = rowStr[col];
      const color = PIXEL_PALETTE[char];
      if (color && color !== "transparent") {
        sCtx.fillStyle = color;
        sCtx.fillRect(col * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  spriteCache[key] = c;
  return c;
}

export const DinoGameCanvas: React.FC<DinoGameCanvasProps> = ({
  onScoreUpdate,
  onNightModeChange,
  nightModeOverride,
  onOpenLeaderboard,
}) => {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  const nightModeOverrideRef = useRef<boolean | null>(nightModeOverride ?? null);
  nightModeOverrideRef.current = nightModeOverride ?? null;

  // React State for HUD & Theme
  const [gameState, setGameState] = useState<"IDLE" | "RUNNING" | "GAMEOVER">("IDLE");
  const [isNight, setIsNight] = useState<boolean>(() => {
    if (nightModeOverride !== undefined && nightModeOverride !== null) {
      return nightModeOverride;
    }
    if (typeof document !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        document.documentElement.classList.contains("night-mode")
      );
    }
    return false;
  });
  const isNightRef = useRef<boolean>(nightModeOverride ?? false);
  const [laserCharges, setLaserCharges] = useState<number>(MAX_CHARGES);
  const [rechargeProgress, setRechargeProgress] = useState<number>(1.0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  useEffect(() => {
    const currentNight =
      nightModeOverride !== undefined && nightModeOverride !== null
        ? nightModeOverride
        : typeof document !== "undefined"
          ? document.documentElement.classList.contains("dark") ||
            document.documentElement.classList.contains("night-mode")
          : false;
    setIsNight(currentNight);
    isNightRef.current = currentNight;
  }, [nightModeOverride]);

  // Load official Chromium sprite sheet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = "/offline-sprite-1x.png";
      img.onload = () => {
        spriteImgRef.current = img;
      };
    }
  }, []);

  // Engine State Ref
  const gameLoopRef = useRef<number | null>(null);
  const lastFireTimeRef = useRef<number>(0);
  const stateRef = useRef({
    gameState: "IDLE" as "IDLE" | "RUNNING" | "GAMEOVER",
    score: 0,
    highScore: 0,
    meteorsDestroyed: 0,
    speed: 6.0,
    groundY: 148,
    frameCount: 0,
    gameOverTimestamp: 0,
    screenShake: 0,

    // 3-Charge Laser Battery
    charges: MAX_CHARGES,
    rechargeTimer: 0,
    balls: [] as ExpandingBall[],

    // Horizon Line Double-Buffer
    horizonX1: 0,
    horizonX2: 600,
    sourceX1: 2,
    sourceX2: 602,

    // Dino State (Crouches into shooting stance when firing, supports double jump)
    dino: {
      x: 50,
      y: 101, // 148 - 47
      vy: 0,
      width: 44,
      height: 47,
      duckWidth: 59,
      duckHeight: 25,
      isJumping: false,
      jumpCount: 0, // 0 = ground, 1 = first jump, 2 = double jump
      isShootingCrouch: false,
      shootCrouchTimer: 0,
      legFrame: 0,
      fireGlowTimer: 0,
    },

    // Physics
    gravity: 0.6,
    jumpVelocity: -10.0,

    // Entities
    meteors: [] as Meteor[],
    particles: [] as Particle[],
    clouds: [
      { x: 100, y: 25, speed: 0.4 },
      { x: 320, y: 40, speed: 0.3 },
      { x: 520, y: 20, speed: 0.5 },
    ],

    meteorSpawnTimer: 20,
  });

  // Load High Score (Local & Global DB Sync)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHi = localStorage.getItem("save_dino_laser_hi_score");
      if (savedHi) {
        const hi = parseInt(savedHi, 10);
        setHighScore(hi);
        stateRef.current.highScore = hi;
      }
    }

    if (isAuthenticated) {
      fetch("/api/arcade/leaderboard", { cache: "no-store" })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.currentUser?.score) {
            const dbHi = json.currentUser.score;
            if (dbHi > stateRef.current.highScore) {
              setHighScore(dbHi);
              stateRef.current.highScore = dbHi;
              if (typeof window !== "undefined") {
                localStorage.setItem("save_dino_laser_hi_score", dbHi.toString());
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Fire Expanding Plasma Ball (Shoots horizontally straight while Dino crouches)
  const fireLaser = useCallback(() => {
    const s = stateRef.current;

    // 1. If IDLE: Start game
    if (s.gameState === "IDLE") {
      s.gameState = "RUNNING";
      s.score = 0;
      s.meteorsDestroyed = 0;
      s.speed = 6.0;
      s.charges = MAX_CHARGES;
      s.rechargeTimer = 0;
      s.meteors = [];
      s.balls = [];
      s.particles = [];
      s.horizonX1 = 0;
      s.horizonX2 = 600;
      s.sourceX1 = 2;
      s.sourceX2 = 602;
      s.dino.y = s.groundY - s.dino.height;
      s.dino.vy = 0;
      s.dino.isJumping = false;
      s.dino.jumpCount = 0;
      s.dino.isShootingCrouch = false;
      s.meteorSpawnTimer = 15;

      setGameState("RUNNING");
      setLaserCharges(MAX_CHARGES);
      setRechargeProgress(1.0);
      setScore(0);
      setMeteorsDestroyed(0);
      onScoreUpdate?.(0, s.highScore, 0);
      const initialNight = nightModeOverrideRef.current ?? false;
      isNightRef.current = initialNight;
      setIsNight(initialNight);
      audioSynth.playButtonClick();
      audioSynth.startMusic();
    }

    // 2. If GAMEOVER: Restart game
    if (s.gameState === "GAMEOVER") {
      const now = Date.now();
      if (now - s.gameOverTimestamp < 350) return;

      s.gameState = "RUNNING";
      s.score = 0;
      s.meteorsDestroyed = 0;
      s.speed = 6.0;
      s.charges = MAX_CHARGES;
      s.rechargeTimer = 0;
      s.meteors = [];
      s.balls = [];
      s.particles = [];
      s.horizonX1 = 0;
      s.horizonX2 = 600;
      s.sourceX1 = 2;
      s.sourceX2 = 602;
      s.dino.y = s.groundY - s.dino.height;
      s.dino.vy = 0;
      s.dino.isJumping = false;
      s.dino.jumpCount = 0;
      s.dino.isShootingCrouch = false;
      s.meteorSpawnTimer = 15;

      setGameState("RUNNING");
      setLaserCharges(MAX_CHARGES);
      setRechargeProgress(1.0);
      setScore(0);
      setMeteorsDestroyed(0);
      onScoreUpdate?.(0, s.highScore, 0);
      const initialNight = nightModeOverrideRef.current ?? false;
      isNightRef.current = initialNight;
      setIsNight(initialNight);
      audioSynth.playButtonClick();
      audioSynth.startMusic();
      return;
    }

    // 3. If RUNNING: Check Charges & Fire Rate Cooldown
    const now = Date.now();
    if (now - lastFireTimeRef.current < 260) {
      return; // Prevents accidental sequential bullet discharge / double-tap spam
    }

    if (s.charges <= 0) {
      audioSynth.playButtonClick();
      return;
    }

    lastFireTimeRef.current = now;

    // Consume 1 charge
    s.charges -= 1;
    setLaserCharges(s.charges);
    s.dino.fireGlowTimer = 12;
    audioSynth.playLaser();

    // Dino crouches into braced cannon stance when firing on ground
    if (!s.dino.isJumping) {
      s.dino.isShootingCrouch = true;
      s.dino.shootCrouchTimer = 10;
      s.dino.y = s.groundY - s.dino.duckHeight;
    }

    // Spawn expanding plasma ball from Dino's mouth
    const startX = s.dino.x + 52;
    const startY = s.dino.isJumping ? s.dino.y + 14 : s.groundY - 14;

    const speed = 14.5;

    s.balls.push({
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      vx: speed,
      vy: 0,
      radius: 9,
      maxRadius: 26, // expands to 52px diameter!
      distanceTraveled: 0,
    });

    // Muzzle sparks
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: startX,
        y: startY,
        vx: Math.random() * 5 + 3,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 3 + 2,
        color: "#00ffff",
        life: 10,
        maxLife: 10,
      });
    }
  }, []);

  // Jump & Double Jump Action
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === "IDLE" || s.gameState === "GAMEOVER") {
      fireLaser();
      return;
    }
    if (s.gameState === "RUNNING") {
      // First Jump from Ground
      if (!s.dino.isJumping || s.dino.jumpCount === 0) {
        s.dino.isJumping = true;
        s.dino.jumpCount = 1;
        s.dino.isShootingCrouch = false;
        s.dino.vy = s.jumpVelocity;
        audioSynth.playJump();

        // Ground takeoff dust puffs
        for (let i = 0; i < 5; i++) {
          s.particles.push({
            x: s.dino.x + 8 + Math.random() * 26,
            y: s.groundY - 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2 - 0.5,
            size: Math.random() * 2.5 + 1.5,
            color: "#9ca3af",
            life: 9,
            maxLife: 9,
          });
        }
      } else if (s.dino.isJumping && s.dino.jumpCount === 1) {
        // Double Jump in Mid-Air!
        s.dino.jumpCount = 2;
        s.dino.vy = s.jumpVelocity * 0.92; // Fresh upward boost
        audioSynth.playDoubleJump();

        // Mid-air energy thrust ring & sparks
        for (let i = 0; i < 9; i++) {
          s.particles.push({
            x: s.dino.x + 16 + (Math.random() - 0.5) * 18,
            y: s.dino.y + s.dino.height - 2,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 3 + 2, // blast downwards
            size: Math.random() * 3 + 2,
            color: Math.random() > 0.4 ? "#00ffff" : "#ffffff",
            life: 14,
            maxLife: 14,
          });
        }
      }
    }
  }, [fireLaser]);

  // Canvas Tap/Click Handler (Splits screen: Left 45% = Jump, Right 55% = Shoot)
  const handleCanvasInteraction = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const s = stateRef.current;
      if (s.gameState === "IDLE" || s.gameState === "GAMEOVER") {
        fireLaser();
        return;
      }

      let clientX = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
      } else if ("clientX" in e) {
        clientX = (e as React.MouseEvent).clientX;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0) {
        const relX = clientX - rect.left;
        if (relX < rect.width * 0.45) {
          jump();
        } else {
          fireLaser();
        }
      } else {
        fireLaser();
      }
    },
    [fireLaser, jump]
  );

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keystrokes if user is typing in an input, textarea, or editable element, or inside a modal/dialog
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.("dialog, [role='dialog'], [role='alertdialog']"))
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        fireLaser();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fireLaser, jump]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const s = stateRef.current;
      s.frameCount++;

      const CANVAS_WIDTH = 600;
      const CANVAS_HEIGHT = 175;
      const groundY = s.groundY;

      // 1. UPDATE GAME LOGIC
      if (s.gameState === "RUNNING") {
        s.score += 0.15;
        const currentScoreInt = Math.floor(s.score);

        if (
          currentScoreInt > 0 &&
          currentScoreInt % 100 === 0 &&
          Math.floor(s.score - 0.15) % 100 !== 0
        ) {
          audioSynth.playScore();
        }

        if (s.speed < 12) {
          s.speed += 0.0005;
        }

        if (s.screenShake > 0) {
          s.screenShake -= 0.5;
        }

        // ----------------------------------------------------
        // RECHARGE RECOVERY SYSTEM
        // ----------------------------------------------------
        if (s.charges < MAX_CHARGES) {
          s.rechargeTimer++;
          if (s.rechargeTimer >= RECHARGE_FRAMES_PER_CHARGE) {
            s.rechargeTimer = 0;
            s.charges++;
            setLaserCharges(s.charges);
          }
          if (s.frameCount % 4 === 0) {
            setRechargeProgress(s.rechargeTimer / RECHARGE_FRAMES_PER_CHARGE);
          }
        } else {
          s.rechargeTimer = 0;
          if (rechargeProgress !== 1.0) setRechargeProgress(1.0);
        }

        // Horizon Ground Scrolling
        s.horizonX1 -= s.speed;
        s.horizonX2 -= s.speed;
        if (s.horizonX1 <= -600) {
          s.horizonX1 = s.horizonX2 + 600;
          s.sourceX1 = Math.random() > 0.5 ? 602 : 2;
        }
        if (s.horizonX2 <= -600) {
          s.horizonX2 = s.horizonX1 + 600;
          s.sourceX2 = Math.random() > 0.5 ? 602 : 2;
        }

        // Shooting Crouch Stance Timer
        if (s.dino.shootCrouchTimer > 0) {
          s.dino.shootCrouchTimer--;
          if (s.dino.shootCrouchTimer <= 0) {
            s.dino.isShootingCrouch = false;
            if (!s.dino.isJumping) {
              s.dino.y = groundY - s.dino.height;
            }
          }
        }

        // Dino Physics (Jumping only, reset jumpCount upon touchdown)
        if (s.dino.isJumping) {
          s.dino.y += s.dino.vy;
          s.dino.vy += s.gravity;

          if (s.dino.y >= groundY - s.dino.height) {
            s.dino.y = groundY - s.dino.height;
            s.dino.isJumping = false;
            s.dino.jumpCount = 0;
            s.dino.vy = 0;
          }
        } else if (!s.dino.isShootingCrouch) {
          s.dino.y = groundY - s.dino.height;
          s.dino.jumpCount = 0;
          if (s.frameCount % 6 === 0) {
            s.dino.legFrame = (s.dino.legFrame + 1) % 2;
          }
        }

        if (s.dino.fireGlowTimer > 0) {
          s.dino.fireGlowTimer--;
        }

        // ----------------------------------------------------
        // SPAWN METEORS TOWARDS GROUND / DINO (PACED & ANTI-BUNCHING)
        // ----------------------------------------------------
        s.meteorSpawnTimer++;
        const baseInterval = Math.max(68, 128 - Math.floor(s.score / 40) * 4);
        if (s.meteorSpawnTimer >= baseInterval) {
          // Check if any existing meteor is within 130px of spawn entry zone
          const isSpawnZoneOccupied = s.meteors.some((m) => m.x > CANVAS_WIDTH - 130);

          if (!isSpawnZoneOccupied) {
            // Add randomized jitter to timer so spawns feel organic with breathing room
            s.meteorSpawnTimer = -Math.floor(Math.random() * 26);
            audioSynth.playMeteor();

            const startX = CANVAS_WIDTH + 25;
            const startY = -22 + Math.random() * 32;
            const targetX = s.dino.x + 8 + (Math.random() > 0.5 ? 0 : 35);
            const targetY = groundY - (Math.random() > 0.4 ? 18 : 34);

            const dx = targetX - startX;
            const dy = targetY - startY;
            const dist = Math.hypot(dx, dy);

            const randClass = Math.random();
            let meteorType: "small" | "medium" | "giant" = "medium";
            let size = 22;
            let speed = 3.6;

            if (randClass < 0.35) {
              meteorType = "small";
              size = 14 + Math.floor(Math.random() * 4);
              speed = 4.6 + (s.speed - 6) * 0.3 + Math.random() * 0.6;
            } else if (randClass < 0.75) {
              meteorType = "medium";
              size = 22 + Math.floor(Math.random() * 5);
              speed = 3.5 + (s.speed - 6) * 0.25 + Math.random() * 0.5;
            } else {
              meteorType = "giant";
              size = 32 + Math.floor(Math.random() * 8);
              speed = 2.5 + (s.speed - 6) * 0.2 + Math.random() * 0.4;
              // Giant meteors take longer to traverse, grant extra breather
              s.meteorSpawnTimer -= 22;
            }

            // Anti-overtake velocity guard: prevent fast small meteors from ramming preceding meteors
            const precedingMeteor = s.meteors[s.meteors.length - 1];
            if (precedingMeteor) {
              const prevSpeed = Math.hypot(precedingMeteor.vx, precedingMeteor.vy);
              if (speed > prevSpeed + 0.4) {
                speed = prevSpeed + 0.3;
              }
            }

            s.meteors.push({
              id: Date.now() + Math.random(),
              type: meteorType,
              x: startX,
              y: startY,
              vx: (dx / dist) * speed,
              vy: (dy / dist) * speed,
              size: size,
              radius: size / 2,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.07,
              hp: 1,
            });
          }
        }

        // ----------------------------------------------------
        // UPDATE EXPANDING PLASMA BALLS
        // ----------------------------------------------------
        for (let bIdx = s.balls.length - 1; bIdx >= 0; bIdx--) {
          const b = s.balls[bIdx];
          b.x += b.vx;
          b.y += b.vy;
          b.distanceTraveled += b.vx;

          // Expand radius smoothly as it travels horizontally
          if (b.radius < b.maxRadius) {
            b.radius += 0.22;
          }

          // Electric plasma sparks around the orb
          if (s.frameCount % 2 === 0) {
            s.particles.push({
              x: b.x - b.radius * 0.6 + (Math.random() - 0.5) * b.radius,
              y: b.y + (Math.random() - 0.5) * b.radius,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              size: Math.random() * 3 + 2,
              color: "#00ffff",
              life: 8,
              maxLife: 8,
            });
          }

          // Check hit against meteors
          let hitMeteor = false;

          for (let mIdx = s.meteors.length - 1; mIdx >= 0; mIdx--) {
            const m = s.meteors[mIdx];
            const dist = Math.hypot(b.x - (m.x + m.radius), b.y - (m.y + m.radius));

            if (dist < m.radius + b.radius + 4) {
              s.meteors.splice(mIdx, 1);
              hitMeteor = true;

              s.meteorsDestroyed++;
              setMeteorsDestroyed(s.meteorsDestroyed);

              const pts = m.type === "small" ? 50 : m.type === "giant" ? 30 : 40;
              s.score += pts;
              s.screenShake = m.type === "giant" ? 6 : 3.5;

              audioSynth.playExplosion();

              const particleCount = m.type === "giant" ? 36 : m.type === "small" ? 18 : 25;
              for (let p = 0; p < particleCount; p++) {
                const pAngle = Math.random() * Math.PI * 2;
                const pSpeed = Math.random() * (m.type === "giant" ? 6 : 4.5) + 1.2;
                s.particles.push({
                  x: m.x + m.radius,
                  y: m.y + m.radius,
                  vx: Math.cos(pAngle) * pSpeed,
                  vy: Math.sin(pAngle) * pSpeed,
                  size: Math.random() * (m.type === "giant" ? 5 : 3.5) + 2,
                  color:
                    Math.random() > 0.4 ? "#facc15" : Math.random() > 0.5 ? "#f97316" : "#ef4444",
                  life: 20,
                  maxLife: 20,
                });
              }
              break;
            }
          }

          if (hitMeteor || b.x > CANVAS_WIDTH + 80) {
            s.balls.splice(bIdx, 1);
          }
        }

        // ----------------------------------------------------
        // UPDATE METEORS & PARTICLES
        // ----------------------------------------------------
        for (let i = s.meteors.length - 1; i >= 0; i--) {
          const m = s.meteors[i];
          m.x += m.vx;
          m.y += m.vy;
          m.rotation += m.rotationSpeed;

          if (s.frameCount % 2 === 0) {
            s.particles.push({
              x: m.x + m.radius + (Math.random() - 0.5) * (m.radius * 0.8),
              y: m.y + m.radius + (Math.random() - 0.5) * (m.radius * 0.8),
              vx: -m.vx * 0.2 + (Math.random() - 0.5) * 1.5,
              vy: -m.vy * 0.2 + (Math.random() - 0.5) * 1.5,
              size: Math.random() * (m.type === "giant" ? 4 : 2.5) + 2,
              color: Math.random() > 0.5 ? "#f97316" : "#ef4444",
              life: m.type === "giant" ? 16 : 10,
              maxLife: m.type === "giant" ? 16 : 10,
            });
          }

          if (m.y >= groundY - 2 || m.x < -40) {
            if (m.y >= groundY - 2) {
              for (let p = 0; p < (m.type === "giant" ? 10 : 5); p++) {
                s.particles.push({
                  x: m.x,
                  y: groundY - 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 2 - 1,
                  size: Math.random() * 2.5 + 1,
                  color: "#737373",
                  life: 10,
                  maxLife: 10,
                });
              }
            }
            s.meteors.splice(i, 1);
          }
        }

        // ----------------------------------------------------
        // DINO COLLISION (JUMP OVER OR GET HIT)
        // ----------------------------------------------------
        const isCrouched = s.dino.isShootingCrouch;
        const dinoBox = isCrouched
          ? { x: s.dino.x + 4, y: s.dino.y + 6, width: 48, height: 18 }
          : { x: s.dino.x + 8, y: s.dino.y + 4, width: 28, height: 40 };

        let dinoHit = false;
        for (const m of s.meteors) {
          if (m.y < groundY - 6) {
            const mBox = {
              x: m.x + 4,
              y: m.y + 4,
              width: m.size - 8,
              height: m.size - 8,
            };

            if (
              dinoBox.x < mBox.x + mBox.width &&
              dinoBox.x + dinoBox.width > mBox.x &&
              dinoBox.y < mBox.y + mBox.height &&
              dinoBox.y + dinoBox.height > mBox.y
            ) {
              dinoHit = true;
              break;
            }
          }
        }

        if (dinoHit) {
          s.gameState = "GAMEOVER";
          s.gameOverTimestamp = Date.now();
          s.screenShake = 6;
          setGameState("GAMEOVER");
          audioSynth.playHit();

          for (let p = 0; p < 24; p++) {
            s.particles.push({
              x: s.dino.x + 20,
              y: s.dino.y + 20,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 4 - 2,
              size: Math.random() * 4 + 2,
              color: Math.random() > 0.5 ? "#ef4444" : "#535353",
              life: 25,
              maxLife: 25,
            });
          }

          const finalRunScore = Math.floor(s.score);
          const finalRunDestroyed = s.meteorsDestroyed;

          if (finalRunScore > s.highScore) {
            s.highScore = finalRunScore;
            setHighScore(s.highScore);
            if (typeof window !== "undefined") {
              localStorage.setItem("save_dino_laser_hi_score", s.highScore.toString());
            }
          }

          // Submit to global leaderboard if user is authenticated
          if (isAuthenticated && finalRunScore > 0) {
            fetch("/api/arcade/score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                score: finalRunScore,
                meteorsDestroyed: finalRunDestroyed,
              }),
            })
              .then((res) => res.json())
              .then((json) => {
                if (json.success) {
                  if (json.isNewHighScore) {
                    toast.success(
                      `🏆 New High Score! Global Rank #${json.rank} (${json.highScore.toLocaleString()} pts)`
                    );
                    if (json.highScore > s.highScore) {
                      s.highScore = json.highScore;
                      setHighScore(json.highScore);
                    }
                  }
                }
              })
              .catch(() => {});
          }
        }

        // Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Move Clouds
        s.clouds.forEach((cloud) => {
          cloud.x -= cloud.speed;
          if (cloud.x < -50) cloud.x = CANVAS_WIDTH + 50;
        });

        if (s.frameCount % 5 === 0) {
          setScore(Math.floor(s.score));
          if (onScoreUpdate) {
            onScoreUpdate(Math.floor(s.score), s.highScore, s.meteorsDestroyed);
          }
        }
      }

      // 2. CANVAS RENDERING
      ctx.save();
      if (s.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.screenShake;
        const shakeY = (Math.random() - 0.5) * s.screenShake;
        ctx.translate(shakeX, shakeY);
      }

      // Consistently respect the active theme without periodic score-based flickering
      const night = nightModeOverrideRef.current ?? isNightRef.current ?? false;
      if (isNightRef.current !== night) {
        isNightRef.current = night;
        setIsNight(night);
      }

      // Transparent Canvas Clear (Lets the smooth 700ms page background transition show through directly)
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.imageSmoothingEnabled = false;

      const mainColor = night ? "#e8eaed" : "#535353";
      const spriteImg = spriteImgRef.current;

      // Night Stars
      if (night) {
        ctx.fillStyle = "#ffffff";
        [
          { x: 45, y: 25 },
          { x: 130, y: 45 },
          { x: 210, y: 20 },
          { x: 340, y: 35 },
          { x: 430, y: 55 },
        ].forEach((st) => {
          ctx.fillRect(st.x, st.y, 2, 2);
        });
      }

      // Clouds
      s.clouds.forEach((cloud) => {
        if (spriteImg) {
          ctx.drawImage(spriteImg, 86, 2, 46, 14, cloud.x, cloud.y, 46, 14);
        } else {
          ctx.fillStyle = "#d3d3d3";
          ctx.fillRect(cloud.x, cloud.y, 40, 10);
        }
      });

      // Ground Line
      if (spriteImg) {
        ctx.drawImage(spriteImg, s.sourceX1, 54, 600, 12, s.horizonX1, groundY - 4, 600, 12);
        ctx.drawImage(spriteImg, s.sourceX2, 54, 600, 12, s.horizonX2, groundY - 4, 600, 12);
      } else {
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(CANVAS_WIDTH, groundY);
        ctx.stroke();
      }

      // Particles
      s.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      // ----------------------------------------------------
      // DRAW PIXELATED EXPANDING PLASMA BALL (8-BIT RETRO) - FAST ARCS
      // ----------------------------------------------------
      s.balls.forEach((b) => {
        ctx.save();
        const bx = Math.floor(b.x);
        const by = Math.floor(b.y);
        const r = Math.floor(b.radius);
        const pSize = Math.max(2, Math.floor(r / 7));

        // 1. Plasma Outer Corona
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bright Cyan Ring
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(bx, by, Math.floor(r * 0.78), 0, Math.PI * 2);
        ctx.fill();

        // 3. Bright Cyan/White Mid Core
        ctx.fillStyle = "#e0f2fe";
        ctx.beginPath();
        ctx.arc(bx, by, Math.floor(r * 0.52), 0, Math.PI * 2);
        ctx.fill();

        // 4. Pure White Energy Center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(bx + Math.floor(r * 0.12), by, Math.floor(r * 0.32), 0, Math.PI * 2);
        ctx.fill();

        // 5. Pixel Sparks & Leading Edge Highlights
        const hx = bx - Math.floor(r * 0.35);
        const hy = by - Math.floor(r * 0.35);
        ctx.fillRect(hx, hy, pSize * 2, pSize * 2);
        ctx.fillRect(bx + r - pSize, by - Math.floor(r * 0.35), pSize, pSize * 2);
        ctx.fillRect(bx + r - pSize, by + Math.floor(r * 0.2), pSize, pSize * 2);
        ctx.restore();
      });

      // ----------------------------------------------------
      // DRAW 8-BIT PIXEL ART BALL ASTEROIDS (CACHED SPRITES + GPU BLIT)
      // ----------------------------------------------------
      s.meteors.forEach((m) => {
        const cx = Math.floor(m.x + m.radius);
        const cy = Math.floor(m.y + m.radius);
        const rad = Math.floor(m.radius);
        const step = Math.max(2, Math.floor(rad / 6));

        // 1. Draw Multi-Layered Plasma Flame Thrust Tail
        ctx.save();
        const angle = Math.atan2(m.vy, m.vx);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Animated oscillating flame tongues
        const flameWave = Math.sin(s.frameCount * 0.4 + m.id) * (step * 0.8);
        const tailColor =
          m.type === "giant" ? "#dc2626" : m.type === "small" ? "#f59e0b" : "#ea580c";

        // Outer Re-entry Flare
        ctx.fillStyle = tailColor;
        for (let t = 1; t <= 4; t++) {
          const tDist = rad + t * (step * 1.5);
          const tx = cx - cosA * tDist - sinA * (t % 2 === 0 ? flameWave : -flameWave);
          const ty = cy - sinA * tDist + cosA * (t % 2 === 0 ? flameWave : -flameWave);
          const tSize = Math.max(step, step * (5 - t));
          ctx.fillRect(Math.floor(tx - tSize / 2), Math.floor(ty - tSize / 2), tSize, tSize);
        }

        // Mid Molten Orange Flare
        ctx.fillStyle = "#f97316";
        for (let t = 1; t <= 2; t++) {
          const tDist = rad + t * (step * 1.2);
          const tx = cx - cosA * tDist;
          const ty = cy - sinA * tDist;
          const tSize = Math.max(step, step * (3.5 - t));
          ctx.fillRect(Math.floor(tx - tSize / 2), Math.floor(ty - tSize / 2), tSize, tSize);
        }

        // Inner White/Yellow Hot Core
        ctx.fillStyle = "#fef08a";
        const txCore = cx - cosA * (rad + step * 0.7);
        const tyCore = cy - sinA * (rad + step * 0.7);
        ctx.fillRect(Math.floor(txCore - step), Math.floor(tyCore - step), step * 2, step * 2);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(
          Math.floor(txCore - Math.floor(step * 0.5)),
          Math.floor(tyCore - Math.floor(step * 0.5)),
          step,
          step
        );
        ctx.restore();

        // 2. Draw Cached High-Res Pixel Sprite with zero per-frame square root calculations
        const sprite = getMeteorSprite(m.type, rad, step);
        const half = sprite.width / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(m.rotation);
        ctx.drawImage(sprite, -half, -half);
        ctx.restore();
      });

      // ----------------------------------------------------
      // DRAW DINO (OFFICIAL CHROMIUM SPRITE)
      // Crouches into braced stance when shooting!
      // ----------------------------------------------------
      if (spriteImg) {
        let sx = 677;
        let sy = 2;
        let sw = 44;
        let sh = 47;

        if (s.gameState === "GAMEOVER") {
          sx = 853; // Crashed X-eyes
        } else if (s.dino.isShootingCrouch && !s.dino.isJumping) {
          // Braced crouch shooting stance!
          sw = 59;
          sh = 25;
          sy = 19;
          sx = 941;
        } else if (s.dino.isJumping) {
          sx = 677;
        } else {
          sx = s.dino.legFrame === 0 ? 765 : 809;
        }

        ctx.drawImage(spriteImg, sx, sy, sw, sh, s.dino.x, s.dino.y, sw, sh);

        // 8-bit Pixel Muzzle Blast at Dino's Snout/Mouth
        if (s.dino.fireGlowTimer > 0) {
          const mx = Math.floor(
            s.dino.x + (s.dino.isShootingCrouch && !s.dino.isJumping ? 52 : 38)
          );
          const my = Math.floor(
            s.dino.isShootingCrouch && !s.dino.isJumping ? s.dino.y + 12 : s.dino.y + 14
          );

          // 1. Electric Cyan Pixel Blast (#00ffff - pure glowing energy)
          ctx.fillStyle = "#00ffff";
          ctx.fillRect(mx - 6, my - 2, 14, 5);
          ctx.fillRect(mx - 2, my - 6, 5, 14);
          ctx.fillRect(mx - 4, my - 4, 9, 9);

          // 3. Deep Blue Inner Blocks (#0284c7)
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(mx - 4, my - 2, 10, 5);
          ctx.fillRect(mx - 2, my - 4, 5, 10);

          // 4. White Pixel Core (#ffffff)
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(mx - 2, my - 2, 5, 5);

          // 5. Pixel Sparks Shooting Forward from Dino's Mouth
          ctx.fillStyle = s.dino.fireGlowTimer % 2 === 0 ? "#ffffff" : "#00ffff";
          ctx.fillRect(mx + 10, my - 1, 3, 3);
          ctx.fillRect(mx + 14, my - 4, 2, 2);
          ctx.fillRect(mx + 14, my + 3, 2, 2);
        }
      }

      // Start Screen if IDLE
      if (s.gameState === "IDLE") {
        ctx.fillStyle = mainColor;
        ctx.textAlign = "center";
        ctx.font = '11px "Press Start 2P", monospace';
        const blink = Math.floor(s.frameCount / 30) % 2 === 0;
        if (blink) {
          ctx.fillText("PRESS SPACE TO FIRE & START", CANVAS_WIDTH / 2, 75);
        }
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText("SPACE: LASER | UP: JUMP & DBL-JUMP", CANVAS_WIDTH / 2, 105);
      }

      // Game Over Screen if GAMEOVER
      if (s.gameState === "GAMEOVER") {
        ctx.fillStyle = mainColor;
        ctx.textAlign = "center";
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillText("G A M E   O V E R", CANVAS_WIDTH / 2, 60);

        const btnX = CANVAS_WIDTH / 2;
        const btnY = 80;
        if (spriteImg) {
          ctx.drawImage(spriteImg, 2, 2, 36, 32, btnX - 18, btnY, 36, 32);
        }

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText("PRESS SPACE TO RESTART", CANVAS_WIDTH / 2, 130);
      }

      ctx.restore();

      gameLoopRef.current = requestAnimationFrame(render);
    };

    gameLoopRef.current = requestAnimationFrame(render);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center select-none gap-3">
      {/* HUD Header Bar: Seamlessly blended with the background (no container box) */}
      <div
        className={`w-full max-w-[600px] flex items-center justify-between px-1.5 py-1 ${
          isNight ? "text-[#e8eaed]" : "text-[#535353]"
        }`}
      >
        {/* Left: 3 Circular Plasma Orbs + Blasted Counter */}
        <div className="flex items-center gap-3">
          {/* 8-bit Pixel Plasma Orbs */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => {
              const isFilled = idx < laserCharges;
              const isCurrentlyRecharging = idx === laserCharges && laserCharges < MAX_CHARGES;
              const clipY = 14 - Math.round(rechargeProgress * 12);

              return (
                <div
                  key={idx}
                  className="w-5 h-5 flex items-center justify-center relative select-none"
                  title={
                    isFilled
                      ? "Plasma Ready"
                      : isCurrentlyRecharging
                        ? "Recharging Plasma..."
                        : "Depleted"
                  }
                >
                  <svg viewBox="0 0 14 14" className="w-full h-full" shapeRendering="crispEdges">
                    <defs>
                      <clipPath id={`recharge-clip-${idx}`}>
                        <rect x="0" y={clipY} width="14" height="14" />
                      </clipPath>
                    </defs>

                    {/* Stepped 8-bit Pixel Outline */}
                    <path
                      d="M4 1h6v1h2v2h1v6h-1v2h-2v1H4v-1H2v-2H1V4h1V2h2V1z"
                      fill={isNight ? "#80868b" : "#535353"}
                    />

                    {isFilled ? (
                      /* Fully Charged 8-Bit Pixel Plasma Orb */
                      <>
                        {/* Deep Blue Base */}
                        <path d="M4 2h6v1h2v2h1v4h-1v2h-2v1H4v-1H2V9H1V5h1V3h2V2z" fill="#0284c7" />
                        {/* Cyan Middle Ring */}
                        <path d="M5 3h4v1h2v2h1v2h-1v2h-2v1H5v-1H3V8H2V6h1V4h2V3z" fill="#00ffff" />
                        {/* White Core Block */}
                        <rect x="6" y="5" width="3" height="3" fill="#ffffff" />
                        {/* Pixel Highlight Glint */}
                        <rect x="4" y="3" width="2" height="2" fill="#ffffff" />
                      </>
                    ) : isCurrentlyRecharging ? (
                      /* Recharging: Dark Cavity + Pixel Rising Plasma */
                      <>
                        {/* Background Empty Cavity */}
                        <path
                          d="M4 2h6v1h2v2h1v4h-1v2h-2v1H4v-1H2V9H1V5h1V3h2V2z"
                          fill={isNight ? "#3c4043" : "#d1d5db"}
                        />
                        {/* Rising Recharge Liquid */}
                        <g clipPath={`url(#recharge-clip-${idx})`}>
                          <path
                            d="M4 2h6v1h2v2h1v4h-1v2h-2v1H4v-1H2V9H1V5h1V3h2V2z"
                            fill="#f97316"
                          />
                          <path
                            d="M5 3h4v1h2v2h1v2h-1v2h-2v1H5v-1H3V8H2V6h1V4h2V3z"
                            fill="#fde047"
                          />
                          <rect x="4" y="3" width="2" height="2" fill="#ffffff" />
                        </g>
                      </>
                    ) : (
                      /* Empty Pixel Cell */
                      <path
                        d="M4 2h6v1h2v2h1v4h-1v2h-2v1H4v-1H2V9H1V5h1V3h2V2z"
                        fill={isNight ? "#202124" : "#e5e7eb"}
                      />
                    )}
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Asteroid Destroyed Count (Clean & shortened on mobile) */}
          <div
            className={`text-[10px] font-pixel tracking-wide ${isNight ? "text-[#e8eaed]" : "text-[#535353]"}`}
          >
            <span className="hidden sm:inline">BLASTED: </span>
            <span className="font-bold text-[#0284c7]">×{meteorsDestroyed}</span>
          </div>
        </div>

        {/* Right: Scores (HI 00000  00000) */}
        <div className="flex items-center gap-2">
          <div
            className={`font-pixel text-[10px] sm:text-[11px] tracking-wider ${isNight ? "text-[#e8eaed]" : "text-[#535353]"}`}
          >
            <span className={isNight ? "text-[#9aa0a6]" : "text-[#737373]"}>HI</span>{" "}
            {Math.floor(highScore).toString().padStart(5, "0")}&nbsp;&nbsp;
            {Math.floor(score).toString().padStart(5, "0")}
          </div>
        </div>
      </div>

      {/* Canvas Container with Dual-Side Tap Interaction */}
      <div
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
        className="relative w-full max-w-[600px] cursor-pointer overflow-hidden select-none bg-transparent"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={175}
          className="w-full h-auto block touch-none"
        />
      </div>

      {/* Controls Bar with Clean Theme-Aware Keycaps (Hidden on mobile) */}
      <div className="w-full max-w-[600px] hidden sm:flex items-center justify-between gap-2 px-2 mt-1 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          {/* Spacebar Keycap */}
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-muted text-foreground border border-border rounded shadow-arcade-xs select-none">
              SPACE
            </kbd>
            <span className="text-[11px] font-medium text-foreground">Laser</span>
          </div>

          <span className="text-border">&bull;</span>

          {/* Up Arrow Keycap */}
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-muted text-foreground border border-border rounded shadow-arcade-xs select-none">
              &uarr; UP (x2)
            </kbd>
            <span className="text-[11px] font-medium text-foreground">Jump / Double Jump</span>
          </div>
        </div>

        <span className="text-[11px] text-muted-foreground font-sans">Laser expands in flight</span>
      </div>

      {/* Dedicated Touch Arcade Controls at Bottom (Visible on mobile) */}
      <div className="w-full max-w-[600px] flex sm:hidden items-center justify-between gap-3 px-1 mt-2 z-30 relative select-none">
        {/* JUMP Touch Pad */}
        <Button
          type="button"
          variant="outline"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            jump();
          }}
          className="flex-1 py-3.5 h-11 font-sans text-xs uppercase tracking-wider font-bold cursor-pointer select-none shadow-arcade active:translate-y-0.5"
        >
          JUMP / DBL-JUMP
        </Button>

        {/* LASER BLAST Touch Pad */}
        <Button
          type="button"
          variant={laserCharges > 0 ? "default" : "secondary"}
          disabled={laserCharges <= 0}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fireLaser();
          }}
          className={`flex-1 py-3.5 h-11 font-sans text-xs uppercase tracking-wider font-bold cursor-pointer select-none ${
            laserCharges > 0 ? "shadow-arcade-primary" : "shadow-arcade"
          } active:translate-y-0.5`}
        >
          BLAST ({laserCharges})
        </Button>
      </div>
    </div>
  );
};
