import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function DropTheBall({ size = 'small' }) {
    const { user } = useAuth();
    const [gameState, setGameState] = useState("start"); // start, playing, gameover
    const [finalScore, setFinalScore] = useState(0); // Score state for game over screen only
    const [highScore, setHighScore] = useState(0);

    // Game Refs for loop
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const scoreRef = useRef(0); // Ref for score to draw in loop without dependency
    const highScoreRef = useRef(0);

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
            highScoreRef.current = user.user_metadata.high_score;
        }
    }, [user]);

    const saveHighScore = async (newScore) => {
        if (!user) return;
        if (newScore > highScore) {
            setHighScore(newScore);
            highScoreRef.current = newScore;
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
        setFinalScore(0);
        scoreRef.current = 0;
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
    }, [jump, gameState]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    // Cleanup game loop on unmount only
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

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
            scoreRef.current += 1;
            // Removed setState here to avoid re-renders during loop
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

        // Draw HUD (Scores) within Canvas
        ctx.textAlign = "right";
        ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#1e293b"; // slate-800
        ctx.fillText(scoreRef.current.toString(), canvas.width - 20, 40);

        ctx.fillStyle = "#94a3b8"; // slate-400
        ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
        ctx.fillText(`HI ${highScoreRef.current}`, canvas.width - 20, 60);

        if (collision) {
            setGameState("gameover");
            setFinalScore(scoreRef.current); // Update state only on game over
            saveHighScore(scoreRef.current);
            cancelAnimationFrame(requestRef.current);
        } else {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    return (
        <div className={`flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 ${size === 'large' ? 'w-[800px]' : 'w-[500px]'}`}>

            {/* White UI Blob Container */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-6 w-full relative overflow-hidden">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Play While You Wait
                    </h3>
                    <span className="bg-blue-50 text-blue-600 text-xs font-mono px-3 py-1 rounded-full">
                        ~2 min est.
                    </span>
                </div>

                {/* Game Canvas Container */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer shadow-inner" onClick={jump}>
                    <canvas
                        ref={canvasRef}
                        width={size === 'large' ? 800 : 450}
                        height={size === 'large' ? 400 : 250}
                        className="bg-slate-50 w-full h-full block"
                    />

                    {/* Start Screen Overlay */}
                    {gameState === "start" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm transition-all hover:bg-white/30">
                            <div className="bg-white p-4 rounded-full shadow-lg mb-3 animate-bounce">
                                <Play className="w-8 h-8 text-blue-500 ml-1" />
                            </div>
                            <p className="font-bold text-slate-700 text-sm bg-white/90 px-4 py-2 rounded-full shadow-sm">
                                Press Space to Start
                            </p>
                        </div>
                    )}

                    {/* Game Over Screen Overlay */}
                    {gameState === "gameover" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
                            <p className="text-2xl font-black text-slate-800 mb-1">Game Over</p>
                            <p className="text-sm font-medium text-slate-500 mb-6 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                                Score: {finalScore}
                            </p>
                            <button
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                                className="px-6 py-2.5 bg-slate-900 text-white rounded-full shadow-lg hover:scale-105 hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-sm"
                            >
                                <RotateCcw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-6 text-sm text-slate-400 font-medium animate-pulse text-center">
                Generating your video in the background...
            </p>
        </div>
    );
}
