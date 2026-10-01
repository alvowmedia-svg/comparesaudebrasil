import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Printer, FileText, Send, Building } from 'lucide-react';
import { CalculatedPlanQuote, QuoteInput } from '../types/healthPlan';
import { getAnsAgeBracketLabel } from '../utils/pricingEngine';

interface ExportSummaryModalProps {
  quote: CalculatedPlanQuote | null;
  input: QuoteInput;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  quote,
  input,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !quote) return null;

  const generateTextSummary = () => {
    return `*COTAÇÃO ESTIMADA DE PLANO DE SAÚDE - COMPARA SAÚDE BRASIL*
------------------------------------------------
*Plano:* ${quote.planName} (${quote.operatorName})
*Registro ANS:* ${quote.ansRegister} · *Índice IDSS:* ${quote.ansScore.toFixed(2)}
*Modalidade:* ${input.contractType.toUpperCase()} | *Acomodação:* ${quote.accommodation.toUpperCase()}
*Coparticipação:* ${quote.copay === 'com_coparticipacao' ? 'SIM' : 'NÃO'}
*Abrangência:* ${quote.coverageArea.toUpperCase()} | *UF:* ${input.state}

*ESTIMATIVA TOTAL MENSAL:* R$ ${quote.totalMonthlyPrice.toLocaleString('pt-BR')} / mês
(Intervalo de mercado: R$ ${quote.priceRangeMin} a R$ ${quote.priceRangeMax})

*Detalhamento por Vida (${quote.perBeneficiaryBreakdown.length} vidas):*
${quote.perBeneficiaryBreakdown
  .map(
    (b) =>
      `- ${b.beneficiaryName}: ${b.age} anos (${getAnsAgeBracketLabel(b.ageBracket)}) -> R$ ${b.calculatedPrice.toLocaleString('pt-BR')}`
  )
  .join('\n')}

*Carências ANS Básicas:*
- Urgência/Emergência: 24h
- Consultas e Exames: 30 dias
- Cirurgias e Internações: 180 dias
- Parto: 300 dias

*Principais Hospitais:*
${quote.hospitals.slice(0, 5).map((h) => `• ${h}`).join('\n')}
------------------------------------------------
_Gerado via ComparaSaúde Brasil em ${new Date().toLocaleDateString('pt-BR')}_`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(generateTextSummary());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Resumo & Envio de Proposta
            </h2>
            <p className="text-xs text-slate-500">
              {quote.planName} · R$ {quote.totalMonthlyPrice.toLocaleString('pt-BR')} / mês
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs text-slate-700">
          {/* Quick Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              onClick={handleWhatsApp}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar via WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado com Sucesso!' : 'Copiar Texto Cotação'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>

          {/* Form for Official Broker Proposal */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Receber Proposta Oficial de Corretora Credenciada
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Validação de tabela regional vigente, carências e documentação sem nenhum compromisso.
              </p>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Solicitação de cotação enviada!
                </div>
                <p className="text-xs">
                  O resumo da sua cotação estimada para {quote.planName} foi registrado. Em instantes um especialista entrará em contato para confirmar descontos vigentes de {input.state}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block uppercase mb-1">
                      Seu Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block uppercase mb-1">
                      Telefone Celular / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block uppercase mb-1">
                    E-mail para Envio da Tabela Completa
                  </label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="carlos@exemplo.com.br"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-xs min-h-[46px] active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirmar e Receber Proposta Detalhada</span>
                </button>
              </form>
            )}
          </div>

          {/* Text preview */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
              Prévia do Relatório de Cotação
            </label>
            <pre className="p-3 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto max-h-40 border border-slate-200">
              {generateTextSummary()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
