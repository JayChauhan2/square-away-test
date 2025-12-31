//home page

import '../index.css';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function SquareAwayLanding() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('[id^="section-"]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const parallaxY = scrollY * 0.5;
  const opacity = Math.max(0, 1 - scrollY / 600);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '5%',
            transform: `translate(${Math.sin(scrollY * 0.001) * 50}px, ${Math.cos(scrollY * 0.002) * 30}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-teal-300/20 rounded-full blur-3xl"
          style={{
            bottom: '20%',
            right: '10%',
            transform: `translate(${Math.cos(scrollY * 0.0015) * 40}px, ${Math.sin(scrollY * 0.001) * 50}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-72 h-72 bg-gradient-to-br from-violet-300/25 to-pink-300/25 rounded-full blur-3xl"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(${Math.sin(scrollY * 0.002) * 60}px, ${Math.cos(scrollY * 0.0015) * 40}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div
          className="max-w-5xl mx-auto text-center"
          style={{
            transform: `translateY(${parallaxY}px)`,
            opacity: opacity
          }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-8 border border-blue-200/40">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI-Powered Learning Experience</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-slate-900 mb-6 leading-tight">
            Math Learning
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent font-normal">
              Flows Naturally
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Square Away adapts to your rhythm, guides your growth, and transforms mathematical concepts into fluid understanding
          </p>

          <button onClick={() => navigate('/signup')} className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-105">
            Begin Your Journey
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Personalized AI Guidance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Adaptive Learning Paths</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
        >
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* How It Works - Flowing Sections */}
      <section id="section-how" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
              Learning That <span className="text-blue-600">Adapts</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Watch your understanding deepen as our AI agent guides you through personalized mathematical journeys
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Intelligent Understanding',
                desc: 'Our AI analyzes your thought patterns and adapts explanations to match your unique learning style',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: TrendingUp,
                title: 'Organic Growth',
                desc: 'Progress naturally through concepts, building confidence with each milestone in your mathematical journey',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Users,
                title: 'Collaborative Spirit',
                desc: 'Connect with peers, share insights, and grow together in a supportive learning community',
                color: 'from-teal-500 to-green-500'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                id={`section-feature-${idx}`}
                className={`bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 ${isVisible[`section-feature-${idx}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                style={{
                  transitionDelay: `${idx * 150}ms`
                }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-normal text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="section-demo" className="relative py-32 px-6 bg-gradient-to-b from-transparent to-blue-50/50">
        <div className="max-w-5xl mx-auto">
          <div
            className={`transition-all duration-1000 ${isVisible['section-demo'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
                Experience <span className="text-purple-600">Fluid Learning</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
                See how concepts flow together, building a complete understanding
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 shadow-2xl shadow-purple-500/10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="space-y-6">
                    {['Visualize complex equations', 'Step-by-step guidance', 'Instant feedback loops', 'Personalized hints'].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-500"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg text-slate-700 font-light">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse" />
                    <div className="relative z-10 text-center p-8">
                      <div className="text-6xl font-light text-slate-800 mb-4">∑ ∫ √</div>
                      <p className="text-slate-600 font-light">Interactive problem-solving environment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Flowing */}
      <section id="section-testimonials" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
              Stories of <span className="text-cyan-600">Transformation</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'High School Junior',
                text: 'Square Away transformed my relationship with calculus. The way concepts flow together finally makes sense.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                name: 'Marcus Johnson',
                role: 'College Freshman',
                text: 'The AI feels like a patient tutor who understands exactly where I need help. My confidence has soared.',
                gradient: 'from-purple-500 to-pink-500'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className={`bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 transition-all duration-1000 ${isVisible['section-testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${testimonial.gradient} mb-6`} />
                <p className="text-lg text-slate-700 mb-6 font-light leading-relaxed italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500 font-light">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - The Clearing */}
      <section id="section-cta" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible['section-cta'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-6 leading-tight">
              Ready to Get Serious
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                About Math?
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of students who've discovered the joy of mathematical mastery through organic, AI-guided learning
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105 w-full sm:w-auto">
                Start Free Trial
              </button>
              <button className="px-10 py-5 bg-white/80 backdrop-blur-sm text-slate-900 rounded-full text-lg font-medium border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-500 w-full sm:w-auto">
                Watch Demo
              </button>
            </div>

            <p className="text-sm text-slate-500 font-light">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200/50 bg-white/50 backdrop-blur-sm py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-light text-slate-900">Square Away</span>
            </div>

            <div className="flex gap-8 text-sm text-slate-600 font-light">
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">About</a>
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Features</a>
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Pricing</a>
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Contact</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/50 text-center text-sm text-slate-500 font-light">
            © 2025 Square Away. Made with ❤️ by Jay Chauhan.
          </div>
        </div>
      </footer>
    </div>
  );
}