import React, { useState } from 'react';
import { Search, Building, MapPin, Check, ShieldCheck, ChevronRight } from 'lucide-react';
import { REFERENCE_HOSPITALS } from '../data/healthPlans';
import hospitalImage from '../assets/images/medical_hospital_facility_1790805985967.jpg';

interface HospitalNetworkExplorerProps {
  onSelectHospitalFilter: (hospitalName: string) => void;
  selectedHospitals: string[];
  activeState?: string;
  activeCity?: string;
}

export const HospitalNetworkExplorer: React.FC<HospitalNetworkExplorerProps> = ({
  onSelectHospitalFilter,
  selectedHospitals,
  activeState,
  activeCity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'excelencia' | 'referencia'>('all');

  const filteredHospitals = REFERENCE_HOSPITALS.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = tierFilter === 'all' || h.tier === tierFilter;
    return matchesSearch && matchesTier;
  }).sort((a, b) => {
    if (activeState) {
      const aInState = a.state === activeState ? 1 : 0;
      const bInState = b.state === activeState ? 1 : 0;
      if (bInState !== aInState) return bInState - aInState;
    }
    return 0;
  });

  return (
    <section id="hospitais" className="py-16 bg-slate-50 border-t border-slate-200 w-full max-w-full box-border min-w-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 w-full max-w-full min-w-0 box-border">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Mapeamento de Rede Credenciada
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Encontre o plano pelo seu hospital de preferência.
            </h2>
            <p className="text-sm text-slate-600">
              Verifique quais planos atendem nos maiores centros médicos de referência do Brasil,
              desde pronto-atendimento 24h até internações e cirurgias de alta complexidade.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 sm:top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar hospital ou cidade..."
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs min-h-[44px]"
              />
            </div>
            <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl text-xs font-medium self-start sm:self-auto min-h-[44px]">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                  tierFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTierFilter('excelencia')}
                className={`px-3 py-1.5 rounded-lg transition-colors min-h-[36px] ${
                  tierFilter === 'excelencia' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Excelência
              </button>
            </div>
          </div>
        </div>

        {/* Featured Hospital Showcase Banner */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-12 shadow-sm">
          <div className="lg:col-span-5 relative h-56 lg:h-auto">
            <img
              src={hospitalImage}
              alt="Fachada moderna de centro hospitalar de excelência"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
                Padrão Triple A & Hospitais Top do Brasil
              </span>
              <h3 className="text-xl font-bold font-display text-slate-900">
                Acesso aos melhores centros hospitalares da América Latina
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hospitais como <strong>Israelita Albert Einstein</strong>, <strong>Sírio-Libanês</strong>,{' '}
                <strong>Oswaldo Cruz</strong> e <strong>Copa Star</strong> exigem linhas de categoria
                Executiva ou Premium (como Bradesco Top Nacional, Amil One S2500, SulAmérica Especial 100).
                Planos intermediários oferecem ampla cobertura em <strong>Rede D'Or São Luiz</strong>,{' '}
                <strong>Nove de Julho</strong> e <strong>Beneficência Portuguesa</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Pronto-Socorro</span>
                <span className="font-bold text-slate-800">Carência de 24h</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Acomodação</span>
                <span className="font-bold text-slate-800">Apartamento Privativo</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Maternidades</span>
                <span className="font-bold text-slate-800">Santa Joana e Pro Matre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredHospitals.map((hospital) => {
            const isSelected = selectedHospitals.includes(hospital.name);
            return (
              <div
                key={hospital.name}
                onClick={() => onSelectHospitalFilter(hospital.name)}
                className={`cursor-pointer p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {hospital.city}, {hospital.state}
                    </span>
                    <div className="flex items-center gap-1">
                      {hospital.state === activeState && (
                        <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                          Seu Estado
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          hospital.tier === 'excelencia'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {hospital.tier === 'excelencia' ? 'Excelência' : 'Referência'}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">
                    {hospital.name}
                  </h4>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium">
                  <span className={isSelected ? 'text-teal-800 font-semibold' : 'text-slate-500'}>
                    {isSelected ? 'Filtro Ativo' : 'Filtrar Planos'}
                  </span>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
