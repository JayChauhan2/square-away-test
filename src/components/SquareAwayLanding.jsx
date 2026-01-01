import '../index.css';
import MathJaxWrapper from "./MathJaxWrapper";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { X, ArrowLeft, Trash2 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import DropTheBall from './DropTheBall';

function NotesDisplay({ content, onContentChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleSave = async () => {
    await onContentChange(editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    // Added h-full to ensure it takes available space if needed, 
    // though the parent controls the height sync.
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Converted Notes
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-96 p-4 border rounded font-mono text-sm"
        />
      ) : (
        <div className="prose prose-lg prose-blue max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner({ message }) {
  return (
    <div className="mt-8 flex flex-col items-center">
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
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Video Explanation</h2>
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full"
          src={videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

export default function SquareAwayLanding() {
  const [files, setFiles] = useState([]);
  const [notesContent, setNotesContent] = useState('');
  const [notesTitle, setNotesTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Supabase Integration
  const { user } = useAuth();
  const [pastNotes, setPastNotes] = useState([]);

  // Replace direct state with URL param sync
  const [searchParams, setSearchParams] = useSearchParams();
  const currentNoteId = searchParams.get('note');

  // Success Toast Logic
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState('');

  useEffect(() => {
    const hash = window.location.hash;

    // Check for explicit navigation success state
    if (location.state?.successMessage) {
      setShowSuccessToast(location.state.successMessage);
      clearToast();
    }
    // Check for Supabase Email Confirmation / OAuth redirect in URL hash
    else if (hash && hash.includes('type=signup') && !hash.includes('error')) {
      setShowSuccessToast('Email Confirmed! Authentication Successful.');
      clearToast();
    }
  }, [location]);

  const clearToast = () => {
    const timer = setTimeout(() => {
      setShowSuccessToast('');
      // Clear state/hash without reloading to prevent toast on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const setCurrentNoteId = (id) => {
    if (id) setSearchParams({ note: id });
    else setSearchParams({});
  };

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Sync content when URL param changes
  useEffect(() => {
    if (!currentNoteId) {
      // Reset view
      setNotesContent('');
      setNotesTitle('');
      setVideoUrl('');
      setChatMessages([]); // Reset chat when clearing note
    } else {
      // Find note in pastNotes and set content
      const note = pastNotes.find(n => n.id === currentNoteId);
      if (note) {
        setNotesContent(note.content);
        setNotesTitle(note.title);
        if (note.video_url) setVideoUrl(note.video_url);
        else setVideoUrl('');

        // Load chat history if available
        setChatMessages(note.chat_history || []);
      }
    }
  }, [currentNoteId, pastNotes]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setPastNotes(data);
    }
  };

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // REFS FOR LAYOUT SYNC
  const notesRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null); // To auto-scroll to bottom of chat

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);


  // 1. HEIGHT SYNCHRONIZATION
  // This effect runs whenever the notes content changes.
  // It grabs the height of the notes column and forces the chat column to match it.
  useEffect(() => {
    if (notesRef.current && chatContainerRef.current) {
      // Get height of the notes wrapper
      const height = notesRef.current.clientHeight;
      // Apply it to the chat wrapper
      chatContainerRef.current.style.height = `${height}px`;
    }
  }, [notesContent]);

  /* 
     sendMessage now accepts 'text' argument to support the cleaner ChatInterface component 
     that manages its own input state to prevent re-renders of the whole page 
  */
  /* 
     sendMessage now accepts 'text' argument to support the cleaner ChatInterface component 
     that manages its own input state to prevent re-renders of the whole page 
  */
  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = text.trim();
    const newMessage = { role: "user", content: userMsg };
    const updatedMessages = [...chatMessages, newMessage];

    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notesContent,
          user_message: userMsg,
          chat_history: chatMessages
        })
      });
      const data = await response.json();
      const finalMessages = [...updatedMessages, { role: "assistant", content: data.answer }];
      setChatMessages(finalMessages);

      // Save chat history to Supabase
      if (currentNoteId) {
        await supabase
          .from('notes')
          .update({ chat_history: finalMessages })
          .eq('id', currentNoteId);

        // Update local state to reflect change so switching back/forth doesn't lose it
        setPastNotes(prev => prev.map(n =>
          n.id === currentNoteId ? { ...n, chat_history: finalMessages } : n
        ));
      }

    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const practiceMessages = [
    "Ready to test your understanding?",
    "Let's see how well you know this!",
    "Time to check your knowledge!",
    "Think you've got this? Let's find out!",
    "Up for a challenge?",
    "Can you handle this question?",
    "Let's test what you've learned!",
    "Are you prepared to answer?",
    "Time for a quick knowledge check!",
    "Ready for a brain workout?",
    "How sharp is your mind today?",
    "Let's see your skills in action!",
    "Are you up for a quiz?",
    "Put your knowledge to the test!",
    "Think fast! Here's your challenge!"
  ]

  const handleFiles = (selectedFiles) => {
    const imageFiles = Array.from(selectedFiles).filter(file =>
      file.type.startsWith('image/')
    );
    setFiles(imageFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  const removeFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    setIsProcessing(true);
    setLoadingMessage('Uploading images and extracting text...');
    setNotesContent('');
    setVideoUrl('');

    try {
      const response = await fetch('http://127.0.0.1:5000/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setNotesContent(result.extracted_text);
        setNotesTitle(result.notes_title);
        setIsProcessing(false);
        setLoadingMessage('');

        // Save new note to Supabase
        if (user) {
          const { data, error } = await supabase.from('notes').insert([{
            user_id: user.id,
            title: result.notes_title || 'New Note',
            content: result.extracted_text
          }]).select();

          if (!error && data && data[0]) {
            setCurrentNoteId(data[0].id);
            setPastNotes([data[0], ...pastNotes]);
          }
        }

        generateVideo(result.extracted_text);

      } else {
        alert('Error uploading file');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
      setIsProcessing(false);
    }
  };

  const pollVideo = async () => {
    const timestamp = new Date().getTime();
    const videoCheckUrl = `http://127.0.0.1:5000/video?t=${timestamp}`;

    try {
      const response = await fetch(videoCheckUrl, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(videoCheckUrl);
        setIsGeneratingVideo(false);

        // Upload to Supabase Storage and update note
        uploadVideoToSupabase();
      } else {
        setTimeout(pollVideo, 3000);
      }
    } catch (err) {
      setTimeout(pollVideo, 3000);
    }
  };

  const uploadVideoToSupabase = async () => {
    if (!currentNoteId || !user) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/video');
      const blob = await response.blob();
      const file = new File([blob], `video_${currentNoteId}.mp4`, { type: 'video/mp4' });

      const fileName = `${user.id}/${currentNoteId}.mp4`;
      const { data, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      if (publicData.publicUrl) {
        await supabase
          .from('notes')
          .update({ video_url: publicData.publicUrl })
          .eq('id', currentNoteId);

        // CRITICAL FIX: Update local state so the useEffect doesn't see stale data and wipe the URL
        setPastNotes(prev => prev.map(n =>
          n.id === currentNoteId ? { ...n, video_url: publicData.publicUrl } : n
        ));
      }
    } catch (error) {
      console.error('Error uploading video to Supabase:', error);
    }
  };

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, noteId: null });

  const deleteNote = (noteId, e) => {
    e.stopPropagation(); // Prevent opening the note
    setDeleteModal({ show: true, noteId });
  };

  const confirmDelete = async () => {
    const noteId = deleteModal.noteId;
    if (!noteId) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setPastNotes(prev => prev.filter(n => n.id !== noteId));
      if (currentNoteId === noteId) {
        setCurrentNoteId(null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note.");
    } finally {
      setDeleteModal({ show: false, noteId: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, noteId: null });
  };

  const generateVideo = async (text) => {
    setIsGeneratingVideo(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'started') {
          pollVideo();
        }
      } else {
        alert('Error starting video generation');
        setIsGeneratingVideo(false);
      }
    } catch (err) {
      console.error(err);
      setIsGeneratingVideo(false);
    }
  };

  const handleNotesSave = async (newContent) => {
    try {
      if (currentNoteId) {
        const { error } = await supabase
          .from('notes')
          .update({ content: newContent, updated_at: new Date() })
          .eq('id', currentNoteId);

        if (error) throw error;
      } else if (user) {
        const { data, error } = await supabase
          .from('notes')
          .insert([{
            user_id: user.id,
            content: newContent,
            title: notesTitle || 'Untitled Note'
          }])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setCurrentNoteId(data[0].id);
          // Refresh list or prepend
          fetchNotes();
        }
      }

      setNotesContent(newContent);
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Error saving notes');
    }
  };

  const handlePractice = () => {
    if (!notesTitle) return;
    const sanitizedTitle = encodeURIComponent(notesTitle);
    navigate(`/questions/${sanitizedTitle}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen flex flex-col items-center justify-center pt-28 pb-8 px-8 relative overflow-hidden">

      {/* Background Blobs (Consistent) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
        <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
        <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
      </div>

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-green-500 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-green-500/30 flex items-center gap-2">
            <span>✓</span> {showSuccessToast}
          </div>
        </div>
      )}

      {!notesContent && (
        <>
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Upload your Notes to Begin</h1>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
            className="w-96 h-64 border-4 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <p className="text-gray-500 mb-2">Drag & Drop your images here</p>
            <p className="text-gray-400 text-sm">or click to select files</p>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </>
      )}

      {/* PAST FILES LIST - Refactored UI */}
      {/* Only show if NO active notes content AND NO files selected */}
      {!notesContent && files.length === 0 && pastNotes.length > 0 && (
        <div className="w-full max-w-5xl space-y-12 relative z-10 mt-12">

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Past Uploads</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setNotesContent(note.content);
                    setNotesTitle(note.title);
                    setCurrentNoteId(note.id);
                    if (note.video_url) setVideoUrl(note.video_url);
                    else setVideoUrl(''); // Reset if no video
                  }}
                  className="bg-white/50 p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:bg-white transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-slate-800 truncate group-hover:text-blue-600 transition-colors pr-8">
                      {note.title || 'Untitled Note'}
                    </h3>
                    {note.video_url && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex-none">Video</span>}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="absolute top-6 right-6 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <p className="text-sm text-slate-500 mb-4 line-clamp-3">
                    {note.content}
                  </p>

                  <div className="text-xs text-slate-400 font-medium">
                    {new Date(note.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && !isProcessing && !notesContent && (
        <div className="mt-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* File Stack Preview */}
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
            {files.map((file, index) => (
              <div
                key={index}
                className="group relative bg-white p-2 pb-8 w-32 h-40 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] 
                           rotate-1 hover:rotate-0 transition-all duration-300 hover:scale-105 hover:z-10
                           border border-slate-100"
                style={{
                  transform: `rotate(${Math.random() * 6 - 3}deg)`
                }}
              >
                {/* Paper Effect Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-50 pointer-events-none" />

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 z-20"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="h-24 w-full overflow-hidden bg-slate-100 relative mb-2 rounded-sm border border-slate-200">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Filename with truncation */}
                <p className="text-[10px] text-center text-slate-500 w-full truncate px-1">
                  {file.name}
                </p>

                {/* Lines effect for paper look */}
                <div className="absolute bottom-2 left-2 right-2 h-1 bg-slate-200/50 rounded-full" />
                <div className="absolute bottom-4 left-2 right-4 h-1 bg-slate-200/50 rounded-full" />
              </div>
            ))}
          </div>

          <div className="relative group">
            <button
              onClick={handleUpload}
              className="relative overflow-hidden px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full 
                       shadow-xl shadow-blue-500/30 transform transition-all duration-300 
                       hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/40 font-bold text-lg tracking-wide"
            >
              <span className="relative z-10">Square Away!</span>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer z-0">
                <div className="w-2/3 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
              </div>
            </button>
          </div>
        </div>
      )}

      {isProcessing && <LoadingSpinner message={loadingMessage} />}

      {notesContent && !isProcessing && (
        <div className="mt-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentNoteId(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Uploads</span>
            </button>
          </div>

          {/* NOTES + CHAT ROW */}
          <div className="flex gap-6 items-stretch">

            {/* LEFT: MATH NOTES */}
            {/* Added ref={notesRef} to measure this side */}
            <div className="flex-1" ref={notesRef}>
              <MathJaxWrapper>
                <NotesDisplay
                  content={notesContent}
                  onContentChange={handleNotesSave}
                />
              </MathJaxWrapper>
            </div>

            {/* RIGHT: CHATBOT UI - Extracted to prevent re-renders */}
            <div
              ref={chatContainerRef}
              className="w-[400px]"
              style={{ height: 'auto' }} // Initial style, sync handled by effect
            >
              <ChatInterface
                messages={chatMessages}
                loading={chatLoading}
                onSendMessage={sendMessage}
              />
            </div>
          </div>

          {/* VIDEO GENERATION LOADING */}
          {isGeneratingVideo && (
            <div className="mt-8 flex justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DropTheBall />
            </div>
          )}

          {/* VIDEO PLAYER */}
          {videoUrl && !isGeneratingVideo && (
            <VideoPlayer videoUrl={videoUrl} />
          )}

          {/* QUESTIONS BUTTON CARD */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Practice Questions
            </h2>
            <p className="text-gray-700 mb-4 text-center">
              {
                practiceMessages[
                Math.floor(Math.random() * practiceMessages.length)
                ]
              }{" "}
              Go to the questions page for this topic.
            </p>
            <button
              onClick={handlePractice}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Go to Questions
            </button>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full transform scale-100 transition-all border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Note?</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 shadow-md shadow-red-200 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
