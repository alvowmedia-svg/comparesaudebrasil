import React from 'react';
import { X, ShieldCheck, Clock, CheckCircle2, Building, AlertCircle, FileText } from 'lucide-react';
import { CalculatedPlanQuote } from '../types/healthPlan';
import { getAnsAgeBracketLabel } from '../utils/pricingEngine';

interface PlanDetailsModalProps {
  quote: CalculatedPlanQuote | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestProposal: (quote: CalculatedPlanQuote) => void;
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
  quote,
  isOpen,
  onClose,
  onRequestProposal,
}) => {
  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm uppercase tracking-wider shrink-0"
              style={{ backgroundColor: quote.operatorColor }}
            >
              {quote.operatorLogoText.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 flex-wrap">
                <span>{quote.operatorName}</span>
                <span>·</span>
                <span className="font-mono">ANS: {quote.ansRegister}</span>
                <span>·</span>
                <span className="text-teal-700 font-semibold">IDSS {quote.ansScore.toFixed(2)}</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold font-display text-slate-900 mt-0.5 leading-snug">
                {quote.planName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs text-slate-700">
          {/* Price Overview Banner */}
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wide">
                Estimativa Mensal Total
              </div>
              <div className="text-2xl font-extrabold text-teal-950 font-mono tabular-nums">
                R$ {quote.totalMonthlyPrice.toLocaleString('pt-BR')}
                <span className="text-xs text-teal-700 font-normal"> / mês</span>
              </div>
              <div className="text-[11px] text-teal-800 mt-0.5">
                Para {quote.perBeneficiaryBreakdown.length} vida(s) com acomodação{' '}
                <strong className="capitalize">{quote.accommodation}</strong> e{' '}
                <strong>
                  {quote.copay === 'com_coparticipacao' ? 'com coparticipação' : 'sem coparticipação'}
                </strong>
                .
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onRequestProposal(quote);
              }}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm text-center"
            >
              Pedir Proposta Oficial
            </button>
          </div>

          {/* Section 1: Prazos Oficiais de Carência da ANS */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-teal-600" />
              Prazos Máximos de Carência Regulamentados pela ANS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Urgência e Emergência</span>
                <span className="text-base font-bold text-slate-900 font-mono">24 Horas</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Atendimento em pronto-socorro com risco à vida ou lesões graves.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Consultas e Exames Básicos</span>
                <span className="text-base font-bold text-slate-900 font-mono">30 Dias</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Consultas eletivas e exames laboratoriais laboratoriais de rotina.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Exames e Terapias Especiais</span>
                <span className="text-base font-bold text-slate-900 font-mono">90 a 180 Dias</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ressonância, tomografia, fisioterapia e pequenos procedimentos.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Internações e Cirurgias</span>
                <span className="text-base font-bold text-slate-900 font-mono">180 Dias</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Internações clínicas e cirúrgicas eletivas programadas.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Parto a Termo</span>
                <span className="text-base font-bold text-slate-900 font-mono">300 Dias</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Partos a partir da 37ª semana gestacional (parto prematuro é emergência após 24h).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium text-[11px] block">Doenças Preexistentes (CPT)</span>
                <span className="text-base font-bold text-slate-900 font-mono">24 Meses</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Cobertura Parcial Temporária para eventos de alta complexidade preexistentes.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              *Nota: Em caso de portabilidade de carências vindo de outro plano ativo há mais de 2 anos, todas as carências acima podem ser 100% aproveitadas sem novo cumprimento.
            </p>
          </div>

          {/* Section 2: Detalhamento por Vida do seu Grupo */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Valores Calculados por Beneficiário ({quote.perBeneficiaryBreakdown.length} vidas)
            </h3>

            {/* Mobile Cards (sm:hidden) */}
            <div className="sm:hidden space-y-2.5">
              {quote.perBeneficiaryBreakdown.map((ben) => (
                <div key={ben.beneficiaryId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{ben.beneficiaryName}</span>
                    <span className="font-mono font-bold text-teal-800 text-xs">
                      R$ {ben.calculatedPrice.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="capitalize">{ben.relationship} · {ben.age} anos</span>
                    <span>{getAnsAgeBracketLabel(ben.ageBracket)}</span>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs font-bold text-teal-950">
                <span>Total Estimado:</span>
                <span className="font-mono text-sm text-teal-700">R$ {quote.totalMonthlyPrice.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <tr>
                    <th className="p-3">Beneficiário</th>
                    <th className="p-3">Parentesco</th>
                    <th className="p-3">Idade</th>
                    <th className="p-3">Faixa Etária ANS</th>
                    <th className="p-3 text-right">Valor Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.perBeneficiaryBreakdown.map((ben) => (
                    <tr key={ben.beneficiaryId}>
                      <td className="p-3 font-semibold text-slate-900">{ben.beneficiaryName}</td>
                      <td className="p-3 capitalize text-slate-600">{ben.relationship}</td>
                      <td className="p-3 font-mono">{ben.age} anos</td>
                      <td className="p-3 text-slate-600">{getAnsAgeBracketLabel(ben.ageBracket)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        R$ {ben.calculatedPrice.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-slate-900">Total Mensal Estimado:</td>
                    <td className="p-3 text-right font-mono text-base text-teal-700">
                      R$ {quote.totalMonthlyPrice.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section 3: Rede de Hospitais */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              Hospitais Credenciados neste Plano
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quote.hospitals.map((h, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-800">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Regulado pela Lei Federal nº 9.656/1998 e Resoluções Normativas da ANS.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
