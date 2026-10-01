import React from 'react';
import { X, Check, Minus, ShieldCheck, Download, MessageCircle, ExternalLink } from 'lucide-react';
import { CalculatedPlanQuote } from '../types/healthPlan';

interface SideBySideModalProps {
  selectedPlans: CalculatedPlanQuote[];
  isOpen: boolean;
  onClose: () => void;
  onRemovePlan: (planId: string) => void;
  onRequestProposal: (quote: CalculatedPlanQuote) => void;
}

export const SideBySideModal: React.FC<SideBySideModalProps> = ({
  selectedPlans,
  isOpen,
  onClose,
  onRemovePlan,
  onRequestProposal,
}) => {
  if (!isOpen || selectedPlans.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Comparação Lado a Lado ({selectedPlans.length} planos)
            </h2>
            <p className="text-xs text-slate-500">
              Análise comparativa direta de valores, carências ANS, rede hospitalar e benefícios.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-4 py-2 bg-teal-50 border-b border-teal-100 text-[11px] font-medium text-teal-800 flex items-center justify-center text-center">
          <span>👈 Deslize a tabela para comparar todos os planos 👉</span>
        </div>

        {/* Comparison Table Content with sticky first column on mobile */}
        <div className="overflow-x-auto p-2 sm:p-6 flex-1 -webkit-overflow-scrolling-touch">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 w-36 sm:w-48 font-bold text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 sticky left-0 z-20 bg-slate-100 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Item Comparativo
                </th>
                {selectedPlans.map((plan) => (
                  <th
                    key={plan.planId}
                    className="p-3 font-semibold text-slate-900 border-b border-slate-200 min-w-[200px] sm:min-w-[220px]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-500">{plan.operatorName}</span>
                      <button
                        onClick={() => onRemovePlan(plan.planId)}
                        className="text-[10px] text-rose-500 hover:underline p-1 min-h-[32px] flex items-center"
                      >
                        Remover
                      </button>
                    </div>
                    <div className="text-sm font-bold font-display leading-tight">{plan.planName}</div>
                    <div className="mt-2 text-xl font-extrabold font-mono text-slate-900 tabular-nums">
                      R$ {plan.totalMonthlyPrice.toLocaleString('pt-BR')}
                      <span className="text-xs text-slate-400 font-normal"> /mês</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      R$ {plan.priceRangeMin} ~ R$ {plan.priceRangeMax}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Registro ANS & IDSS */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Índice ANS IDSS
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3 font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      {p.ansScore.toFixed(2)} (ANS {p.ansRegister})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Acomodação */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Acomodação
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3 font-semibold capitalize">
                    {p.accommodation}
                  </td>
                ))}
              </tr>

              {/* Coparticipação */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Coparticipação
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.copay === 'com_coparticipacao' ? (
                      <span className="text-emerald-700 font-semibold">Com Coparticipação (~24% menor)</span>
                    ) : (
                      <span className="text-slate-800 font-semibold">Sem Coparticipação</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Reembolso */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Reembolso Consulta
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3 font-mono font-semibold">
                    {p.reimbursementConsultation > 0
                      ? `R$ ${p.reimbursementConsultation}`
                      : 'Sem reembolso (apenas rede)'}
                  </td>
                ))}
              </tr>

              {/* Abrangência */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Abrangência
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3 capitalize font-medium">
                    {p.coverageArea}
                  </td>
                ))}
              </tr>

              {/* Carência Urgência */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Carência Urgência
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3 font-medium">
                    {p.emergencyWaitHours} horas (ANS Padrão)
                  </td>
                ))}
              </tr>

              {/* Carência Consultas */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Carência Consultas
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.consultationWaitDays} dias
                  </td>
                ))}
              </tr>

              {/* Carência Cirurgias */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Carência Cirurgias
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.surgeryWaitDays} dias (180 dias)
                  </td>
                ))}
              </tr>

              {/* Carência Parto */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Carência Parto
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.maternityWaitDays} dias (300 dias)
                  </td>
                ))}
              </tr>

              {/* Carência Doenças Preexistentes (CPT) */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Carência CPT
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.preExistingWaitMonths} meses (alta complexidade)
                  </td>
                ))}
              </tr>

              {/* Telemedicina 24h */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Telemedicina 24h
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.telemedicine ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Inclusa
                      </span>
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Seguro Viagem */}
              <tr>
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Seguro Viagem
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    {p.travelInsurance ? (
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Incluso
                      </span>
                    ) : (
                      <span className="text-slate-400">Opcional</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Principais Hospitais */}
              <tr className="bg-slate-50/40">
                <td className="p-3 font-medium text-slate-600 sticky left-0 z-10 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Hospitais Destaque
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {p.hospitals.slice(0, 4).map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="p-3 font-bold text-slate-600 sticky left-0 z-10 bg-slate-100 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                  Ação
                </td>
                {selectedPlans.map((p) => (
                  <td key={p.planId} className="p-3">
                    <button
                      onClick={() => {
                        onClose();
                        onRequestProposal(p);
                      }}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors whitespace-nowrap min-h-[44px] shadow-xs active:scale-[0.98]"
                    >
                      Solicitar Cotação
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>*Valores estimados segundo a média de mercado e normativas ANS RN 563.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200/60 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
