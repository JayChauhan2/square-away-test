import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function DropTheBall({ size = 'small' }) {
    const { user } = useAuth();
    const [gameState, setGameState] = useState("start"); // start, playing, gameover
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Game Refs for loop
    const canvasRef = useRef(null);
    const requestRef = useRef(null);

    // Game constants
    const GRAVITY = 0.6;
    const JUMP_FORCE = -10;
    const OBSTACLE_SPEED = 5;

    // Game State Refs (mutable for loop)
    const playerY = useRef(150);
    const playerVelocity = useRef(0);
    const jumpCount = useRef(0); // For double jump logic
    const obstacles = useRef([]);
    const frameCount = useRef(0);

    // Fetch High Score on Mount
    useEffect(() => {
        if (user?.user_metadata?.high_score) {
            setHighScore(user.user_metadata.high_score);
        }
    }, [user]);

    const saveHighScore = async (newScore) => {
        if (!user) return;
        if (newScore > highScore) {
            setHighScore(newScore);
            // Persist to Supabase
            try {
                await supabase.auth.updateUser({
                    data: { high_score: newScore }
                });
            } catch (err) {
                console.error("Failed to save high score", err);
            }
        }
    };

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        playerY.current = 150;
        playerVelocity.current = 0;
        jumpCount.current = 0;
        obstacles.current = [];
        frameCount.current = 0;

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const jump = useCallback(() => {
        if (gameState === "playing") {
            // Double Jump Logic: Allow jump if count < 2
            if (jumpCount.current < 2) {
                playerVelocity.current = JUMP_FORCE;
                jumpCount.current += 1;
            }
        } else if (gameState !== "playing") {
            startGame();
        }
    }, [gameState]);

    const handleKeyDown = useCallback((e) => {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            jump();
        }
    }, [jump]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update Player
        playerVelocity.current += GRAVITY;
        playerY.current += playerVelocity.current;

        // Floor collision
        // Dino Style Logic: Player runs on floor (y = height - 30)
        const floorY = canvas.height - 30;
        if (playerY.current >= floorY) {
            playerY.current = floorY;
            playerVelocity.current = 0;
            jumpCount.current = 0; // Reset jump count
        }

        // Update Obstacles
        frameCount.current++;
        if (frameCount.current % 100 === 0) { // Spawn rate
            obstacles.current.push({
                x: canvas.width,
                width: 20 + Math.random() * 30,
                height: 30 + Math.random() * 40,
            });
        }

        obstacles.current.forEach((obs, index) => {
            obs.x -= OBSTACLE_SPEED;
        });

        // Remove off-screen obstacles
        if (obstacles.current.length > 0 && obstacles.current[0].x < -50) {
            obstacles.current.shift();
            setScore(s => s + 1);
        }

        // Collision Detection
        const playerRect = { x: 50, y: playerY.current, w: 30, h: 30 };

        let collision = false;
        obstacles.current.forEach(obs => {
            const obsRect = { x: obs.x, y: floorY + 30 - obs.height, w: obs.width, h: obs.height };

            // Simple AABB collision
            if (
                playerRect.x < obsRect.x + obsRect.w &&
                playerRect.x + playerRect.w > obsRect.x &&
                playerRect.y < obsRect.y + obsRect.h &&
                playerRect.y + playerRect.h > obsRect.y
            ) {
                collision = true;
            }
        });

        // Draw Floor
        ctx.fillStyle = "#e2e8f0"; // slate-200
        ctx.fillRect(0, floorY + 30, canvas.width, 10);

        // Draw Obstacles
        ctx.fillStyle = "#ef4444"; // red-500
        obstacles.current.forEach(obs => {
            ctx.fillRect(obs.x, floorY + 30 - obs.height, obs.width, obs.height);
        });

        // Draw Player
        ctx.fillStyle = "#3b82f6"; // blue-500
        ctx.fillRect(playerRect.x, playerRect.y, playerRect.w, playerRect.h);

        if (collision) {
            setGameState("gameover");
            saveHighScore(score);
            cancelAnimationFrame(requestRef.current);
        } else {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    return (
        <div className={`flex flex-col items-center ${size === 'large' ? 'w-[800px]' : 'w-[400px]'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                <h3 className={`${size === 'large' ? 'text-2xl' : 'text-xl'} font-bold text-slate-800 mb-2 text-center`}>Play While You Wait!</h3>
                <p className={`${size === 'large' ? 'text-base' : 'text-sm'} text-slate-600 mb-4 text-center`}>
                    Score: <span className="font-bold text-blue-600">{score}</span> | High Score: <span className="font-bold text-purple-600">{highScore}</span>
                </p>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-slate-50 border border-slate-200 cursor-pointer" onClick={jump}>
                <canvas
                    ref={canvasRef}
                    width={size === 'large' ? 800 : 400}
                    height={size === 'large' ? 400 : 200}
                    className="bg-slate-50"
                />

                {gameState === "start" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <Play className="w-12 h-12 text-blue-500 mb-2" />
                        <p className="font-bold text-slate-700">Press Space to Start</p>
                    </div>
                )}

                {gameState === "gameover" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 backdrop-blur-[1px]">
                        <p className="text-xl font-bold text-red-600 mb-2">Game Over</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            className="px-4 py-2 bg-white text-slate-800 rounded-full shadow-sm hover:scale-105 transition-transform flex items-center gap-2 font-medium"
                        >
                            <RotateCcw className="w-4 h-4" /> Try Again
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-4 text-xs text-slate-400 animate-pulse text-center">
                Your video is being created in the background...
            </p>
        </div>
    );
}
