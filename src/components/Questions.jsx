import '../index.css';

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import KaTeXWrapper from './KaTeXWrapper';
// import FunctionPlot from "./FunctionPlot";

import JSXGraph from "./JSXGraph";

import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ChatInterface from './ChatInterface';

/////////////////////////

function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium text-center">
        {message}
      </p>
    </div>
  );
}

function QuestionSkeleton() {
  return (
    <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg p-8 animate-pulse">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
      </div>

      {/* Question */}
      <div className="mb-8 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-full"></div>
        <div className="h-5 bg-gray-300 rounded w-5/6"></div>
        <div className="h-5 bg-gray-300 rounded w-2/3"></div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Spinner Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
        <LoadingSpinner message="Generating your practice questions… this may take a moment." />
      </div>
    </div>
  );
}

export default function Questions() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [evaluationResults, setEvaluationResults] = useState({}); // Stores AI feedback
  const [isEvaluating, setIsEvaluating] = useState(false); // Loading state for AI grading
  const [showSummary, setShowSummary] = useState(false);

  // Help Section State (AI Tutor & Video)
  const [showHelp, setShowHelp] = useState(false);
  const [helpMode, setHelpMode] = useState('chat'); // 'chat' or 'video'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Review Mode Logic
  const [searchParams] = useSearchParams();
  const practiceId = searchParams.get('practiceId');
  const isReviewMode = !!practiceId;

  // Save practice when summary is shown
  useEffect(() => {
    if (showSummary && user && !isReviewMode) { // Don't save if reviewing
      savePracticeSession();
    }
  }, [showSummary, user, isReviewMode]);

  // Reset help state on question change
  useEffect(() => {
    setShowHelp(false);
    setHelpMode('chat');
    setChatMessages([]);
    setVideoUrl('');
    setIsGeneratingVideo(false);
  }, [currentIndex]);

  const savePracticeSession = async () => {
    // Determine score
    const correctCount = questions.filter(q => isCorrect(q)).length;

    try {
      await supabase.from('practices').insert({
        user_id: user.id,
        topic: topic,
        score: Math.round((correctCount / questions.length) * 100),
        total_questions: questions.length,
        session_data: {
          questions,
          answers,
          submitted,
          evaluationResults
        }
      });
      // Clear local storage on successful save
      localStorage.removeItem(`practice_session_${topic}`);
    } catch (err) {
      console.error("Error saving practice", err);
      alert("Failed to save practice: " + err.message);
    }
  };

  // Load questions (New, Saved, or Review)
  useEffect(() => {
    async function loadQuestions() {
      // 1. Review Mode: Fetch from Supabase
      if (practiceId) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('practices')
            .select('*')
            .eq('id', practiceId)
            .single();

          if (error) throw error;
          if (data && data.session_data) {
            const { questions: q, answers: a, submitted: s, evaluationResults: e } = data.session_data;
            setQuestions(q || []);
            setAnswers(a || {});
            setSubmitted(s || {});
            setEvaluationResults(e || {});
          }
        } catch (err) {
          console.error("Error loading practice review", err);
          alert("Failed to load review.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2. Active Session: Local Storage
      const storageKey = `practice_session_${topic}`;
      const savedSession = localStorage.getItem(storageKey);

      if (savedSession) {
        try {
          const { questions: savedQ, currentIndex: savedIdx, answers: savedAns, submitted: savedSub } = JSON.parse(savedSession);

          if (savedQ && savedQ.length > 0) {
            setQuestions(savedQ);
            setCurrentIndex(savedIdx || 0);
            setAnswers(savedAns || {});
            setSubmitted(savedSub || {});
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing saved session", e);
          localStorage.removeItem(storageKey);
        }
      }

      // 3. New Session: Fetch from API
      try {
        const response = await fetch('http://127.0.0.1:5000/create-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        });

        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    }
    loadQuestions();
  }, [topic, practiceId]);

  // Save to local storage on change
  useEffect(() => {
    if (!questions.length || isReviewMode) return;
    const storageKey = `practice_session_${topic}`;
    localStorage.setItem(storageKey, JSON.stringify({
      questions,
      currentIndex,
      answers,
      submitted
    }));
  }, [questions, currentIndex, answers, submitted, topic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <QuestionSkeleton />
      </div>
    );
  }

  if (!questions.length) {
    if (isReviewMode && !loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center text-gray-600">
          <h2 className="text-xl font-semibold mb-2">Practice Data Not Found</h2>
          <p>This practice session is from an older version and cannot be reviewed.</p>
          <button onClick={() => navigate('/practice')} className="mt-4 text-blue-500 hover:underline">Return to Practice Hub</button>
        </div>
      );
    }
    return <p className="text-center mt-10 text-gray-500">No questions found.</p>;
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isSubmitted = submitted[currentQuestion.id];

  const isCorrect = (question) => {
    if (!submitted[question.id]) return null;
    const userAnswer = answers[question.id];
    if (!userAnswer) return null;

    if (question.type === 'mcq' || question.type === 'boolean') {
      try {
        const parsedAnswer = JSON.parse(userAnswer);
        return parsedAnswer[0].content === question.answer[0].content;
      } catch {
        return false;
      }
    }

    if (question.type === 'free' || question.type === 'word') {
      // Use AI result if available, otherwise simple include check (legacy fallback)
      if (evaluationResults[question.id]) {
        return evaluationResults[question.id].correct;
      }
      return userAnswer.includes(question.answer);
    }
  };

  const handleSelect = (value) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleFreeResponseChange = (e) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!answers[currentQuestion.id]) return;

    // Handle Free Response Grading via AI
    if (currentQuestion.type === 'free' || currentQuestion.type === 'word') {
      setIsEvaluating(true);
      try {
        const response = await fetch('http://127.0.0.1:5000/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: currentQuestion.question.map(p => p.content).join(' '),
            user_answer: answers[currentQuestion.id],
            correct_answer: currentQuestion.answer.map(a => a.content).join('; ')
          })
        });
        const result = await response.json();

        // Store result
        setEvaluationResults(prev => ({
          ...prev,
          [currentQuestion.id]: result
        }));

        setSubmitted(prev => ({ ...prev, [currentQuestion.id]: true }));
      } catch (error) {
        console.error("Grading failed", error);
        // Fallback: mark submitted but maybe show error or default 'needs review'
        setSubmitted(prev => ({ ...prev, [currentQuestion.id]: true }));
      } finally {
        setIsEvaluating(false);
      }
    } else {
      // Normal MCQ/Boolean submit
      setSubmitted(prev => ({ ...prev, [currentQuestion.id]: true }));
    }

    if (currentIndex === questions.length - 1) {
      // Logic to show summary is separate, maybe wait for user to click finish or just set flag
      // But typically we wait for the last "Submit" to resolve. 
      // For async free response, we just handled it above.
      // We'll let the user click "Finish" manually in the render logic if they are done.
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // --- AI Tutor Logic ---
  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = text.trim();
    const newMessage = { role: "user", content: userMsg };

    // If it's the first message for this question, inject context
    let updatedMessages = [...chatMessages, newMessage];
    let contextNote = "";

    if (chatMessages.length === 0) {
      const qText = currentQuestion.question.map(p => p.content).join(' ');
      const cAnswer = currentQuestion.answer.map(a => a.content).join('; ');
      const uAnswer = answers[currentQuestion.id] || "No answer provided";
      const isRight = isCorrect(currentQuestion) ? "Correctly" : "Incorrectly";

      contextNote = `Context: The student answered this question ${isRight}.\nQuestion: ${qText}\nStudent Answer: ${uAnswer}\nCorrect Answer: ${cAnswer}`;
    }

    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: contextNote, // Pass context as "notes" to reuse endpoint
          user_message: userMsg,
          chat_history: chatMessages // Send previous clean history
        })
      });
      const data = await response.json();
      setChatMessages([...updatedMessages, { role: "assistant", content: data.answer }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Video Generation Logic ---
  const pollVideo = async () => {
    const timestamp = new Date().getTime();
    const videoCheckUrl = `http://127.0.0.1:5000/video?t=${timestamp}`;

    try {
      const response = await fetch(videoCheckUrl, { method: 'HEAD' });
      if (response.ok) {
        setVideoUrl(videoCheckUrl);
        setIsGeneratingVideo(false);
      } else {
        setTimeout(pollVideo, 3000);
      }
    } catch (err) {
      setTimeout(pollVideo, 3000);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    const qText = currentQuestion.question.map(p => p.content).join(' ');

    try {
      const response = await fetch('http://127.0.0.1:5000/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: qText }),
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



  const correctCount = questions.filter(q => isCorrect(q)).length;

  // --- SUMMARY SCREEN (Organic / Fluid Style) ---
  if (showSummary) {
    const accuracy = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50 flex items-center justify-center p-6">

        {/* Floating liquid accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse" />

        <div className="relative bg-white/70 backdrop-blur-xl w-full max-w-3xl rounded-3xl shadow-xl p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold text-gray-800 mb-3">
              Practice Complete
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Take a breath. Learning isn’t about perfection — it’s about flow,
              clarity, and momentum.
            </p>
          </div>

          {/* Score */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Your Progress</span>
              <span>{accuracy}% Mastery</span>
            </div>

            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-teal-400 to-purple-400 transition-all duration-700 ease-out"
                style={{ width: `${accuracy}%` }}
              />
            </div>

            <p className="text-center text-gray-700 mt-4">
              You answered <span className="font-medium">{correctCount}</span> out of{" "}
              <span className="font-medium">{questions.length}</span> questions correctly.
            </p>
          </div>

          {/* Question Review */}
          <div className="space-y-5 max-h-80 overflow-y-auto pr-2 mb-10">
            {questions.map((q, idx) => {
              const correct = isCorrect(q);
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-white shadow-sm border border-gray-100"
                >
                  <h3 className="font-medium text-gray-800 mb-2">
                    Question {idx + 1}
                  </h3>

                  <div className="text-gray-700 mb-3">
                    {q.question.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i}>{part.content}</span>
                      ) : (
                        <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                      )
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Your Answer:</span>{" "}
                      {answers[q.id] || "No response"}
                    </p>
                    <p>
                      <span className="font-medium">Correct Answer:</span>{" "}
                      {q.answer.map(a => a.content).join(", ")}
                    </p>
                  </div>

                  <p
                    className={`mt-3 font-medium ${correct ? "text-emerald-600" : "text-rose-500"
                      }`}
                  >
                    {correct ? "✓ Understood" : "○ Still forming"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setShowSummary(false);
                setCurrentIndex(0);
                setSubmitted({});
                setAnswers({});
                window.location.reload();
              }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-md hover:opacity-90 transition"
            >
              Start New Practice
            </button>

            <button
              onClick={() => {
                // Storage is already cleared in savePracticeSession or we can force clear here to be safe
                localStorage.removeItem(`practice_session_${topic}`);
                navigate('/practice');
              }}
              className="px-8 py-3 rounded-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
            >
              Back to Practice Hub
            </button>
          </div>
        </div>
      </div>
    );
  }


  // --- QUESTION PAGE ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Blobs (Consistent) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
        <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
        <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
      </div>

      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8 relative z-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isReviewMode ? `Review - ${topic}` : `Practice Questions - ${topic}`}
          </h1>
          <p className="text-gray-600">
            Question {currentIndex + 1} of {questions.length}
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ... (Existing Content, skipping to Navigation updates) ... */}



        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.question.map((part, idx) =>
              part.type === "text" ? (
                <span key={idx}>{part.content}</span>
              ) : (
                <KaTeXWrapper key={idx}>{part.content}</KaTeXWrapper>
              )
            )}
          </h2>

          {/* Graphs */}
          {currentQuestion.graphs &&
            currentQuestion.graphs.map((graph, idx) => (
              <JSXGraph
                key={idx}
                equationType={graph.equationType}
                expr1={graph.expr1}
                expr2={graph.expr2}
                range={graph.range || [-10, 10]}
                width={graph.width || 300}
                height={graph.height || 200}
              />
            ))}

          {/* Boolean */}
          {currentQuestion.type === "boolean" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                    ${answers[currentQuestion.id] === JSON.stringify(option)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"}
                    ${isSubmitted || isReviewMode ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={answers[currentQuestion.id] === JSON.stringify(option)}
                    onChange={() => handleSelect(JSON.stringify(option))}
                    disabled={isReviewMode}
                  />
                  {option.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i}>{part.content}</span>
                    ) : (
                      <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                    )
                  )}
                </label>
              ))}
            </div>
          )}

          {/* MCQ */}
          {currentQuestion.type === "mcq" && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer
                    ${answers[currentQuestion.id] === JSON.stringify(option)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"}
                    ${isSubmitted || isReviewMode ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={answers[currentQuestion.id] === JSON.stringify(option)}
                    onChange={() => handleSelect(JSON.stringify(option))}
                    disabled={isReviewMode}
                  />
                  {option.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i}>{part.content}</span>
                    ) : (
                      <KaTeXWrapper key={i}>{part.content}</KaTeXWrapper>
                    )
                  )}
                </label>
              ))}
            </div>
          )}

          {/* Free / Word */}
          {(currentQuestion.type === "free" || currentQuestion.type === "word") && (
            <div className="space-y-2">
              <textarea
                className="w-full h-32 p-4 border rounded-lg"
                value={answers[currentQuestion.id] || ""}
                onChange={handleFreeResponseChange}
                placeholder="Your Answer Here..."
                disabled={isSubmitted || isReviewMode}
              />
            </div>
          )}

          {/* Feedback (On Review Mode or AFTER submit) */}
          {(isReviewMode || isSubmitted) && (
            <div className="mt-4">
              {isCorrect(currentQuestion) === true && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">✔ Correct</p>
                  {evaluationResults[currentQuestion.id]?.feedback && (
                    <p className="text-sm text-green-600 mt-1">{evaluationResults[currentQuestion.id].feedback}</p>
                  )}
                </div>
              )}

              {isCorrect(currentQuestion) === false && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">✘ Incorrect</p>
                  {evaluationResults[currentQuestion.id]?.feedback && (
                    <p className="text-sm text-red-600 mt-1">{evaluationResults[currentQuestion.id].feedback}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">Correct Answer: </span>
                    {currentQuestion.answer.map(a => a.content).join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Previous
            </button>

            {/* Review Mode Navigation */}
            {isReviewMode ? (
              <div className="flex gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSummary(true)}
                    className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    View Summary
                  </button>
                )}
              </div>
            ) : (
              /* Standard Practice Mode Navigation */
              <>
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!answers[currentQuestion.id]}
                    className={`px-6 py-2 rounded text-white transition-colors
                          ${answers[currentQuestion.id] ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Submit
                  </button>
                ) : isEvaluating ? (
                  <button disabled className="px-6 py-2 rounded bg-blue-300 text-white cursor-wait">
                    Grading...
                  </button>
                ) : currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSummary(true)}
                    className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    Finish
                  </button>
                )}
              </>
            )}
          </div>

          {/* Help Section - Appears after submission/feedback */}
          {(isReviewMode || isSubmitted) && (
            <div className="mt-8 border-t border-gray-200 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {!showHelp ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowHelp(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <span>✨ Need Help understanding this?</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Help Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setHelpMode('chat')}
                      className={`flex-1 py-3 font-medium text-sm transition-colors
                        ${helpMode === 'chat' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Ask AI Tutor
                    </button>
                    <button
                      onClick={() => setHelpMode('video')}
                      className={`flex-1 py-3 font-medium text-sm transition-colors
                        ${helpMode === 'video' ? 'bg-white text-purple-600 border-b-2 border-purple-500' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Video Explanation
                    </button>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="px-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-0 bg-white">
                    {helpMode === 'chat' && (
                      <div className="h-96">
                        <ChatInterface
                          messages={chatMessages}
                          loading={chatLoading}
                          onSendMessage={handleSendMessage}
                          title="AI Tutor"
                          placeholder="Ask specifically about this problem..."
                        />
                      </div>
                    )}

                    {helpMode === 'video' && (
                      <div className="p-6 flex flex-col items-center">
                        {!videoUrl && !isGeneratingVideo ? (
                          <div className="text-center space-y-4">
                            <p className="text-slate-600">
                              Generate a custom video explanation for this exact problem.
                            </p>
                            <button
                              onClick={handleGenerateVideo}
                              className="px-8 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md hover:bg-purple-700 transition"
                            >
                              Generate Video
                            </button>
                          </div>
                        ) : isGeneratingVideo ? (
                          <div className="flex flex-col items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                            <p className="text-purple-700 font-medium">Creating your explanation... (this takes ~30s)</p>
                          </div>
                        ) : (
                          <div className="w-full">
                            <video
                              controls
                              className="w-full rounded-xl shadow-lg border border-slate-200"
                              src={videoUrl}
                              autoPlay
                            >
                              Your browser does not support the video tag.
                            </video>
                            <button
                              onClick={() => setVideoUrl('')}
                              className="mt-4 text-sm text-slate-500 hover:text-red-500"
                            >
                              Generate New Video
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
