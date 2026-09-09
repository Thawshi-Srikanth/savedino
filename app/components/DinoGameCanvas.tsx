"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { audioSynth } from "./AudioSynthesizer";
import { Button } from "@/components/ui/button";

interface DinoGameCanvasProps {
  onScoreUpdate?: (score: number, high: number, meteorsDestroyed: number) => void;
  onNightModeChange?: (isNight: boolean) => void;
  nightModeOverride?: boolean | null;
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

export const DinoGameCanvas: React.FC<DinoGameCanvasProps> = ({
  onScoreUpdate,
  onNightModeChange,
  nightModeOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteImgRef = useRef<HTMLImageElement | null>(null);
  const nightModeOverrideRef = useRef<boolean | null>(nightModeOverride ?? null);
  nightModeOverrideRef.current = nightModeOverride ?? null;

  // React State for HUD & Theme
  const [gameState, setGameState] = useState<"IDLE" | "RUNNING" | "GAMEOVER">("IDLE");
  const [isNight, setIsNight] = useState<boolean>(nightModeOverride ?? false);
  const isNightRef = useRef<boolean>(nightModeOverride ?? false);
  const [laserCharges, setLaserCharges] = useState<number>(MAX_CHARGES);
  const [rechargeProgress, setRechargeProgress] = useState<number>(1.0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  useEffect(() => {
    if (nightModeOverride !== undefined && nightModeOverride !== null) {
      setIsNight(nightModeOverride);
      isNightRef.current = nightModeOverride;
    }
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

    // Dino State (Crouches into shooting stance when firing)
    dino: {
      x: 50,
      y: 101, // 148 - 47
      vy: 0,
      width: 44,
      height: 47,
      duckWidth: 59,
      duckHeight: 25,
      isJumping: false,
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

  // Load High Score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHi = localStorage.getItem("save_dino_laser_hi_score");
      if (savedHi) {
        const hi = parseInt(savedHi, 10);
        setHighScore(hi);
        stateRef.current.highScore = hi;
      }
    }
  }, []);

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

  // Jump Action (Jump)
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === "IDLE" || s.gameState === "GAMEOVER") {
      fireLaser();
      return;
    }
    if (s.gameState === "RUNNING" && !s.dino.isJumping) {
      s.dino.isJumping = true;
      s.dino.isShootingCrouch = false;
      s.dino.vy = s.jumpVelocity;
      audioSynth.playJump();
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

        // Dino Physics (Jumping only)
        if (s.dino.isJumping) {
          s.dino.y += s.dino.vy;
          s.dino.vy += s.gravity;

          if (s.dino.y >= groundY - s.dino.height) {
            s.dino.y = groundY - s.dino.height;
            s.dino.isJumping = false;
            s.dino.vy = 0;
          }
        } else if (!s.dino.isShootingCrouch) {
          s.dino.y = groundY - s.dino.height;
          if (s.frameCount % 6 === 0) {
            s.dino.legFrame = (s.dino.legFrame + 1) % 2;
          }
        }

        if (s.dino.fireGlowTimer > 0) {
          s.dino.fireGlowTimer--;
        }

        // ----------------------------------------------------
        // SPAWN METEORS TOWARDS GROUND / DINO
        // ----------------------------------------------------
        s.meteorSpawnTimer++;
        const spawnInterval = Math.max(45, 110 - Math.floor(s.score / 50) * 5);
        if (s.meteorSpawnTimer >= spawnInterval) {
          s.meteorSpawnTimer = 0;
          audioSynth.playMeteor();

          const startX = CANVAS_WIDTH + 25;
          const startY = -20 + Math.random() * 30;
          const targetX = s.dino.x + 10 + (Math.random() > 0.5 ? 0 : 35);
          const targetY = groundY - (Math.random() > 0.4 ? 18 : 34);

          const dx = targetX - startX;
          const dy = targetY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const randClass = Math.random();
          let meteorType: "small" | "medium" | "giant" = "medium";
          let size = 22;
          let speed = 3.6;

          if (randClass < 0.35) {
            meteorType = "small";
            size = 14 + Math.floor(Math.random() * 4);
            speed = 4.8 + (s.speed - 6) * 0.4 + Math.random() * 0.8;
          } else if (randClass < 0.75) {
            meteorType = "medium";
            size = 22 + Math.floor(Math.random() * 5);
            speed = 3.5 + (s.speed - 6) * 0.3 + Math.random() * 0.6;
          } else {
            meteorType = "giant";
            size = 32 + Math.floor(Math.random() * 8);
            speed = 2.4 + (s.speed - 6) * 0.2 + Math.random() * 0.5;
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
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            hp: 1,
          });
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

          if (s.score > s.highScore) {
            s.highScore = Math.floor(s.score);
            setHighScore(s.highScore);
            if (typeof window !== "undefined") {
              localStorage.setItem("save_dino_laser_hi_score", s.highScore.toString());
            }
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
      // DRAW PIXELATED EXPANDING PLASMA BALL (8-BIT RETRO)
      // ----------------------------------------------------
      s.balls.forEach((b) => {
        ctx.save();
        const bx = Math.floor(b.x);
        const by = Math.floor(b.y);
        const r = Math.floor(b.radius);
        const pSize = Math.max(2, Math.floor(r / 7)); // Grid pixel block step

        // Helper to draw stepped 8-bit pixel circle
        const fillPixelCircle = (
          cx: number,
          cy: number,
          radius: number,
          step: number,
          color: string
        ) => {
          ctx.fillStyle = color;
          for (let dy = -radius; dy <= radius; dy += step) {
            const dx = Math.floor(Math.sqrt(Math.max(0, radius * radius - dy * dy)) / step) * step;
            if (dx > 0) {
              ctx.fillRect(cx - dx, cy + dy, dx * 2, step);
            }
          }
        };

        // 1. Outer Electric Blue/Cyan Plasma Corona (Blends seamlessly with background)
        fillPixelCircle(bx, by, r, pSize, "#0284c7");

        // 2. Bright Electric Cyan Pixel Ring
        fillPixelCircle(bx, by, Math.floor(r * 0.78), pSize, "#00ffff");

        // 3. Bright Cyan/White Mid Core
        fillPixelCircle(bx, by, Math.floor(r * 0.52), pSize, "#e0f2fe");

        // 4. Blinding White Pure Energy Center
        fillPixelCircle(bx + Math.floor(r * 0.12), by, Math.floor(r * 0.32), pSize, "#ffffff");

        // 5. White Pixel Highlights (Top-Left Glints)
        ctx.fillStyle = "#ffffff";
        const hx = bx - Math.floor(r * 0.35);
        const hy = by - Math.floor(r * 0.35);
        ctx.fillRect(hx, hy, pSize * 2, pSize * 2);

        // 6. Leading Pixel Energy Sparks on Front Edge
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx + r - pSize, by - Math.floor(r * 0.35), pSize, pSize * 2);
        ctx.fillRect(bx + r - pSize, by + Math.floor(r * 0.2), pSize, pSize * 2);
        ctx.restore();
      });

      // ----------------------------------------------------
      // DRAW 8-BIT PIXEL ART BALL ASTEROIDS (TUMBLING & DETAILED)
      // Stepped circular pixel matrix with fiery aura, magma veins, and rotating craters
      // ----------------------------------------------------
      s.meteors.forEach((m) => {
        const cx = Math.floor(m.x + m.radius);
        const cy = Math.floor(m.y + m.radius);
        const rad = Math.floor(m.radius);
        const step = Math.max(2, Math.floor(rad / 6)); // Discrete pixel block size

        // 1. Draw Trailing Flame Tail (Aligned with flight path, behind the asteroid)
        ctx.save();
        const angle = Math.atan2(m.vy, m.vx);
        const tailLen = m.type === "giant" ? 18 : m.type === "small" ? 10 : 14;
        const tailColor =
          m.type === "giant" ? "#ef4444" : m.type === "small" ? "#f59e0b" : "#f97316";

        ctx.fillStyle = tailColor;
        for (let t = 1; t <= 3; t++) {
          const tDist = rad + t * (step * 1.5);
          const tx = cx - Math.cos(angle) * tDist + Math.sin(s.frameCount * 0.4 + t) * step;
          const ty = cy - Math.sin(angle) * tDist + Math.cos(s.frameCount * 0.4 + t) * step;
          const tSize = Math.max(step, step * (4 - t));
          ctx.fillRect(Math.floor(tx - tSize / 2), Math.floor(ty - tSize / 2), tSize, tSize);
        }

        // Inner Yellow Flame Core in Tail
        ctx.fillStyle = "#fde047";
        const txCore = cx - Math.cos(angle) * (rad + step);
        const tyCore = cy - Math.sin(angle) * (rad + step);
        ctx.fillRect(Math.floor(txCore - step), Math.floor(tyCore - step), step * 2, step * 2);
        ctx.restore();

        // 2. Draw Tumbling Asteroid Body (Centered at (0, 0) for authentic spin)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(m.rotation);

        // Stepped Pixel Circle Drawer relative to local (0, 0)
        const drawPixelCircle = (radius: number, color: string, offsetX = 0, offsetY = 0) => {
          ctx.fillStyle = color;
          for (let dy = -radius; dy <= radius; dy += step) {
            const width =
              Math.floor(Math.sqrt(Math.max(0, radius * radius - dy * dy)) / step) * step;
            if (width > 0) {
              ctx.fillRect(offsetX - width, offsetY + dy, width * 2, step);
            }
          }
        };

        // A. Fiery Atmospheric Plasma Corona / Outer Burn
        const fireColor =
          m.type === "giant" ? "#dc2626" : m.type === "small" ? "#f59e0b" : "#f97316";
        drawPixelCircle(rad + step, fireColor);

        // B. Bright Molten Corona Edge
        drawPixelCircle(rad, m.type === "giant" ? "#f97316" : "#fde047");

        // C. Dark Shadowed Rocky Crust (Dark base stone sphere)
        drawPixelCircle(rad - step, "#292524");

        // D. Mid Rock Body (Offset slightly top-left for 3D depth)
        drawPixelCircle(
          Math.max(step, rad - step * 2),
          "#57534e",
          -Math.floor(step * 0.5),
          -Math.floor(step * 0.5)
        );

        // E. Lit Stone Highlight (Top-left crescent)
        drawPixelCircle(Math.max(step, Math.floor(rad * 0.55)), "#78716c", -step, -step);

        // F. Glowing Magma Veins & Heat Cracks (Pulses through rock)
        ctx.fillStyle = "#f97316";
        ctx.fillRect(-step * 2, 0, step * 3, step);
        ctx.fillRect(0, -step * 2, step, step * 3);
        ctx.fillRect(step, step, step * 2, step);

        ctx.fillStyle = "#fde047";
        ctx.fillRect(-step, 0, step, step);
        ctx.fillRect(0, -step, step, step);

        // G. Rotating Detailed Pixel Craters with Lit Lips and Dark Pits
        if (m.type === "giant") {
          // Large main crater with lit rim
          ctx.fillStyle = "#a8a29e"; // Lit rim
          ctx.fillRect(-step * 3 - step, -step * 2 - step, step * 4, step);
          ctx.fillStyle = "#1c1917"; // Crater wall
          ctx.fillRect(-step * 3, -step * 2, step * 3, step * 2);
          ctx.fillRect(-step * 4, -step, step * 5, step);
          ctx.fillStyle = "#0c0a09"; // Deep abyss
          ctx.fillRect(-step * 2, -step, step * 2, step);

          // Second crater
          ctx.fillStyle = "#78716c";
          ctx.fillRect(step * 2, -step * 2, step * 2, step);
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(step * 2, -step, step * 2, step * 2);
          ctx.fillStyle = "#0c0a09";
          ctx.fillRect(step * 2 + Math.floor(step * 0.5), 0, step, step);

          // Third crater
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(-step * 2, step * 2, step * 2, step * 2);
          ctx.fillStyle = "#0c0a09";
          ctx.fillRect(-step * 1.5, step * 2.5, step, step);
        } else if (m.type === "medium") {
          // Medium crater 1
          ctx.fillStyle = "#78716c";
          ctx.fillRect(-step * 2, -step * 2, step * 2, step);
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(-step * 2, -step, step * 2, step * 2);
          ctx.fillStyle = "#0c0a09";
          ctx.fillRect(-step * 1.5, 0, step, step);

          // Medium crater 2
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(step, step, step * 2, step * 2);
          ctx.fillStyle = "#0c0a09";
          ctx.fillRect(step + Math.floor(step * 0.5), step + Math.floor(step * 0.5), step, step);
        } else {
          // Small crater
          ctx.fillStyle = "#78716c";
          ctx.fillRect(-step, -step, step * 2, step);
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(-step, 0, step * 2, step);
          ctx.fillStyle = "#0c0a09";
          ctx.fillRect(0, 0, step, step);
        }

        // H. Specular Glint Pixels on top-left rock face
        ctx.fillStyle = "#e7e5e4";
        const glintDist = Math.floor(rad * 0.5);
        ctx.fillRect(-glintDist, -glintDist, step * 2, step);
        ctx.fillRect(-glintDist - step, -glintDist + step, step, step);

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
        ctx.fillText("SPACE: LASER | UP ARROW: JUMP", CANVAS_WIDTH / 2, 105);
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
        <div
          className={`font-pixel text-[10px] sm:text-[11px] tracking-wider ${isNight ? "text-[#e8eaed]" : "text-[#535353]"}`}
        >
          <span className={isNight ? "text-[#9aa0a6]" : "text-[#737373]"}>HI</span>{" "}
          {Math.floor(highScore).toString().padStart(5, "0")}&nbsp;&nbsp;
          {Math.floor(score).toString().padStart(5, "0")}
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

      {/* Controls Hint with Pixel Keyboard Keycap Sprites (Helper contents) */}
      <div
        className={`w-full max-w-[600px] flex flex-col sm:flex-row items-center justify-between gap-1.5 px-2 mt-1 text-[11px] font-mono ${
          isNight ? "text-[#9aa0a6]" : "text-[#535353]"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* SPACE sprite + Laser */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block flex-shrink-0"
              style={{
                width: "32px",
                height: "16px",
                backgroundImage: "url('/Keyboard-Extras.png')",
                backgroundPosition: isNight ? "-64px -96px" : "-64px -32px",
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
              }}
              title="SPACEBAR: Laser"
            />
            <span className="font-pixel text-[10px]">: Laser</span>
          </div>

          <span className="opacity-40">|</span>

          {/* UP ARROW sprite + Jump */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block flex-shrink-0"
              style={{
                width: "16px",
                height: "16px",
                backgroundImage: "url('/Keyboard-Letter.png')",
                backgroundPosition: isNight ? "0px -112px" : "0px 0px",
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
              }}
              title="UP ARROW: Jump"
            />
            <span className="font-pixel text-[10px]">: Jump</span>
          </div>
        </div>

        <span className="text-[10px] font-mono opacity-75">
          <span className="sm:hidden">Tap left Jump, right Shoot • </span>Laser expands in flight
        </span>
      </div>

      {/* Dedicated Touch Arcade Controls at Bottom (Hidden on desktop / wide screens, visible on mobile) */}
      <div className="w-full max-w-[600px] flex sm:hidden items-center justify-between gap-3 px-1 mt-3 z-30 relative select-none">
        {/* JUMP Touch Pad (White 3D PostHog Button) */}
        <Button
          type="button"
          variant="outline"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            jump();
          }}
          className="flex-1 py-4 h-12 font-pixel text-[11px] tracking-wider uppercase font-bold cursor-pointer select-none"
        >
          JUMP
        </Button>

        {/* LASER BLAST Touch Pad (Purple 3D PostHog Button) */}
        <Button
          type="button"
          variant={laserCharges > 0 ? "default" : "secondary"}
          disabled={laserCharges <= 0}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fireLaser();
          }}
          className="flex-1 py-4 h-12 font-pixel text-[11px] tracking-wider uppercase font-bold cursor-pointer select-none"
        >
          BLAST ({laserCharges})
        </Button>
      </div>
    </div>
  );
};
