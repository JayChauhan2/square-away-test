import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Send, Play, Video } from 'lucide-react';
import DropTheBall from './DropTheBall';

function LoadingSpinner({ message }) {
    return (
        <div className="mt-8 flex flex-col items-center relative z-10">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
    );
}

function VideoPlayer({ videoUrl }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 relative z-10 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Video Explanation</h2>
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                    controls
                    className="w-full h-full"
                    src={videoUrl}
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}

export default function VideosPage() {
    const { user } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [pastVideos, setPastVideos] = useState([]);

    // We no longer create a note ID upfront
    const promptRef = useRef(''); // Keep track of prompt for final save

    // Typewriter Effect State
    const [placeholder, setPlaceholder] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);

    const typeWriterTexts = [
        "What do you want to learn about today?",
        "Explain the theory of relativity...",
        "How do plants generate energy?",
        "Describe the history of the Roman Empire...",
        "Why is the sky blue?",
        "Teach me about quantum mechanics..."
    ];

    useEffect(() => {
        const currentText = typeWriterTexts[textIndex];
        let timeout;

        if (isTyping) {
            if (charIndex < currentText.length) {
                timeout = setTimeout(() => {
                    setPlaceholder(prev => prev + currentText[charIndex]);
                    setCharIndex(prev => prev + 1);
                }, 50); // Typing speed
            } else {
                timeout = setTimeout(() => setIsTyping(false), 2000); // Pause before deleting
            }
        } else {
            if (charIndex > 0) {
                timeout = setTimeout(() => {
                    setPlaceholder(prev => prev.slice(0, -1));
                    setCharIndex(prev => prev - 1);
                }, 30); // Deleting speed
            } else {
                setIsTyping(true);
                setTextIndex((prev) => (prev + 1) % typeWriterTexts.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isTyping, textIndex]);


    useEffect(() => {
        if (user) {
            fetchVideos();
        }
    }, [user]);

    const fetchVideos = async () => {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .not('video_url', 'is', null) // Only fetch notes with videos
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching videos:', error);
        } else {
            setPastVideos(data);
        }
    };

    const handleSend = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setCurrentVideoUrl(''); // Clear previous video view
        setLoadingMessage('Initializing video generation...');
        promptRef.current = prompt; // Save prompt for later

        try {
            // 2. Start generation directly (don't create note yet)
            const response = await fetch('http://127.0.0.1:5000/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'started') {
                    setLoadingMessage('Generating explanation...');
                    pollVideo();
                }
            } else {
                alert('Error starting video generation');
                setIsGenerating(false);
            }
        } catch (err) {
            console.error(err);
            setIsGenerating(false);
            alert('Failed to connect to server');
        }
    };

    const pollVideo = async () => {
        const timestamp = new Date().getTime();
        const videoCheckUrl = `http://127.0.0.1:5000/video?t=${timestamp}`;

        try {
            const response = await fetch(videoCheckUrl, { method: 'HEAD' });
            if (response.ok) {
                setCurrentVideoUrl(videoCheckUrl);
                setIsGenerating(false);
                setPrompt(''); // Clear input on success
                // Upload to storage and save URL, passing the prompt content
                uploadVideoAndCreateNote(promptRef.current);
            } else {
                setTimeout(pollVideo, 3000);
            }
        } catch (err) {
            setTimeout(pollVideo, 3000);
        }
    };

    const uploadVideoAndCreateNote = async (contentParams) => {
        if (!user) return;

        try {
            const response = await fetch('http://127.0.0.1:5000/video');
            if (!response.ok) throw new Error('Failed to fetch video blob');

            const blob = await response.blob();
            const timestamp = new Date().getTime();
            const fileName = `${user.id}/video_${timestamp}.mp4`;
            const file = new File([blob], fileName, { type: 'video/mp4' });

            // 1. Upload Video First
            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);

            if (publicData.publicUrl) {
                // 2. Create Note Entry ONLY after successful upload
                await supabase.from('notes').insert([{
                    user_id: user.id,
                    title: contentParams, // Use prompt as title
                    content: contentParams, // Use prompt as content
                    video_url: publicData.publicUrl
                }]);

                // Refresh list to include new video
                fetchVideos();
            }
        } catch (error) {
            console.error('Error saving video:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen relative overflow-hidden flex flex-col items-center">

            {/* Background Blobs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
                <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
                <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
            </div>

            {/* Prompt Area - Centered Vertically */}
            <div className={`w-full max-w-3xl relative z-10 transition-all duration-700 flex flex-col justify-center ${isGenerating || currentVideoUrl ? 'mt-24 mb-8' : 'min-h-[60vh]'}`}>

                {/* Greeting Message (Only show when not generating/watching) */}
                {!isGenerating && !currentVideoUrl && (
                    <h1 className="text-4xl font-bold text-center text-slate-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Create. Learn. Watch.
                    </h1>
                )}

                <div className="relative group">
                    {/* Removed the glow div as requested */}
                    <div className="relative bg-white rounded-2xl shadow-xl flex items-end p-2 border border-slate-200">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={isGenerating}
                            className={`w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-700 text-lg placeholder-slate-400 min-h-[60px] max-h-[200px] resize-none py-3 px-4 rounded-xl transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ height: 'auto', overflowY: 'hidden' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!prompt.trim() || isGenerating}
                            className={`p-3 mb-1 mr-1 rounded-xl flex-shrink-0 transition-all duration-200 
                                ${prompt.trim() && !isGenerating
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:scale-105'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {isGenerating ? (
                <div className="w-full max-w-4xl flex justify-center animate-in fade-in duration-500">
                    <DropTheBall size="large" />
                </div>
            ) : currentVideoUrl ? (
                <div className="w-full max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-700 pb-20">
                    <button
                        onClick={() => setCurrentVideoUrl('')}
                        className="mb-4 text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors relative z-10"
                    >
                        ← Back to Library
                    </button>
                    <VideoPlayer videoUrl={currentVideoUrl} />
                </div>
            ) : (
                /* Library Grid - Styled to match SquareAwayLanding */
                <div className="w-full max-w-5xl space-y-12 relative z-10 animate-in slide-in-from-bottom-8 fade-in duration-700 pb-20">
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Video className="w-6 h-6 text-purple-600" />
                            Your Library
                        </h2>

                        {pastVideos.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Video className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-700 mb-1">No videos yet</h3>
                                <p className="text-slate-500">Type a topic above to generate your first video explanation!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        onClick={() => setCurrentVideoUrl(video.video_url)}
                                        className="bg-white/50 p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:bg-white transition-all duration-300 cursor-pointer group relative"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg text-slate-800 truncate group-hover:text-blue-600 transition-colors pr-8">
                                                {video.title || 'Untitled Video'}
                                            </h3>
                                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex-none">Video</span>
                                        </div>

                                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                                            {video.content}
                                        </p>

                                        <div className="text-xs text-slate-400 font-medium">
                                            {new Date(video.created_at).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
