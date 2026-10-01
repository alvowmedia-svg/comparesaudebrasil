import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Como funciona a lógica de cálculo das 10 faixas etárias da ANS?',
      category: 'Regulamentação ANS',
      answer:
        'A Agência Nacional de Saúde Suplementar (ANS) divide os beneficiários em exatamente 10 faixas etárias obrigatórias (0 a 18 anos até 59 anos ou mais). Pela Resolução Normativa RN 563, a variação de preço acumulada entre a 7ª e a 10ª faixa não pode superar a variação entre a 1ª e a 7ª faixa, e o valor da última faixa (59+) não pode ultrapassar 6 vezes o valor da primeira (0 a 18 anos). Nosso algoritmo replica com exatidão essa curva atuarial.',
    },
    {
      question: 'Por que planos empresariais (MEI/PME) chegam a ser até 35% mais baratos?',
      category: 'Economia & Contratação',
      answer:
        'Operadoras consideram o risco atuarial diluído em grupos corporativos e o custo de inadimplência menor em contratos vinculados a pessoa jurídica (CNPJ). Com um MEI aberto há pelo menos 6 meses, já é possível contratar a partir de 1 vida (titular) ou 2 vidas (titular + dependente), garantindo a mesma rede credenciada de hospitais e médicos por uma mensalidade significativamente inferior.',
    },
    {
      question: 'O que é a Coparticipação e quando ela é recomendada?',
      category: 'Modalidade',
      answer:
        'Na coparticipação, você tem uma redução imediata de 20% a 26% na mensalidade fixa todo mês. Em troca, quando realiza uma consulta médica simples ou exame básico, paga uma pequena taxa (geralmente entre R$ 25 e R$ 40 por consulta). Para pessoas e famílias com frequência moderada de utilização, a economia anual acumulada na mensalidade costuma superar com folga o que é gasto em coparticipações.',
    },
    {
      question: 'Quais são os prazos máximos de carência da ANS?',
      category: 'Carências',
      answer:
        'Pela Lei 9.656/98, os limites legais inultrapassáveis são: 24 horas para urgência e emergência com risco de vida; 30 dias para consultas médicas e exames laboratoriais básicos; 180 dias para exames especiais, terapias, cirurgias e internações clínicas; 300 dias para parto a termo (a partir de 37 semanas); e 24 meses de Cobertura Parcial Temporária (CPT) para doenças preexistentes declaradas na adesão.',
    },
    {
      question: 'Como funciona a Portabilidade de Carências da ANS?',
      category: 'Carências & Troca',
      answer:
        'Se você já possui um plano de saúde há pelo menos 2 anos (ou 3 anos caso tenha cumprido CPT) e está em dia com as mensalidades, a ANS garante o direito à portabilidade especial para outro plano de faixa de preço compatível sem necessidade de cumprir qualquer carência novamente.',
    },
    {
      question: 'O plano de saúde é dedutível no Imposto de Renda (IRPF)?',
      category: 'Tributação & Benefício Fiscal',
      answer:
        'Sim! Despesas com planos de saúde para você e seus dependentes legais são 100% dedutíveis no Imposto de Renda da Pessoa Física (modelo completo), sem qualquer limite de teto anual. Quem está na alíquota de 27,5% recupera mais de um quarto de todo o investimento anual em saúde na restituição ou abatimento do imposto devido.',
    },
  ];

  return (
    <section id="faq" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Tire Suas Dúvidas
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Regras da ANS, Carências e Condições de Mercado
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Entenda como funciona a precificação, as garantias legais da Lei 9.656/98 e como economizar com segurança.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left bg-white hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">
                      {faq.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{faq.question}</h3>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
