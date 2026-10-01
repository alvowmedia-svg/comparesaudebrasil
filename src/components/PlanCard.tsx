import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Building,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CalculatedPlanQuote } from '../types/healthPlan';
import { getAnsAgeBracketLabel } from '../utils/pricingEngine';

interface PlanCardProps {
  quote: CalculatedPlanQuote;
  isSelectedForComparison: boolean;
  onToggleCompare: (planId: string) => void;
  onViewDetails: (quote: CalculatedPlanQuote) => void;
  onRequestProposal: (quote: CalculatedPlanQuote) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  quote,
  isSelectedForComparison,
  onToggleCompare,
  onViewDetails,
  onRequestProposal,
}) => {
  const [showLifeBreakdown, setShowLifeBreakdown] = useState(false);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden flex flex-col justify-between ${
        isSelectedForComparison
          ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div>
        {/* Top bar with operator info and comparison checkbox */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs tracking-wider uppercase shadow-xs shrink-0"
              style={{ backgroundColor: quote.operatorColor }}
            >
              {quote.operatorLogoText.slice(0, 3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 font-medium truncate">{quote.operatorName}</span>
                <span className="text-[10px] text-slate-400 font-mono">ANS {quote.ansRegister}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display leading-snug truncate">
                {quote.planName}
              </h3>
            </div>
          </div>

          {/* Comparison checkbox button */}
          <button
            onClick={() => onToggleCompare(quote.planId)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] active:scale-[0.97] ${
              isSelectedForComparison
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{isSelectedForComparison ? '✓ Comparando' : '+ Comparar'}</span>
          </button>
        </div>

        {/* Pricing Zone */}
        <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100">
          <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Estimativa Total Mensal
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
              R$ {quote.totalMonthlyPrice.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 font-normal">/ mês</span>
          </div>

          <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center justify-between gap-1.5">
            <span className="font-mono text-slate-400 text-[10px] sm:text-[11px]">
              Faixa: R$ {quote.priceRangeMin.toLocaleString('pt-BR')} ~ R${' '}
              {quote.priceRangeMax.toLocaleString('pt-BR')}
            </span>
            {quote.savingsVsIndividual && (
              <span className="text-emerald-700 font-semibold text-[10px] sm:text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                -R$ {quote.savingsVsIndividual.toLocaleString('pt-BR')} vs PF
              </span>
            )}
          </div>

          {/* Toggle breakdown life by life */}
          <button
            onClick={() => setShowLifeBreakdown(!showLifeBreakdown)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors min-h-[36px]"
          >
            <span>Detalhamento por vida ({quote.perBeneficiaryBreakdown.length} vidas)</span>
            {showLifeBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expandable life-by-life table */}
          {showLifeBreakdown && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2 text-xs">
              {quote.perBeneficiaryBreakdown.map((item) => (
                <div key={item.beneficiaryId} className="flex items-center justify-between text-slate-600 py-1 gap-2">
                  <div className="truncate pr-1">
                    <span className="font-medium text-slate-900">{item.beneficiaryName}</span>{' '}
                    <span className="text-slate-400 text-[11px]">({item.age}a · {getAnsAgeBracketLabel(item.ageBracket)})</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 shrink-0 text-xs">
                    R$ {item.calculatedPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature badges and hospitals */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* ANS IDSS score & Accommodation */}
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Índice ANS IDSS</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{quote.ansScore.toFixed(2)} / 1.00</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Acomodação</span>
              <span className="font-bold text-slate-800 capitalize truncate block">
                {quote.accommodation}
              </span>
            </div>
          </div>

          {/* Key highlights */}
          <div>
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-2">
              Diferenciais do Plano
            </span>
            <ul className="space-y-1.5 text-slate-600">
              {quote.keyHighlights.slice(0, 3).map((hl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{hl}</span>
                </li>
              ))}
              {quote.reimbursementConsultation > 0 ? (
                <li className="flex items-start gap-2 font-medium text-slate-800">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>Reembolso médico: R$ {quote.reimbursementConsultation} / consulta</span>
                </li>
              ) : (
                <li className="flex items-start gap-2 text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Atendimento sem reembolso (Rede credenciada direta)</span>
                </li>
              )}
            </ul>
          </div>

          {/* Reference Hospitals preview */}
          {quote.hospitals.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                Rede Hospitalar em Destaque
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quote.hospitals.slice(0, 3).map((h, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80 truncate max-w-[200px]"
                  >
                    {h}
                  </span>
                ))}
                {quote.hospitals.length > 3 && (
                  <span className="text-[10px] text-slate-400 self-center">
                    +{quote.hospitals.length - 3} hospitais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions - centered and balanced on mobile */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
        <button
          onClick={() => onViewDetails(quote)}
          className="w-full sm:flex-1 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors min-h-[44px] flex items-center justify-center border border-slate-200/70 active:scale-[0.98]"
        >
          Carências & Regras
        </button>

        <button
          onClick={() => onRequestProposal(quote)}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shadow-xs min-h-[44px] active:scale-[0.98]"
        >
          <span>Receber Proposta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
