import React from 'react';
import { ArrowRight, CheckCircle2, Building2, FileCheck2 } from 'lucide-react';
import heroImage from '../assets/images/hero_healthcare_center_1790805973598.jpg';

interface HeroSectionProps {
  onStartSimulation: () => void;
  onExploreHospitals: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartSimulation,
  onExploreHospitals,
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-24">
      {/* Background radial gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.3),rgba(255,255,255,0))]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Proposition and Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="truncate">Estimativas Atualizadas · Tabelas de Mercado 2026 ANS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight font-display text-white leading-tight text-balance max-w-2xl">
              Compare planos de saúde com estimativas reais para o seu perfil.
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-xl leading-relaxed text-pretty">
              Algoritmo de cálculo com as 10 faixas etárias oficiais da ANS, desconto empresarial para MEI/PME,
              comparação de rede flexível e simulação transparente vida a vida.
            </p>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 pt-1 sm:pt-2">
              <button
                onClick={onStartSimulation}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-teal-900/30 min-h-[48px] active:scale-[0.99]"
              >
                <span>Simular Cotação Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreHospitals}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-xl transition-colors whitespace-nowrap border border-slate-700 min-h-[48px] active:scale-[0.99]"
              >
                <span>Ver Hospitais Credenciados</span>
              </button>
            </div>

            {/* Trust points - responsive stack on mobile */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>10 Faixas ANS</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>MEI / PME OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>100% Dedutível IRPF</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-800">
              <img
                src={heroImage}
                alt="Equipe médica e estrutura hospitalar de excelência"
                referrerPolicy="no-referrer"
                className="w-full h-44 xs:h-52 sm:h-80 lg:h-96 object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 p-2.5 sm:p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200">
                <div className="flex items-center justify-between font-semibold text-white mb-0.5 sm:mb-1">
                  <span className="text-[11px] sm:text-xs">Operadoras Monitoradas</span>
                  <span className="text-teal-400 font-mono text-[10px] sm:text-[11px]">IDSS Médio 0.93</span>
                </div>
                <p className="text-slate-400 text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Bradesco Saúde, Amil, SulAmérica, GNDI Notredame, Unimed, Porto Seguro, Alice e Hapvida.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
