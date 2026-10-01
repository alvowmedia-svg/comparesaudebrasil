import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="space-y-2">
            <div className="text-white font-bold font-display text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                <Activity className="w-4 h-4 text-white" />
              </span>
              <span>ComparaSaúde Brasil</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              Plataforma de inteligência comparativa e cotação de planos de saúde no Brasil.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 text-xs text-slate-300">
            <a href="#simulador" className="hover:text-white transition-colors">
              Simulador de Cotação
            </a>
            <a href="#comparador" className="hover:text-white transition-colors">
              Tabela Comparativa
            </a>
            <a href="#hospitais" className="hover:text-white transition-colors">
              Rede Hospitalar
            </a>
            <a href="#regras-ans" className="hover:text-white transition-colors">
              Regras & Carências ANS
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Perguntas Frequentes
            </a>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] leading-relaxed text-slate-500 space-y-2">
          <p>
            <strong>Aviso Regulatório e Legal:</strong> O ComparaSaúde Brasil é um simulador analítico independente de mercado. Todas as estimativas de preço apresentadas são calculadas a partir de parâmetros estatísticos, tabelas referenciais de mercado e as 10 faixas etárias estipuladas pela Agência Nacional de Saúde Suplementar (ANS) segundo a Resolução Normativa RN nº 563 e Lei Federal nº 9.656/1998. Os valores reais finais podem variar conforme aprovação cadastral, validação de elegibilidade (CPF/CNPJ), vigência de tabela e declaração de saúde.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>ANS - Agência Nacional de Saúde Suplementar</span>
            <span aria-hidden="true">·</span>
            <span>Índice IDSS Atualizado</span>
            <span aria-hidden="true">·</span>
            <span>Diretrizes de Utilização (DUT)</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} ComparaSaúde Brasil. Todos os direitos reservados.
          </div>
          <div>
            Desenvolvido com foco em alta performance e conformidade atuarial.
          </div>
        </div>
      </div>
    </footer>
  );
};
