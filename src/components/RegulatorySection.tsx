import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle2, DollarSign, Calculator, ArrowRight } from 'lucide-react';
import familyImage from '../assets/images/family_health_consult_1790805998071.jpg';
import { calculateEstimatedTaxSavings } from '../utils/pricingEngine';

export const RegulatorySection: React.FC = () => {
  const [annualSpend, setAnnualSpend] = useState<number>(12000);
  const estimatedTaxReturn = calculateEstimatedTaxSavings(annualSpend, 27.5);

  return (
    <section id="regras-ans" className="py-16 bg-white border-t border-slate-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
            Diretrizes Oficiais de Saúde Suplementar
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight mt-1">
            Transparência atuarial: entenda como a ANS regula seu plano.
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No Brasil, a Lei Federal nº 9.656/1998 e as resoluções da Agência Nacional de Saúde Suplementar (ANS)
            garantem padrões inegociáveis de atendimento, carências e reajustes.
          </p>
        </div>

        {/* 3 Pillars Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Card 1: Carências Timeline */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 mb-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Prazos Legais de Carência</span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900">
                Prazos máximos permitidos por lei após a contratação
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nenhuma operadora pode cobrar carência superior a estes prazos. Em caso de urgência, a cobertura é imediata após 24h.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">Urgência & Emergência</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">24 Horas</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">Consultas Médicas & Exames Simples</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">30 Dias</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">Cirurgias, Internações & Exames Especiais</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">180 Dias</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">Parto a Termo</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">300 Dias</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <span className="font-semibold text-slate-800">Doenças e Lesões Preexistentes (CPT)</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">24 Meses</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Visual Asset & Family Health */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 text-white min-h-[340px] flex flex-col justify-end p-6">
            <img
              src={familyImage}
              alt="Atendimento pediátrico e familiar em clínica de saúde"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            <div className="relative space-y-2">
              <span className="text-xs font-semibold text-teal-300 uppercase">
                Portabilidade sem Carência
              </span>
              <h3 className="text-lg font-bold font-display text-white">
                Já tem plano há mais de 2 anos?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você pode migrar para outra operadora com mensalidade menor mantendo a isenção de carências conquistada no plano anterior.
              </p>
            </div>
          </div>
        </div>

        {/* IRPF Tax Deductibility Interactive Simulator */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-300">
                <Calculator className="w-4 h-4 text-teal-400" />
                <span>Simulador de Benefício Fiscal IRPF</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white text-balance">
                100% dos gastos com plano de saúde são dedutíveis no Imposto de Renda.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-pretty">
                Ao contrário de educação (que tem teto máximo), a Receita Federal permite deduzir integralmente todas as despesas médicas e mensalidades do plano para você e dependentes legais na declaração completa.
              </p>

              {/* Slider */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-1">
                  <span>Gasto Anual Estimado com Plano de Saúde:</span>
                  <span className="font-mono font-bold text-white text-base">
                    R$ {annualSpend.toLocaleString('pt-BR')} / ano
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="40000"
                  step="1000"
                  value={annualSpend}
                  onChange={(e) => setAnnualSpend(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-3 min-h-[40px]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono flex-wrap gap-1">
                  <span>R$ 3.000 (R$ 250/m)</span>
                  <span className="hidden sm:inline">R$ 20.000 (R$ 1.660/m)</span>
                  <span>R$ 40.000 (R$ 3.330/m)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="lg:col-span-5 p-6 bg-slate-800/90 rounded-xl border border-slate-700 space-y-3">
              <div className="text-xs text-slate-400 uppercase font-semibold">
                Estimativa de Retorno no IRPF (Faixa 27,5%)
              </div>
              <div className="text-3xl font-extrabold text-teal-400 font-mono tabular-nums">
                R$ {estimatedTaxReturn.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Valor estimado que você pode receber de volta na restituição ou economizar no imposto a pagar.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-700/80">
                Custo real efetivo anual do plano:{' '}
                <strong className="text-white font-mono">
                  R$ {(annualSpend - estimatedTaxReturn).toLocaleString('pt-BR')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
