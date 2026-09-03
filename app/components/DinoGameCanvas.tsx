"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { audioSynth } from "./AudioSynthesizer";

interface DinoGameCanvasProps {
  onScoreUpdate?: (score: number, high: number) => void;
}

interface Obstacle {
  id: number;
  type: "CACTUS_SMALL" | "CACTUS_LARGE" | "PTERODACTYL";
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
  variantIndex: number;
  wingFrame: number;
  gap: number;
  followingCreated: boolean;
}

interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DinoGameCanvas: React.FC<DinoGameCanvasProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spriteImgRef = useRef<HTMLImageElement | null>(null);

  // Game State
  const [gameState, setGameState] = useState<"IDLE" | "RUNNING" | "GAMEOVER">("IDLE");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

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

  // Exact Chromium T-Rex Engine Setup (600x150, Ground Y: 127)
  const gameLoopRef = useRef<number | null>(null);
  const stateRef = useRef({
    gameState: "IDLE" as "IDLE" | "RUNNING" | "GAMEOVER",
    score: 0,
    highScore: 0,
    speed: 6.0,
    groundY: 127,
    frameCount: 0,
    gameOverTimestamp: 0,

    // Horizon Line Double-Buffer (Exact Chromium HorizonLine logic)
    horizonX1: 0,
    horizonX2: 600,
    sourceX1: 2,
    sourceX2: 602,

    // Dino State (44x47 standing/running, 59x25 ducking)
    dino: {
      x: 50,
      y: 80, // 127 - 47
      vy: 0,
      width: 44,
      height: 47,
      duckWidth: 59,
      duckHeight: 25,
      isJumping: false,
      isDucking: false,
      legFrame: 0,
    },

    // Physics
    gravity: 0.6,
    jumpVelocity: -10.0,

    // Obstacles & Clouds
    obstacles: [] as Obstacle[],
    clouds: [
      { x: 100, y: 25, speed: 0.4 },
      { x: 320, y: 40, speed: 0.3 },
      { x: 520, y: 20, speed: 0.5 },
    ],
  });

  // Load High Score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHi = localStorage.getItem("chrome_dino_hi_score");
      if (savedHi) {
        const hi = parseInt(savedHi, 10);
        setHighScore(hi);
        stateRef.current.highScore = hi;
      }
    }
  }, []);

  // Jump Action (with cooldown protection so it never resets immediately upon hitting an obstacle)
  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === "IDLE") {
      s.gameState = "RUNNING";
      s.score = 0;
      s.speed = 6.0;
      s.obstacles = [];
      s.horizonX1 = 0;
      s.horizonX2 = 600;
      s.sourceX1 = 2;
      s.sourceX2 = 602;
      s.dino.y = s.groundY - s.dino.height;
      s.dino.vy = 0;
      s.dino.isJumping = false;
      s.dino.isDucking = false;
      setGameState("RUNNING");
      audioSynth.playJump();
    } else if (s.gameState === "RUNNING" && !s.dino.isJumping) {
      s.dino.isJumping = true;
      s.dino.isDucking = false;
      s.dino.vy = s.jumpVelocity;
      audioSynth.playJump();
    } else if (s.gameState === "GAMEOVER") {
      // Prevent accidental instant restart if player was pressing space when colliding
      const now = Date.now();
      if (now - s.gameOverTimestamp < 400) return;

      s.gameState = "RUNNING";
      s.score = 0;
      s.speed = 6.0;
      s.obstacles = [];
      s.horizonX1 = 0;
      s.horizonX2 = 600;
      s.sourceX1 = 2;
      s.sourceX2 = 602;
      s.dino.y = s.groundY - s.dino.height;
      s.dino.vy = 0;
      s.dino.isJumping = false;
      s.dino.isDucking = false;
      setGameState("RUNNING");
      audioSynth.playButtonClick();
    }
  }, []);

  // Duck Action
  const setDuck = useCallback((ducking: boolean) => {
    const s = stateRef.current;
    if (s.gameState === "RUNNING") {
      if (ducking && !s.dino.isJumping) {
        s.dino.isDucking = true;
        s.dino.y = s.groundY - s.dino.duckHeight;
      } else if (!ducking) {
        s.dino.isDucking = false;
        s.dino.y = s.groundY - s.dino.height;
      }
      if (ducking && s.dino.isJumping) {
        s.dino.vy += 3.0;
      }
    }
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        e.preventDefault();
        setDuck(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [jump, setDuck]);

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
      const CANVAS_HEIGHT = 150;
      const groundY = s.groundY;

      // 1. UPDATE GAME LOGIC IF RUNNING
      if (s.gameState === "RUNNING") {
        s.score += 0.15;
        const currentScoreInt = Math.floor(s.score);

        if (currentScoreInt > 0 && currentScoreInt % 100 === 0 && Math.floor(s.score - 0.15) % 100 !== 0) {
          audioSynth.playScore();
        }

        if (s.speed < 13) {
          s.speed += 0.0006;
        }

        // Horizon Ground Line Scrolling
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

        // Dino Physics
        const currentDinoHeight = s.dino.isDucking ? s.dino.duckHeight : s.dino.height;
        if (s.dino.isJumping) {
          s.dino.y += s.dino.vy;
          s.dino.vy += s.gravity;

          if (s.dino.y >= groundY - currentDinoHeight) {
            s.dino.y = groundY - currentDinoHeight;
            s.dino.isJumping = false;
            s.dino.vy = 0;
          }
        } else {
          s.dino.y = groundY - currentDinoHeight;
          if (s.frameCount % 6 === 0) {
            s.dino.legFrame = (s.dino.legFrame + 1) % 2;
          }
        }

        // SPAWN OBSTACLES (Exact Chromium Horizon.updateObstacles logic)
        if (s.obstacles.length === 0) {
          spawnNewObstacle(s, CANVAS_WIDTH);
        } else {
          const lastObs = s.obstacles[s.obstacles.length - 1];
          if (!lastObs.followingCreated && lastObs.x + lastObs.width + lastObs.gap < CANVAS_WIDTH) {
            spawnNewObstacle(s, CANVAS_WIDTH);
            lastObs.followingCreated = true;
          }
        }

        // Move Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;
          if (obs.type === "PTERODACTYL" && s.frameCount % 8 === 0) {
            obs.wingFrame = (obs.wingFrame + 1) % 2;
          }
          if (obs.x + obs.width < -50) {
            s.obstacles.splice(i, 1);
          }
        }

        // Move Clouds
        s.clouds.forEach((cloud) => {
          cloud.x -= cloud.speed;
          if (cloud.x < -50) cloud.x = CANVAS_WIDTH + 50;
        });

        // ----------------------------------------------------
        // EXACT CHROMIUM SUB-BOX COLLISION DETECTION
        // ----------------------------------------------------
        const tRexBoxes = s.dino.isDucking
          ? [{ x: s.dino.x + 1, y: s.dino.y + 12, width: 55, height: 13 }]
          : [
              { x: s.dino.x + 22, y: s.dino.y + 0, width: 17, height: 16 }, // Head
              { x: s.dino.x + 1, y: s.dino.y + 18, width: 30, height: 9 },   // Body
              { x: s.dino.x + 10, y: s.dino.y + 35, width: 14, height: 8 },  // Legs
            ];

        let hit = false;
        for (const obs of s.obstacles) {
          const obsBoxes = getObstacleCollisionBoxes(obs);
          for (const tBox of tRexBoxes) {
            for (const oBox of obsBoxes) {
              if (
                tBox.x < oBox.x + oBox.width &&
                tBox.x + tBox.width > oBox.x &&
                tBox.y < oBox.y + oBox.height &&
                tBox.y + tBox.height > oBox.y
              ) {
                hit = true;
                break;
              }
            }
            if (hit) break;
          }
          if (hit) break;
        }

        // GAME OVER (Freeze scene & keep obstacles in place!)
        if (hit) {
          s.gameState = "GAMEOVER";
          s.gameOverTimestamp = Date.now();
          setGameState("GAMEOVER");
          audioSynth.playHit();

          if (s.score > s.highScore) {
            s.highScore = Math.floor(s.score);
            setHighScore(s.highScore);
            if (typeof window !== "undefined") {
              localStorage.setItem("chrome_dino_hi_score", s.highScore.toString());
            }
          }
        }

        setScore(Math.floor(s.score));
        if (onScoreUpdate) {
          onScoreUpdate(Math.floor(s.score), s.highScore);
        }
      }

      // 2. CANVAS RENDERING
      const night = Math.floor(s.score / 700) % 2 === 1;
      ctx.fillStyle = night ? "#202124" : "#f4f4f4";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const mainColor = night ? "#e8eaed" : "#535353";
      const spriteImg = spriteImgRef.current;

      // Night Mode Stars & Moon
      if (night) {
        if (spriteImg) {
          ctx.drawImage(spriteImg, 484, 2, 40, 40, 520, 20, 40, 40);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(520, 30, 12, 0, Math.PI * 2);
          ctx.fill();
        }
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

      // Horizon Line (x: 2 / 602, y: 54, w: 600, h: 12)
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

      // Draw Cacti & Pterodactyls (Using exact Chromium Y offsets: 105 for small cactus, 90 for large cactus)
      s.obstacles.forEach((obs) => {
        if (spriteImg) {
          if (obs.type === "CACTUS_SMALL") {
            const sx = 228 + obs.variantIndex * 17;
            ctx.drawImage(spriteImg, sx, 2, 17, 35, obs.x, obs.y, 17, 35);
          } else if (obs.type === "CACTUS_LARGE") {
            const sx = 332 + obs.variantIndex * 25;
            ctx.drawImage(spriteImg, sx, 2, 25, 50, obs.x, obs.y, 25, 50);
          } else if (obs.type === "PTERODACTYL") {
            const sx = obs.wingFrame === 0 ? 134 : 180;
            ctx.drawImage(spriteImg, sx, 2, 46, 40, obs.x, obs.y, 46, 40);
          }
        } else {
          ctx.fillStyle = mainColor;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
      });

      // Draw Dino (Official Chromium sprite offsets)
      if (spriteImg) {
        let sx = 677;
        let sy = 2;
        let sw = 44;
        let sh = 47;

        if (s.gameState === "GAMEOVER") {
          sx = 853; // Crashed T-Rex (x-eye)
        } else if (s.dino.isDucking) {
          sw = 59;
          sh = 25;
          sy = 19;
          sx = s.dino.legFrame === 0 ? 941 : 1000;
        } else if (s.dino.isJumping) {
          sx = 677;
        } else {
          sx = s.dino.legFrame === 0 ? 765 : 809;
        }

        ctx.drawImage(spriteImg, sx, sy, sw, sh, s.dino.x, s.dino.y, sw, sh);
      }

      // Distance Meter Score (HI 00000 00000)
      ctx.font = '11px "PressStart2P", "Press Start 2P", monospace';
      ctx.fillStyle = mainColor;
      ctx.textAlign = "right";

      const hiStr = Math.floor(s.highScore).toString().padStart(5, "0");
      const scoreStr = Math.floor(s.score).toString().padStart(5, "0");
      ctx.fillText(`HI ${hiStr}  ${scoreStr}`, CANVAS_WIDTH - 15, 25);

      // Start Banner if IDLE
      if (s.gameState === "IDLE") {
        ctx.textAlign = "center";
        ctx.font = '11px "PressStart2P", "Press Start 2P", monospace';
        const blink = Math.floor(s.frameCount / 30) % 2 === 0;
        if (blink) {
          ctx.fillText("PRESS SPACE OR TAP TO JUMP", CANVAS_WIDTH / 2, 70);
        }
      }

      // Game Over Panel if GAMEOVER
      if (s.gameState === "GAMEOVER") {
        ctx.textAlign = "center";
        ctx.font = '14px "PressStart2P", "Press Start 2P", monospace';
        ctx.fillText("G A M E   O V E R", CANVAS_WIDTH / 2, 55);

        // Restart Icon (sx: 2, sy: 2, sw: 36, sh: 32)
        const btnX = CANVAS_WIDTH / 2;
        const btnY = 75;
        if (spriteImg) {
          ctx.drawImage(spriteImg, 2, 2, 36, 32, btnX - 18, btnY, 36, 32);
        }

        ctx.font = '9px "PressStart2P", "Press Start 2P", monospace';
        ctx.fillText("PRESS SPACE TO RESTART", CANVAS_WIDTH / 2, 125);
      }

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
    <div className="w-full flex flex-col items-center select-none">
      <div
        onClick={jump}
        className="relative w-full max-w-[600px] cursor-pointer overflow-hidden bg-[#f4f4f4]"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="w-full h-auto block touch-none"
        />

        {/* Mobile Controls */}
        <div className="sm:hidden mt-2 flex justify-between pointer-events-auto px-4">
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              setDuck(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setDuck(false);
            }}
            className="px-4 py-2 bg-[#535353] text-white rounded font-pixel text-[10px]"
          >
            CROUCH
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              jump();
            }}
            className="px-6 py-2 bg-[#535353] text-white rounded font-pixel text-[10px]"
          >
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// HELPER FUNCTIONS (Exact Chromium Obstacle logic)
// ----------------------------------------------------

