import React from 'react';
import { Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  onStartQuote: () => void;
  onOpenAdvisor: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onStartQuote, onOpenAdvisor, activeSection }) => {
  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-0 md:h-16 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        {/* Zone 1: Single text wordmark with brand icon - centered on mobile, left on desktop */}
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
          <a
            href="#"
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2.5 shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Activity className="w-4 h-4 text-white" />
            </span>
            <span className="whitespace-nowrap">
              ComparaSaúde <span className="text-teal-700">Brasil</span>
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links - scrollable on mobile, centered on desktop */}
        <nav
          aria-label="Navegação principal"
          className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 md:gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-slate-600 overflow-x-auto no-scrollbar w-full md:w-auto max-w-full px-1 py-1"
        >
          <button
            onClick={() => handleNavClick('simulador')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeSection === 'simulador'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            Simulador
          </button>
          <button
            onClick={() => handleNavClick('comparador')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeSection === 'comparador'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            Tabela Comparativa
          </button>
          <button
            onClick={() => handleNavClick('hospitais')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeSection === 'hospitais'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            Hospitais
          </button>
          <button
            onClick={() => handleNavClick('regras-ans')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeSection === 'regras-ans'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            Regras ANS
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeSection === 'faq'
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            Dúvidas
          </button>
        </nav>

        {/* Zone 3: Actions - centered on mobile */}
        <div className="flex items-center justify-center gap-2 w-full max-w-md mx-auto md:w-auto md:mx-0">
          <button
            onClick={onOpenAdvisor}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors whitespace-nowrap border border-teal-200 min-h-[42px] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Consultor IA</span>
          </button>

          <button
            onClick={onStartQuote}
            className="flex-1 md:flex-initial inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shadow-xs min-h-[42px] active:scale-[0.98]"
          >
            <span>Cotar Agora</span>
          </button>
        </div>
      </div>
    </header>
  );
};
