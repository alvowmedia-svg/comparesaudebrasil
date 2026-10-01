import React, { useState, useMemo, useEffect } from 'react';
import {
  QuoteInput,
  CalculatedPlanQuote,
  DetectedLocation,
} from './types/healthPlan';
import { HEALTH_PLANS_DATABASE } from './data/healthPlans';
import { calculateAllPlanQuotes } from './utils/pricingEngine';
import { detectLocationBestEffort } from './utils/locationService';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { LocationDetectorBar } from './components/LocationDetectorBar';
import { QuoteWizard } from './components/QuoteWizard';
import { PlanCard } from './components/PlanCard';
import { SideBySideModal } from './components/SideBySideModal';
import { PlanDetailsModal } from './components/PlanDetailsModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { AiHealthAdvisor } from './components/AiHealthAdvisor';
import { HospitalNetworkExplorer } from './components/HospitalNetworkExplorer';
import { RegulatorySection } from './components/RegulatorySection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import {
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  Sparkles,
  Scale,
  CheckCircle,
  Building2,
  X,
} from 'lucide-react';

export default function App() {
  // Default quotation parameters
  const [quoteInput, setQuoteInput] = useState<QuoteInput>({
    contractType: 'empresarial',
    state: 'SP',
    city: 'São Paulo',
    accommodation: 'apartamento',
    copay: 'com_coparticipacao',
    coverageArea: 'nacional',
    beneficiaries: [
      { id: 'ben-1', name: 'Titular (Você)', relationship: 'titular', age: 34, ageBracket: '34-38' },
      { id: 'ben-2', name: 'Cônjuge', relationship: 'conjuge', age: 32, ageBracket: '29-33' },
      { id: 'ben-3', name: 'Filho(a)', relationship: 'filho', age: 4, ageBracket: '00-18' },
    ],
    selectedHospitals: [],
    operatorFilter: 'all',
  });

  // Auto-detect user's location on initial load
  useEffect(() => {
    detectLocationBestEffort()
      .then((detected) => {
        if (detected && detected.state) {
          setQuoteInput((prev) => {
            if (prev.detectedLocation?.method === 'gps' || prev.detectedLocation?.method === 'cep') {
              return prev;
            }
            return {
              ...prev,
              city: detected.city,
              state: detected.state,
              detectedLocation: detected,
            };
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLocationChange = (newLocation: DetectedLocation) => {
    setQuoteInput((prev) => ({
      ...prev,
      city: newLocation.city,
      state: newLocation.state,
      cep: newLocation.cep || prev.cep,
      detectedLocation: newLocation,
    }));
  };

  // Sorting and sub-filter states
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'ans_score' | 'reimbursement'>('price_asc');
  const [tierFilter, setTierFilter] = useState<'all' | 'economico' | 'intermediario' | 'executivo' | 'premium'>('all');

  // Selected plans for side-by-side comparison (up to 4)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Modals state
  const [isSideBySideModalOpen, setIsSideBySideModalOpen] = useState(false);
  const [detailsModalPlan, setDetailsModalPlan] = useState<CalculatedPlanQuote | null>(null);
  const [proposalModalPlan, setProposalModalPlan] = useState<CalculatedPlanQuote | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Recalculate quotes whenever quoteInput changes
  const allCalculatedQuotes = useMemo(() => {
    return calculateAllPlanQuotes(HEALTH_PLANS_DATABASE, quoteInput);
  }, [quoteInput]);

  // Filter & sort quotes
  const displayedQuotes = useMemo(() => {
    let result = [...allCalculatedQuotes];

    // Filter by tier
    if (tierFilter !== 'all') {
      const plansMatchingTier = HEALTH_PLANS_DATABASE.filter((p) => p.tier === tierFilter).map(
        (p) => p.id
      );
      result = result.filter((q) => plansMatchingTier.includes(q.planId));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.totalMonthlyPrice - b.totalMonthlyPrice;
      if (sortBy === 'price_desc') return b.totalMonthlyPrice - a.totalMonthlyPrice;
      if (sortBy === 'ans_score') return b.ansScore - a.ansScore;
      if (sortBy === 'reimbursement') return b.reimbursementConsultation - a.reimbursementConsultation;
      return 0;
    });

    return result;
  }, [allCalculatedQuotes, sortBy, tierFilter]);

  // Toggle plan comparison selection
  const handleToggleCompare = (planId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId);
      }
      if (prev.length >= 4) {
        alert('Você pode comparar até 4 planos simultaneamente.');
        return prev;
      }
      return [...prev, planId];
    });
  };

  // Selected plan objects for side-by-side modal
  const comparisonPlanObjects = useMemo(() => {
    return allCalculatedQuotes.filter((q) => selectedForComparison.includes(q.planId));
  }, [allCalculatedQuotes, selectedForComparison]);

  // Quick jump helper
  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hospital filter toggle from explorer
  const handleSelectHospitalFilter = (hospitalName: string) => {
    setQuoteInput((prev) => {
      const current = prev.selectedHospitals || [];
      const updated = current.includes(hospitalName)
        ? current.filter((h) => h !== hospitalName)
        : [...current, hospitalName];
      return {
        ...prev,
        selectedHospitals: updated,
      };
    });
    scrollTo('comparador');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Clean Header */}
      <Header
        onStartQuote={() => scrollTo('simulador')}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        activeSection="simulador"
      />

      {/* Hero Section */}
      <HeroSection
        onStartSimulation={() => scrollTo('simulador')}
        onExploreHospitals={() => scrollTo('hospitais')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-10 space-y-8 sm:space-y-10">
        {/* Dynamic Location Precision Bar */}
        <LocationDetectorBar
          currentInput={quoteInput}
          onLocationChange={handleLocationChange}
        />

        {/* Interactive Quote Wizard */}
        <QuoteWizard
          currentInput={quoteInput}
          onUpdateInput={setQuoteInput}
          onSimulate={() => scrollTo('comparador')}
        />

        {/* COMPARISON RESULTS SECTION */}
        <section id="comparador" className="space-y-6 pt-4">
          {/* Results Summary Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                  Planos Disponíveis ({displayedQuotes.length} opções)
                </h2>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  {quoteInput.state} ({quoteInput.beneficiaries.length} vidas)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimativas mensais calculadas considerando modalidade{' '}
                <strong className="text-slate-800">
                  {quoteInput.contractType === 'empresarial'
                    ? 'Empresarial MEI/PME'
                    : quoteInput.contractType === 'adesao'
                    ? 'Adesão'
                    : 'Individual'}
                </strong>{' '}
                e acomodação <strong className="text-slate-800 capitalize">{quoteInput.accommodation}</strong>.
              </p>
            </div>

            {/* Controls: Segmented Tier Filters & Sort - mobile scrollable */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto">
              {/* Category Segmented Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setTierFilter('all')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
                    tierFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTierFilter('economico')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
                    tierFilter === 'economico'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Econômicos
                </button>
                <button
                  onClick={() => setTierFilter('intermediario')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
                    tierFilter === 'intermediario'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Intermediários
                </button>
                <button
                  onClick={() => setTierFilter('premium')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[38px] ${
                    tierFilter === 'premium'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Premium
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 w-full sm:w-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium min-h-[40px]"
                >
                  <option value="price_asc">Menor Preço Mensal</option>
                  <option value="price_desc">Maior Preço Mensal</option>
                  <option value="ans_score">Maior Nota ANS (IDSS)</option>
                  <option value="reimbursement">Maior Reembolso</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Hospital Filter Tag if any */}
          {quoteInput.selectedHospitals && quoteInput.selectedHospitals.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-teal-900">
              <span className="font-semibold">Filtro de Hospital Ativo:</span>
              <div className="flex flex-wrap gap-1.5">
                {quoteInput.selectedHospitals.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-teal-200 font-medium"
                  >
                    <span>{h}</span>
                    <button
                      onClick={() => handleSelectHospitalFilter(h)}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => setQuoteInput({ ...quoteInput, selectedHospitals: [] })}
                className="ml-auto text-xs text-teal-700 underline font-medium"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Grid of Calculated Plans */}
          {displayedQuotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedQuotes.map((quote) => (
                <PlanCard
                  key={quote.planId}
                  quote={quote}
                  isSelectedForComparison={selectedForComparison.includes(quote.planId)}
                  onToggleCompare={handleToggleCompare}
                  onViewDetails={setDetailsModalPlan}
                  onRequestProposal={setProposalModalPlan}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhum plano encontrado para os filtros selecionados
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tente ajustar a cidade/estado, aumentar o teto de orçamento mensal ou selecionar outra categoria.
              </p>
              <button
                onClick={() =>
                  setQuoteInput({
                    ...quoteInput,
                    maxMonthlyBudget: undefined,
                    operatorFilter: 'all',
                    selectedHospitals: [],
                  })
                }
                className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                Restaurar Filtros Padrão
              </button>
            </div>
          )}
        </section>

        {/* Hospital Network Explorer */}
        <HospitalNetworkExplorer
          onSelectHospitalFilter={handleSelectHospitalFilter}
          selectedHospitals={quoteInput.selectedHospitals || []}
          activeState={quoteInput.state}
          activeCity={quoteInput.city}
        />

        {/* Regulatory & ANS Directives Section */}
        <RegulatorySection />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Floating Bottom Sticky Bar when plans are selected for comparison */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-20 md:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-40 max-w-2xl mx-auto bg-slate-900 text-white p-2.5 sm:p-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-xs shrink-0">
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold font-display leading-tight">
                {selectedForComparison.length} {selectedForComparison.length === 1 ? 'plano' : 'planos'}
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Selecione até 4 planos para comparar
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedForComparison([])}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors min-h-[36px]"
            >
              Limpar
            </button>
            <button
              onClick={() => setIsSideBySideModalOpen(true)}
              className="px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5 min-h-[36px]"
            >
              <span>Comparar ({selectedForComparison.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Navegação rápida mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around h-16 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <button
          onClick={() => scrollTo('simulador')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-teal-700 active:scale-95 transition-all min-h-[48px]"
        >
          <SlidersHorizontal className="w-5 h-5 text-teal-600" />
          <span className="text-[11px] font-medium mt-0.5">Simular</span>
        </button>

        <button
          onClick={() => scrollTo('comparador')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-teal-700 active:scale-95 transition-all min-h-[48px]"
        >
          <Layers className="w-5 h-5 text-teal-600" />
          <span className="text-[11px] font-medium mt-0.5">Planos</span>
        </button>

        <button
          onClick={() => scrollTo('hospitais')}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-600 hover:text-teal-700 active:scale-95 transition-all min-h-[48px]"
        >
          <Building2 className="w-5 h-5 text-teal-600" />
          <span className="text-[11px] font-medium mt-0.5">Hospitais</span>
        </button>

        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-teal-800 hover:text-teal-900 active:scale-95 transition-all min-h-[48px]"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 text-teal-700">Consultor IA</span>
        </button>
      </nav>

      {/* Side-by-Side Comparison Modal */}
      <SideBySideModal
        selectedPlans={comparisonPlanObjects}
        isOpen={isSideBySideModalOpen}
        onClose={() => setIsSideBySideModalOpen(false)}
        onRemovePlan={(id) => setSelectedForComparison((prev) => prev.filter((item) => item !== id))}
        onRequestProposal={setProposalModalPlan}
      />

      {/* Plan Details & Carências Modal */}
      <PlanDetailsModal
        quote={detailsModalPlan}
        isOpen={!!detailsModalPlan}
        onClose={() => setDetailsModalPlan(null)}
        onRequestProposal={setProposalModalPlan}
      />

      {/* Export / Official Proposal Modal */}
      <ExportSummaryModal
        quote={proposalModalPlan}
        input={quoteInput}
        isOpen={!!proposalModalPlan}
        onClose={() => setProposalModalPlan(null)}
      />

      {/* AI Health Advisor Drawer / Modal */}
      <AiHealthAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        quoteContext={quoteInput}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
