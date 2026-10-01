import React, { useState } from 'react';
import { Activity, Sparkles, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onStartQuote: () => void;
  onOpenAdvisor: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onStartQuote, onOpenAdvisor, activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text wordmark */}
        <a
          href="#"
          className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 font-display flex items-center gap-1.5 sm:gap-2 shrink-0 truncate max-w-[170px] sm:max-w-none"
        >
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <Activity className="w-4 h-4 text-white" />
          </span>
          <span className="truncate">ComparaSaúde <span className="hidden sm:inline text-teal-700">Brasil</span></span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
          <a
            href="#simulador"
            className={`hover:text-teal-600 transition-colors ${
              activeSection === 'simulador' ? 'text-teal-600 font-semibold' : ''
            }`}
          >
            Simulador
          </a>
          <a
            href="#comparador"
            className={`hover:text-teal-600 transition-colors ${
              activeSection === 'comparador' ? 'text-teal-600 font-semibold' : ''
            }`}
          >
            Tabela Comparativa
          </a>
          <a
            href="#hospitais"
            className={`hover:text-teal-600 transition-colors ${
              activeSection === 'hospitais' ? 'text-teal-600 font-semibold' : ''
            }`}
          >
            Hospitais
          </a>
          <a
            href="#regras-ans"
            className={`hover:text-teal-600 transition-colors ${
              activeSection === 'regras-ans' ? 'text-teal-600 font-semibold' : ''
            }`}
          >
            Regras ANS
          </a>
          <a
            href="#faq"
            className={`hover:text-teal-600 transition-colors ${
              activeSection === 'faq' ? 'text-teal-600 font-semibold' : ''
            }`}
          >
            Dúvidas
          </a>
        </nav>

        {/* Zone 3: Actions + Mobile Menu button */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenAdvisor}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors whitespace-nowrap border border-teal-200 min-h-[38px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden xs:inline sm:inline">Consultor IA</span>
            <span className="xs:hidden">IA</span>
          </button>

          <button
            onClick={onStartQuote}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs min-h-[38px] flex items-center justify-center"
          >
            Cotar Agora
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1 text-sm font-medium text-slate-700">
            <button
              onClick={() => handleNavClick('simulador')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              Simulador de Cotação
            </button>
            <button
              onClick={() => handleNavClick('comparador')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              Tabela Comparativa de Planos
            </button>
            <button
              onClick={() => handleNavClick('hospitais')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              Rede Hospitalar em Destaque
            </button>
            <button
              onClick={() => handleNavClick('regras-ans')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              Regras e Carências da ANS
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors min-h-[44px] flex items-center"
            >
              Dúvidas Frequentes
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdvisor();
              }}
              className="w-full py-3 px-3 bg-teal-50 text-teal-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-teal-200 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Abrir Consultor de Inteligência ANS</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
