import '../index.css';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

export default function Practice() {
  const navigate = useNavigate();

  const topics = {
    "Kindergarten": {
      "Counting": ["Counting to 10", "Counting to 20", "Counting by 2s, 5s, 10s"],
      "Shapes": ["Circle", "Square", "Triangle", "Rectangle"],
      "Basic Addition": ["Adding 0-5", "Adding 6-10", "Word Problems"],
      "Basic Subtraction": ["Subtracting 0-5", "Subtracting 6-10", "Word Problems"]
    },
    "1st Grade": {
      "Addition": ["One-digit Addition", "Two-digit Addition", "Adding with Carrying"],
      "Subtraction": ["One-digit Subtraction", "Two-digit Subtraction", "Subtracting with Borrowing"],
      "Time": ["Reading Clocks", "Hours & Minutes", "AM/PM Concept"],
      "Money": ["Identifying Coins", "Counting Coins", "Making Change"]
    },
    "2nd Grade": {
      "Addition & Subtraction": ["Adding 3-digit numbers", "Subtracting 3-digit numbers", "Word Problems"],
      "Multiplication": ["Times Tables 1-10", "Multiplying by 2-digit numbers"],
      "Division": ["Basic Division", "Division with Remainders", "Word Problems"],
      "Fractions": ["Identifying Fractions", "Equivalent Fractions", "Adding/Subtracting Fractions"]
    },
    "3rd Grade": {
      "Multiplication & Division": ["Multiplying 2-digit numbers", "Long Division", "Word Problems"],
      "Fractions": ["Simplifying Fractions", "Comparing Fractions", "Adding/Subtracting Fractions"],
      "Decimals": ["Introduction to Decimals", "Adding/Subtracting Decimals", "Comparing Decimals"],
      "Geometry": ["Perimeter & Area", "Angles", "Shapes"]
    },
    "4th Grade": {
      "Decimals": ["Place Value", "Rounding Decimals", "Adding/Subtracting Decimals"],
      "Fractions": ["Multiplying Fractions", "Dividing Fractions", "Fraction Word Problems"],
      "Long Division": ["Division by 1-digit numbers", "Division by 2-digit numbers", "Remainders"],
      "Angles": ["Acute, Right, Obtuse", "Measuring Angles", "Angle Relationships"]
    },
    "5th Grade": {
      "Decimals": ["Multiplying/Dividing Decimals", "Decimal Word Problems"],
      "Fractions": ["Mixed Numbers", "Improper Fractions", "Operations with Fractions"],
      "Volume": ["Volume of Cubes & Rectangular Prisms", "Word Problems"],
      "Graphs": ["Bar Graphs", "Line Graphs", "Coordinate Plane"]
    },
    "6th Grade": {
      "Ratios": ["Understanding Ratios", "Equivalent Ratios", "Ratio Word Problems"],
      "Proportions": ["Solving Proportions", "Proportions in Real Life"],
      "Integers": ["Adding/Subtracting Integers", "Multiplying/Dividing Integers", "Number Line"],
      "Expressions": ["Simplifying Expressions", "Evaluating Expressions", "Combining Like Terms"]
    },
    "7th Grade": {
      "Linear Equations": ["Solving One-Step Equations", "Two-Step Equations", "Word Problems"],
      "Inequalities": ["Solving Inequalities", "Graphing Inequalities"],
      "Probability": ["Simple Probability", "Compound Probability", "Independent & Dependent Events"],
      "Statistics": ["Mean, Median, Mode", "Range", "Interpreting Data"]
    },
    "8th Grade": {
      "Exponents": ["Laws of Exponents", "Scientific Notation", "Negative Exponents"],
      "Functions": ["Function Notation", "Linear Functions", "Domain & Range"],
      "Pythagorean Theorem": ["Finding Hypotenuse", "Finding Legs", "Word Problems"],
      "Transformations": ["Translation", "Reflection", "Rotation", "Dilation"]
    },
    "Algebra I": {
      "Linear Equations": ["Slope-Intercept Form", "Point-Slope Form", "Graphing"],
      "Quadratics": ["Factoring Quadratics", "Quadratic Formula", "Graphing Parabolas"],
      "Polynomials": ["Adding/Subtracting Polynomials", "Multiplying Polynomials", "Special Products"],
      "Factoring": ["GCF", "Trinomials", "Difference of Squares"]
    },
    "Geometry": {
      "Triangles": ["Congruent Triangles", "Pythagorean Theorem", "Special Triangles"],
      "Circles": ["Radius & Diameter", "Circumference & Area", "Arcs & Angles"],
      "Coordinate Geometry": ["Distance Formula", "Midpoint Formula", "Equation of a Line"],
      "Proofs": ["Two-Column Proofs", "Paragraph Proofs", "Proofs with Algebra"]
    },
    "Algebra II": {
      "Polynomials": ["Polynomial Division", "Roots & Zeros", "Graphing Polynomials"],
      "Rational Expressions": ["Simplifying", "Multiplying/Dividing", "Adding/Subtracting"],
      "Logarithms": ["Log Properties", "Solving Log Equations", "Exponential vs Logarithmic Functions"],
      "Complex Numbers": ["Addition/Subtraction", "Multiplication/Division", "Polar Form"]
    },
    "Pre-Calculus": {
      "Functions": ["Linear, Quadratic, Polynomial Functions", "Inverse Functions", "Composition of Functions"],
      "Trigonometry": ["Unit Circle", "Trig Identities", "Graphs of Trig Functions"],
      "Sequences & Series": ["Arithmetic Sequences", "Geometric Sequences", "Sigma Notation"],
      "Limits": ["Concept of a Limit", "One-Sided Limits", "Limit Laws"]
    },
    "Calculus AB": {
      "Limits": ["Limit Definition", "Limit Laws", "Continuity"],
      "Derivatives": ["Power Rule", "Product/Quotient Rule", "Chain Rule"],
      "Integrals": ["Definite Integrals", "Indefinite Integrals", "Area Under Curve"],
      "Applications": ["Optimization", "Related Rates", "Motion Problems"]
    },
    "Calculus BC": {
      "Limits": ["Limits at Infinity", "Continuity", "L'Hôpital's Rule"],
      "Derivatives": ["Higher Order Derivatives", "Implicit Differentiation", "Applications"],
      "Integrals": ["Integration by Parts", "Trapezoidal Rule", "Improper Integrals"],
      "Series": ["Taylor Series", "Maclaurin Series", "Convergence Tests"],
      "Parametric Equations": ["Derivatives of Parametrics", "Arc Length", "Area under Parametric Curves"]
    },
    "College Math": {
      "Linear Algebra": ["Matrix Operations", "Determinants", "Vector Spaces", "Eigenvalues/Eigenvectors"],
      "Discrete Math": ["Logic & Proofs", "Set Theory", "Combinatorics", "Graph Theory"],
      "Probability & Statistics": ["Probability Rules", "Random Variables", "Distributions", "Hypothesis Testing"],
      "Differential Equations": ["First Order DEs", "Second Order DEs", "Laplace Transforms", "Applications"]
    }
  };


  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [selectedSubSubtopic, setSelectedSubSubtopic] = useState(null);

  const { user } = useAuth();
  const [pastPractices, setPastPractices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalPractices: 0,
    perfectScores: 0
  });

  useEffect(() => {
    if (user) {
      fetchPractices();
    }
  }, [user]);

  const fetchPractices = async () => {
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const practices = data || [];
      setPastPractices(practices);

      // Process Stats
      if (practices.length > 0) {
        const totalScore = practices.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avg = Math.round(totalScore / practices.length);
        const perfect = practices.filter(p => p.score === 100).length;

        setStats({
          avgScore: avg,
          totalPractices: practices.length,
          perfectScores: perfect
        });

        // Process Chart Data (Need ascending order for time series)
        // Clone array to reverse without mutating original displayed list
        const chartData = [...practices]
          .reverse()
          .map(p => ({
            date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: p.score,
            topic: p.topic.split(':')[0] // Shorten topic for display
          }));

        setChartData(chartData);
      }

    } catch (err) {
      console.error("Error fetching practices:", err);
    }
  };

  const handleStartPractice = () => {
    if (selectedTopic && selectedSubtopic && selectedSubSubtopic) {
      // Encode each part to safely use in URL
      const url = `/questions/${encodeURIComponent(selectedTopic + " " + selectedSubtopic + ": " + selectedSubSubtopic)}`;
      navigate(url);
    }
  };


  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden p-6">

      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl top-10 left-5 animate-[blob_15s_linear_infinite]" />
        <div className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl bottom-20 right-10 animate-[blob_20s_linear_infinite]" />
        <div className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl top-1/2 left-1/2 animate-[blob_18s_linear_infinite]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">

        {/* Page Title */}
        <h1 className="text-5xl md:text-6xl font-light text-slate-900 text-center mb-8">
          Ready for Practice?
        </h1>

        {/* Main Topic Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800">Select a Main Topic</h2>
          <div className="flex flex-wrap gap-4">
            {Object.keys(topics).map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setSelectedSubtopic(null);
                  setSelectedSubSubtopic(null);
                }}
                className={`px-5 py-3 rounded-full text-lg font-medium transition-all duration-300 shadow-md
                  ${selectedTopic === topic
                    ? 'bg-blue-500 text-white shadow-blue-300/40 scale-105'
                    : 'bg-white/20 text-slate-800 hover:bg-blue-100/50'}
                `}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Subtopic Selection */}
        {selectedTopic && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Select a Subtopic</h2>
            <div className="flex flex-wrap gap-4">
              {Object.keys(topics[selectedTopic]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubtopic(sub);
                    setSelectedSubSubtopic(null);
                  }}
                  className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 shadow-md
                    ${selectedSubtopic === sub
                      ? 'bg-green-500 text-white shadow-green-300/40 scale-105'
                      : 'bg-white/20 text-slate-800 hover:bg-green-100/50'}
                  `}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Subtopic Selection */}
        {selectedSubtopic && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Select a Specific Topic</h2>
            <div className="flex flex-wrap gap-4">
              {topics[selectedTopic][selectedSubtopic].map((subsub) => (
                <button
                  key={subsub}
                  onClick={() => setSelectedSubSubtopic(subsub)}
                  className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 shadow-md
                    ${selectedSubSubtopic === subsub
                      ? 'bg-purple-500 text-white shadow-purple-300/40 scale-105'
                      : 'bg-white/20 text-slate-800 hover:bg-purple-100/50'}
                  `}
                >
                  {subsub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start Practice Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartPractice}
            disabled={!selectedTopic || !selectedSubtopic || !selectedSubSubtopic}
            className={`px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300
              ${selectedTopic && selectedSubtopic && selectedSubSubtopic
                ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-300/30'
                : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            Start Practicing
          </button>
        </div>

        {/* Progress Dashboard */}
        {pastPractices.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-blue-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium mb-1">Average Score</p>
                  <p className="text-4xl font-bold text-slate-800">{stats.avgScore}%</p>
                </div>
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-purple-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium mb-1">Total Practices</p>
                  <p className="text-4xl font-bold text-slate-800">{stats.totalPractices}</p>
                </div>
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-sm border border-green-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-slate-500 font-medium mb-1">Perfect Scores</p>
                  <p className="text-4xl font-bold text-slate-800">{stats.perfectScores}</p>
                </div>
                <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-lg border border-slate-200/50">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Performance History</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#334155' }}
                      cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Past Practices */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Past Practices</h2>

          {pastPractices.length === 0 ? (
            <p className="text-slate-500 italic">No past practices yet. Your recently practiced topics will appear here.</p>
          ) : (
            <div className="space-y-4">
              {pastPractices.map((practice) => (
                <div
                  key={practice.id}
                  onClick={() => navigate(`/questions/${encodeURIComponent(practice.topic)}?practiceId=${practice.id}`)}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-slate-100 cursor-pointer group"
                >
                  <div>
                    <h3 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{practice.topic}</h3>
                    <p className="text-sm text-slate-500">
                      {new Date(practice.created_at).toLocaleDateString()} • {new Date(practice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                ${practice.score >= 80 ? 'bg-green-100 text-green-700' :
                        practice.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'}`}>
                      {practice.score}% Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}