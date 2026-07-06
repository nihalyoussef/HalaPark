import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, LayoutDashboard, Presentation,
  Calendar, Menu, X, FileText, Receipt
} from 'lucide-react';
import SlideRenderer from './components/SlideRenderer';
import ContentCalendar from './components/ContentCalendar';
import ProposalDocument from './components/ProposalDocument';
import Quotation from './components/Quotation';
import Logo from './components/Logo';
import { slides, sections } from './data/slides';

type View = 'deck' | 'calendar' | 'proposal' | 'quotation';

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'proposal', label: 'Full Proposal', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'deck', label: 'Presentation', icon: <Presentation className="w-3.5 h-3.5" /> },
  { id: 'calendar', label: 'Content Calendar', icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'quotation', label: 'Quotation', icon: <Receipt className="w-3.5 h-3.5" /> },
];

export default function App() {
  const [view, setView] = useState<View>('proposal');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const goToSlide = useCallback((idx: number) => {
    if (idx >= 0 && idx < slides.length) {
      setCurrentSlide(idx);
      setMobileMenuOpen(false);
    }
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide(Math.min(currentSlide + 1, slides.length - 1));
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(Math.max(currentSlide - 1, 0));
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    if (view !== 'deck') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, nextSlide, prevSlide]);

  const currentSection = sections.find(s => s.slides.includes(slides[currentSlide].id));

  return (
    <div className="min-h-screen bg-navy text-white font-sans">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="flex items-center justify-between px-4 md:px-6 h-14 gap-2">
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-navy-lighter text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo variant="icon" />
            <span className="font-bold text-sm text-white hidden sm:inline">HalaPark</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium whitespace-nowrap transition-all ${
                  view === item.id
                    ? 'bg-electric text-white'
                    : 'text-gray-400 hover:text-white hover:bg-navy-lighter'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {view === 'deck' ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-navy-lighter transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Slides</span>
              </button>
              <span className="text-xs text-gray-500 tabular-nums">
                {currentSlide + 1} / {slides.length}
              </span>
            </div>
          ) : (
            <div className="w-8 md:w-20 flex-shrink-0" />
          )}
        </div>
      </nav>

      {/* Mobile slide navigation menu */}
      {mobileMenuOpen && view === 'deck' && (
        <div className="fixed inset-0 z-40 bg-navy/95 backdrop-blur-xl pt-14 overflow-y-auto md:hidden">
          <div className="p-4 space-y-4">
            {sections.map((section) => (
              <div key={section.name}>
                <h3 className="text-xs font-semibold text-electric uppercase tracking-wider mb-2">
                  {section.name}
                </h3>
                <div className="space-y-1">
                  {section.slides.map(slideId => {
                    const idx = slides.findIndex(s => s.id === slideId);
                    const slide = slides[idx];
                    return (
                      <button
                        key={slideId}
                        onClick={() => goToSlide(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          currentSlide === idx
                            ? 'bg-electric/20 text-electric border border-electric/30'
                            : 'text-gray-400 hover:text-white hover:bg-navy-lighter'
                        }`}
                      >
                        <span className="text-xs text-gray-500 mr-2">{slideId}.</span>
                        {slide.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deck View */}
      {view === 'deck' && (
        <div className="pt-14 h-screen flex">
          {/* Sidebar (desktop) */}
          <div className={`hidden md:block transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex-shrink-0`}>
            <div className="w-64 h-full bg-surface border-r border-gray-800/50 overflow-y-auto py-4 px-3">
              {sections.map((section) => (
                <div key={section.name} className="mb-4">
                  <h3 className="text-[10px] font-semibold text-electric uppercase tracking-wider mb-1.5 px-2">
                    {section.name}
                  </h3>
                  <div className="space-y-0.5">
                    {section.slides.map(slideId => {
                      const idx = slides.findIndex(s => s.id === slideId);
                      const slide = slides[idx];
                      return (
                        <button
                          key={slideId}
                          onClick={() => goToSlide(idx)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                            currentSlide === idx
                              ? 'bg-electric/20 text-electric'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-navy-lighter'
                          }`}
                        >
                          <span className="text-gray-600 mr-1.5">{slideId}.</span>
                          {slide.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Section indicator */}
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-[10px] text-electric font-semibold uppercase tracking-wider">
                {currentSection?.name}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-[10px] text-gray-500">
                {slides[currentSlide].title}
              </span>
            </div>

            {/* Slide */}
            <div className="flex-1 relative mx-4 mb-4 rounded-2xl overflow-hidden border border-gray-800/50 bg-navy">
              <div key={currentSlide} className="absolute inset-0">
                <SlideRenderer slideId={slides[currentSlide].id} />
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-navy/80 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-electric/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-navy/80 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:border-electric/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-4">
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? 'bg-electric'
                        : i < currentSlide
                          ? 'bg-electric/30'
                          : 'bg-gray-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Proposal Document View */}
      {view === 'proposal' && (
        <div className="pt-14">
          <div className="px-4 md:px-8 py-8">
            <ProposalDocument />
          </div>
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="pt-14">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                3-Month Content Calendar
              </h1>
              <p className="text-gray-400">
                Ready-to-execute post plan · 3 posts/week · 12 posts/month · LinkedIn + Instagram + TikTok/Reels
              </p>
            </div>
            <ContentCalendar />
          </div>
        </div>
      )}

      {/* Quotation View */}
      {view === 'quotation' && (
        <div className="pt-14">
          <div className="px-4 md:px-8 py-12">
            <Quotation />
          </div>
        </div>
      )}
    </div>
  );
}