function spawnNewObstacle(
  s: {
    obstacles: Obstacle[];
    speed: number;
    score: number;
  },
  canvasWidth: number
) {
  const allowPterodactyl = s.score > 200;
  const randType = Math.random();

  if (allowPterodactyl && randType < 0.25) {
    // Pterodactyl
    const altitudes = [100, 75, 50];
    const chosenY = altitudes[Math.floor(Math.random() * altitudes.length)];
    const gap = Math.round(46 * s.speed + 150 * 0.6 + Math.random() * 80);

    s.obstacles.push({
      id: Date.now() + Math.random(),
      type: "PTERODACTYL",
      x: canvasWidth + 10,
      y: chosenY,
      width: 46,
      height: 40,
      size: 1,
      variantIndex: 0,
      wingFrame: 0,
      gap: gap,
      followingCreated: false,
    });
  } else if (randType < 0.65) {
    // Small Cactus (yPos: 105 in Chromium)
    const gap = Math.round(17 * s.speed + 120 * 0.6 + Math.random() * 80);
    s.obstacles.push({
      id: Date.now() + Math.random(),
      type: "CACTUS_SMALL",
      x: canvasWidth + 10,
      y: 105,
      width: 17,
      height: 35,
      size: 1,
      variantIndex: Math.floor(Math.random() * 3),
      wingFrame: 0,
      gap: gap,
      followingCreated: false,
    });
  } else {
    // Large Cactus (yPos: 90 in Chromium)
    const gap = Math.round(25 * s.speed + 120 * 0.6 + Math.random() * 80);
    s.obstacles.push({
      id: Date.now() + Math.random(),
      type: "CACTUS_LARGE",
      x: canvasWidth + 10,
      y: 90,
      width: 25,
      height: 50,
      size: 1,
      variantIndex: Math.floor(Math.random() * 2),
      wingFrame: 0,
      gap: gap,
      followingCreated: false,
    });
  }
}

function getObstacleCollisionBoxes(obs: Obstacle): CollisionBox[] {
  if (obs.type === "CACTUS_SMALL") {
    return [
      { x: obs.x + 0, y: obs.y + 7, width: 5, height: 27 },
      { x: obs.x + 4, y: obs.y + 0, width: 6, height: 34 },
      { x: obs.x + 10, y: obs.y + 4, width: 7, height: 14 },
    ];
  } else if (obs.type === "CACTUS_LARGE") {
    return [
      { x: obs.x + 0, y: obs.y + 12, width: 7, height: 38 },
      { x: obs.x + 8, y: obs.y + 0, width: 7, height: 49 },
      { x: obs.x + 13, y: obs.y + 10, width: 10, height: 38 },
    ];
  } else {
    // Pterodactyl
    return [
      { x: obs.x + 15, y: obs.y + 15, width: 16, height: 5 },
      { x: obs.x + 18, y: obs.y + 21, width: 24, height: 6 },
      { x: obs.x + 2, y: obs.y + 14, width: 4, height: 3 },
    ];
  }
}
