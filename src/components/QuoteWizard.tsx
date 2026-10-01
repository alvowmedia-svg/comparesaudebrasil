import React, { useState } from 'react';
import {
  Users,
  Building2,
  User,
  Plus,
  Minus,
  Trash2,
  Sliders,
  Shield,
  MapPin,
  Sparkles,
  Info,
  Building,
  Crosshair,
  Loader2,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  AccommodationType,
  Beneficiary,
  ContractType,
  CopayType,
  CoverageArea,
  DetectedLocation,
  QuoteInput,
} from '../types/healthPlan';
import { BRAZILIAN_STATES, REFERENCE_HOSPITALS } from '../data/healthPlans';
import { getAnsAgeBracket, getAnsAgeBracketLabel, ANS_BRACKET_FACTORS } from '../utils/pricingEngine';
import { detectLocationByGps, lookupCep, formatCep } from '../utils/locationService';

interface QuoteWizardProps {
  currentInput: QuoteInput;
  onUpdateInput: (newInput: QuoteInput) => void;
  onSimulate: () => void;
}

export const QuoteWizard: React.FC<QuoteWizardProps> = ({
  currentInput,
  onUpdateInput,
  onSimulate,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'beneficiaries' | 'coverage' | 'filters'>('profile');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepField, setCepField] = useState(currentInput.cep || '');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Helper to update specific fields in currentInput
  const updateField = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => {
    onUpdateInput({
      ...currentInput,
      [key]: value,
    });
  };

  const handleGpsDetect = async () => {
    setIsDetectingGps(true);
    setLocationMessage(null);
    try {
      const loc = await detectLocationByGps();
      onUpdateInput({
        ...currentInput,
        city: loc.city,
        state: loc.state,
        detectedLocation: loc,
      });
      setLocationMessage(`Localização detectada via GPS: ${loc.city}, ${loc.state}`);
      setTimeout(() => setLocationMessage(null), 4000);
    } catch (err: any) {
      setLocationMessage(err.message || 'Não foi possível obter sinal de GPS.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  const handleCepSearch = async (val?: string) => {
    const raw = (val || cepField).replace(/\D/g, '');
    if (raw.length !== 8) return;

    setIsSearchingCep(true);
    setLocationMessage(null);
    try {
      const loc = await lookupCep(raw);
      setCepField(loc.cep || raw);
      onUpdateInput({
        ...currentInput,
        city: loc.city,
        state: loc.state,
        cep: loc.cep,
        detectedLocation: loc,
      });
      setLocationMessage(`CEP localizado: ${loc.city}, ${loc.state} ${loc.neighborhood ? `(${loc.neighborhood})` : ''}`);
      setTimeout(() => setLocationMessage(null), 4000);
    } catch (err: any) {
      setLocationMessage(err.message || 'CEP não encontrado.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCepField(formatted);
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length === 8) {
      handleCepSearch(digits);
    }
  };

  // Add a new beneficiary
  const handleAddBeneficiary = () => {
    const defaultAge = 30;
    const newBeneficiary: Beneficiary = {
      id: `ben-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Dependente ${currentInput.beneficiaries.length}`,
      relationship: currentInput.beneficiaries.length === 1 ? 'conjuge' : 'filho',
      age: defaultAge,
      ageBracket: getAnsAgeBracket(defaultAge),
    };

    onUpdateInput({
      ...currentInput,
      beneficiaries: [...currentInput.beneficiaries, newBeneficiary],
    });
  };

  // Update a single beneficiary
  const handleUpdateBeneficiary = (id: string, updates: Partial<Beneficiary>) => {
    const updated = currentInput.beneficiaries.map((b) => {
      if (b.id !== id) return b;
      const newAge = updates.age !== undefined ? Math.max(0, Math.min(110, updates.age)) : b.age;
      return {
        ...b,
        ...updates,
        age: newAge,
        ageBracket: getAnsAgeBracket(newAge),
      };
    });

    onUpdateInput({
      ...currentInput,
      beneficiaries: updated,
    });
  };

  // Remove a beneficiary (minimum 1)
  const handleRemoveBeneficiary = (id: string) => {
    if (currentInput.beneficiaries.length <= 1) return;
    onUpdateInput({
      ...currentInput,
      beneficiaries: currentInput.beneficiaries.filter((b) => b.id !== id),
    });
  };

  // Preset loaders for fast testing
  const loadPreset = (type: 'jovem' | 'casal_filho' | 'familia_senior' | 'pme') => {
    if (type === 'jovem') {
      onUpdateInput({
        ...currentInput,
        contractType: 'individual',
        accommodation: 'enfermaria',
        copay: 'com_coparticipacao',
        beneficiaries: [
          { id: 'ben-1', name: 'Titular', relationship: 'titular', age: 26, ageBracket: '24-28' },
        ],
      });
    } else if (type === 'casal_filho') {
      onUpdateInput({
        ...currentInput,
        contractType: 'empresarial',
        accommodation: 'apartamento',
        copay: 'com_coparticipacao',
        beneficiaries: [
          { id: 'ben-1', name: 'Titular (Sócio)', relationship: 'titular', age: 34, ageBracket: '34-38' },
          { id: 'ben-2', name: 'Cônjuge', relationship: 'conjuge', age: 32, ageBracket: '29-33' },
          { id: 'ben-3', name: 'Filho', relationship: 'filho', age: 4, ageBracket: '00-18' },
        ],
      });
    } else if (type === 'familia_senior') {
      onUpdateInput({
        ...currentInput,
        contractType: 'empresarial',
        accommodation: 'apartamento',
        copay: 'sem_coparticipacao',
        beneficiaries: [
          { id: 'ben-1', name: 'Titular', relationship: 'titular', age: 62, ageBracket: '59+' },
          { id: 'ben-2', name: 'Cônjuge', relationship: 'conjuge', age: 58, ageBracket: '54-58' },
        ],
      });
    } else if (type === 'pme') {
      onUpdateInput({
        ...currentInput,
        contractType: 'empresarial',
        accommodation: 'enfermaria',
        copay: 'com_coparticipacao',
        beneficiaries: [
          { id: 'ben-1', name: 'Colaborador 1', relationship: 'titular', age: 25, ageBracket: '24-28' },
          { id: 'ben-2', name: 'Colaborador 2', relationship: 'outro', age: 31, ageBracket: '29-33' },
          { id: 'ben-3', name: 'Colaborador 3', relationship: 'outro', age: 42, ageBracket: '39-43' },
          { id: 'ben-4', name: 'Colaborador 4', relationship: 'outro', age: 29, ageBracket: '29-33' },
          { id: 'ben-5', name: 'Colaborador 5', relationship: 'outro', age: 36, ageBracket: '34-38' },
          { id: 'ben-6', name: 'Diretor', relationship: 'outro', age: 52, ageBracket: '49-53' },
        ],
      });
    }
  };

  return (
    <div id="simulador" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar of wizard */}
      <div className="p-3.5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
              Configurador Condicional de Cotação
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Personalize a modalidade, as vidas e a cobertura para calcular a estimativa média de mercado.
            </p>
          </div>

          {/* Quick presets buttons - smooth horizontal touch scroll on mobile without overflow */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
            <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap shrink-0">Exemplos:</span>
            <button
              onClick={() => loadPreset('jovem')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
            >
              Jovem 26 anos
            </button>
            <button
              onClick={() => loadPreset('casal_filho')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-teal-700 font-medium text-xs rounded-lg border border-teal-200 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
            >
              Casal + 1 Filho (MEI)
            </button>
            <button
              onClick={() => loadPreset('familia_senior')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
            >
              Sênior 59+
            </button>
            <button
              onClick={() => loadPreset('pme')}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
            >
              PME 6 Vidas
            </button>
          </div>
        </div>

        {/* Wizard navigation segmented tabs */}
        <div className="flex items-center gap-1 mt-4 sm:mt-6 p-1 bg-slate-200/70 rounded-xl overflow-x-auto text-xs font-semibold no-scrollbar w-full max-w-full">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">1. Perfil</span>
            <span className="hidden sm:inline">1. Tipo de Contratação & Local</span>
          </button>
          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'beneficiaries'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">2. Vidas ({currentInput.beneficiaries.length})</span>
            <span className="hidden sm:inline">2. Beneficiários ({currentInput.beneficiaries.length} vidas)</span>
          </button>
          <button
            onClick={() => setActiveTab('coverage')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'coverage'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">3. Cobertura</span>
            <span className="hidden sm:inline">3. Cobertura & Coparticipação</span>
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'filters'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">4. Filtros</span>
            <span className="hidden sm:inline">4. Hospitais & Filtros Avançados</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-3.5 sm:p-6">
        {/* TAB 1: Profile & Location */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center sm:text-left">
                Modalidade de Contratação
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                {/* Empresarial / MEI */}
                <div
                  onClick={() => updateField('contractType', 'empresarial')}
                  className={`cursor-pointer p-3 sm:p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between active:scale-[0.99] ${
                    currentInput.contractType === 'empresarial'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm text-slate-900 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            currentInput.contractType === 'empresarial'
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {currentInput.contractType === 'empresarial' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">Empresarial / MEI</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        -35% OFF
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Válido para MEI, Eireli, LTDA a partir de 1 ou 2 vidas (titular + dependente).
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[10px] text-teal-700 font-semibold">
                    CNPJ Ativo
                  </div>
                </div>

                {/* Individual / Familiar */}
                <div
                  onClick={() => updateField('contractType', 'individual')}
                  className={`cursor-pointer p-3 sm:p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between active:scale-[0.99] ${
                    currentInput.contractType === 'individual'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm text-slate-900 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            currentInput.contractType === 'individual'
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {currentInput.contractType === 'individual' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <User className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">Individual / Familiar</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        ANS PF
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Pessoa física com reajuste anual direto pela ANS. Sem exigência de CNPJ.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[10px] text-slate-600 font-semibold">
                    CPF Direto
                  </div>
                </div>

                {/* Coletivo por Adesão */}
                <div
                  onClick={() => updateField('contractType', 'adesao')}
                  className={`cursor-pointer p-3 sm:p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between active:scale-[0.99] ${
                    currentInput.contractType === 'adesao'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-950 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm text-slate-900 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            currentInput.contractType === 'adesao'
                              ? 'border-teal-600 bg-teal-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {currentInput.contractType === 'adesao' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <Users className="w-4 h-4 text-teal-600 shrink-0" />
                        <span className="truncate">Coletivo Adesão</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded shrink-0">
                        -18% OFF
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">
                      Para profissionais vinculados a sindicatos, conselhos (CRM, OAB, CREA) ou estudantes.
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[10px] text-slate-600 font-semibold">
                    Entidades de Classe
                  </div>
                </div>
              </div>
            </div>

            {/* Location selector with CEP & GPS precision - centered on mobile */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Identificação de Localização & CEP
                  </label>
                  <p className="text-xs text-slate-500">
                    A precificação e a disponibilidade de rede hospitalar dependem do seu Estado e Cidade.
                  </p>
                </div>

                {/* Instant GPS button - centered on mobile */}
                <button
                  type="button"
                  onClick={handleGpsDetect}
                  disabled={isDetectingGps}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl transition-colors border border-teal-200 shrink-0 mx-auto sm:mx-0 h-10 active:scale-[0.98] w-full sm:w-auto max-w-xs"
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detectando GPS...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-3.5 h-3.5 text-teal-600" />
                      <span>Detectar GPS Automático</span>
                    </>
                  )}
                </button>
              </div>

              {locationMessage && (
                <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{locationMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-full">
                {/* CEP input - centered on mobile */}
                <div className="flex flex-col items-center sm:items-stretch text-center sm:text-left w-full">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Buscar por CEP
                  </label>
                  <div className="relative w-full max-w-xs sm:max-w-none">
                    <input
                      type="text"
                      value={cepField}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 h-10 pr-9 text-center sm:text-left"
                    />
                    <button
                      type="button"
                      onClick={() => handleCepSearch()}
                      disabled={isSearchingCep}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-teal-700 min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Localizar CEP"
                    >
                      {isSearchingCep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Preenche cidade e UF
                  </span>
                </div>

                {/* State selector - centered on mobile */}
                <div className="flex flex-col items-center sm:items-stretch text-center sm:text-left w-full">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Estado (UF)
                  </label>
                  <div className="relative w-full max-w-xs sm:max-w-none">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                    <select
                      value={currentInput.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 h-10 text-center sm:text-left"
                    >
                      {BRAZILIAN_STATES.map((st) => (
                        <option key={st.uf} value={st.uf}>
                          {st.uf} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Regional oficial ANS
                  </span>
                </div>

                {/* City input - centered on mobile */}
                <div className="flex flex-col items-center sm:items-stretch text-center sm:text-left w-full">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Cidade
                  </label>
                  <div className="w-full max-w-xs sm:max-w-none">
                    <input
                      type="text"
                      value={currentInput.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 h-10 text-center sm:text-left"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Município da contratação
                  </span>
                </div>
              </div>

              {/* Step Navigation to Next Tab - centered on mobile */}
              <div className="pt-2 flex justify-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('beneficiaries')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors h-10 active:scale-[0.98]"
                >
                  <span>Avançar para Vidas & Idades ({currentInput.beneficiaries.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Beneficiaries & Ages */}
        {activeTab === 'beneficiaries' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-900">
                  Beneficiários do Plano ({currentInput.beneficiaries.length} vidas)
                </h3>
                <p className="text-xs text-slate-500">
                  A cotação é calculada vida a vida com base nas 10 faixas etárias regulamentadas pela ANS.
                </p>
              </div>
              <button
                onClick={handleAddBeneficiary}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200 min-h-[40px] w-full sm:w-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Dependente</span>
              </button>
            </div>

            {/* List of Beneficiaries */}
            <div className="space-y-3">
              {currentInput.beneficiaries.map((b, idx) => {
                const bracket = getAnsAgeBracket(b.age);
                const bracketFactor = ANS_BRACKET_FACTORS[bracket];

                return (
                  <div
                    key={b.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-xs text-slate-800">
                          {b.name || `Beneficiário ${idx + 1}`}
                        </span>
                      </div>

                      {currentInput.beneficiaries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBeneficiary(b.id)}
                          title="Remover beneficiário"
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.95]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                          Nome / Identificação
                        </label>
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) =>
                            handleUpdateBeneficiary(b.id, { name: e.target.value })
                          }
                          placeholder="Ex: Titular, Esposa..."
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 h-10 min-h-[42px]"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                          Parentesco
                        </label>
                        <select
                          value={b.relationship}
                          onChange={(e) =>
                            handleUpdateBeneficiary(b.id, {
                              relationship: e.target.value as any,
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 h-10 min-h-[42px]"
                        >
                          <option value="titular">Titular</option>
                          <option value="conjuge">Cônjuge / Parceiro(a)</option>
                          <option value="filho">Filho(a) / Dependente</option>
                          <option value="pais">Pai / Mãe</option>
                          <option value="outro">Outro dependente</option>
                        </select>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                          Idade (anos)
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBeneficiary(b.id, {
                                age: Math.max(0, b.age - 1),
                              })
                            }
                            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 transition-colors"
                            aria-label="Diminuir idade"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="110"
                            value={b.age}
                            onChange={(e) =>
                              handleUpdateBeneficiary(b.id, {
                                age: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 text-center h-10 min-h-[42px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBeneficiary(b.id, {
                                age: Math.min(110, b.age + 1),
                              })
                            }
                            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 transition-colors"
                            aria-label="Aumentar idade"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-2 md:col-span-2 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between md:flex-col md:items-start">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Faixa ANS</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {getAnsAgeBracketLabel(bracket)}
                        </span>
                        <span className="text-[10px] text-teal-600 font-mono">
                          Fator {bracketFactor.toFixed(2)}x
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Regra ANS RN 563:</strong> A variação acumulada entre a 7ª e a 10ª faixa etária
                não pode ser superior à variação acumulada entre a 1ª e a 7ª faixa, e a última faixa (59+)
                não pode ser mais do que 6 vezes o valor da primeira (0 a 18 anos).
              </p>
            </div>

            {/* Step Navigation to Next Tab */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coverage')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors min-h-[44px]"
              >
                <span>Avançar para Cobertura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Coverage, Accommodation & Copay */}
        {activeTab === 'coverage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acomodação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipo de Acomodação em Internação
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => updateField('accommodation', 'enfermaria')}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                      currentInput.accommodation === 'enfermaria'
                        ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Enfermaria</div>
                    <p className="text-xs text-slate-500">
                      Quarto coletivo (2 a 4 leitos). Menor custo mensal (econômico).
                    </p>
                  </div>

                  <div
                    onClick={() => updateField('accommodation', 'apartamento')}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                      currentInput.accommodation === 'apartamento'
                        ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Apartamento</div>
                    <p className="text-xs text-slate-500">
                      Quarto individual com banheiro privativo e acompanhante 24h.
                    </p>
                  </div>
                </div>
              </div>

              {/* Coparticipação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Modelo de Coparticipação
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => updateField('copay', 'com_coparticipacao')}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                      currentInput.copay === 'com_coparticipacao'
                        ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Com Coparticipação</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        -24%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Mensalidade mais barata. Pequena taxa apenas ao usar consultas/exames.
                    </p>
                  </div>

                  <div
                    onClick={() => updateField('copay', 'sem_coparticipacao')}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl border-2 transition-all ${
                      currentInput.copay === 'sem_coparticipacao'
                        ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">Sem Coparticipação</div>
                    <p className="text-xs text-slate-500">
                      Mensalidade fixa total. Custo zero ao consultar médicos ou realizar exames.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Abrangência Geográfica */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Abrangência Geográfica
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => updateField('coverageArea', 'regional')}
                  className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                    currentInput.coverageArea === 'regional'
                      ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs mb-0.5">Regional / Grupo de Municípios</div>
                  <p className="text-[11px] text-slate-500">
                    Focado na sua região metropolitana e cidades vizinhas. Maior custo-benefício.
                  </p>
                </div>

                <div
                  onClick={() => updateField('coverageArea', 'nacional')}
                  className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                    currentInput.coverageArea === 'nacional'
                      ? 'border-teal-600 bg-teal-50/40 text-teal-950'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs mb-0.5">Nacional (Todo o Brasil)</div>
                  <p className="text-[11px] text-slate-500">
                    Atendimento eletivo e de urgência em qualquer estado da federação.
                  </p>
                </div>
              </div>
            </div>

            {/* Step Navigation to Next Tab */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setActiveTab('beneficiaries')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors min-h-[44px]"
              >
                <span>Avançar para Filtros</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Reference Hospitals & Advanced Filters */}
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center sm:text-left">
                Filtrar por Hospitais de Excelência Desejados (Opcional)
              </label>
              <p className="text-xs text-slate-500 mb-3 text-center sm:text-left">
                Selecione os hospitais que você faz questão que estejam credenciados:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {REFERENCE_HOSPITALS.slice(0, 9).map((h) => {
                  const isSelected = (currentInput.selectedHospitals || []).includes(h.name);
                  return (
                    <button
                      key={h.name}
                      onClick={() => {
                        const current = currentInput.selectedHospitals || [];
                        const updated = isSelected
                          ? current.filter((item) => item !== h.name)
                          : [...current, h.name];
                        updateField('selectedHospitals', updated);
                      }}
                      className={`text-left p-3 rounded-xl border text-xs transition-all min-h-[44px] ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="truncate font-medium">{h.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {h.city} · {h.tier === 'excelencia' ? 'Nível A' : 'Referência'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center sm:text-left">
                  Filtrar por Operadora
                </label>
                <select
                  value={currentInput.operatorFilter || 'all'}
                  onChange={(e) => updateField('operatorFilter', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[44px]"
                >
                  <option value="all">Todas as Operadoras</option>
                  <option value="bradesco">Bradesco Saúde</option>
                  <option value="amil">Amil Saúde</option>
                  <option value="sulamerica">SulAmérica Saúde</option>
                  <option value="gndi">NotreDame Intermédica (GNDI)</option>
                  <option value="unimed">Unimed</option>
                  <option value="portoseguro">Porto Seguro Saúde</option>
                  <option value="alice">Alice</option>
                  <option value="hapvida">Hapvida</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center sm:text-left">
                  Teto Máximo Mensal Desejado (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1500 (Em branco = sem limite)"
                  value={currentInput.maxMonthlyBudget || ''}
                  onChange={(e) =>
                    updateField(
                      'maxMonthlyBudget',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono min-h-[44px] text-center sm:text-left"
                />
              </div>
            </div>

            {/* Step Navigation to Simulate */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setActiveTab('coverage')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={onSimulate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors min-h-[44px] active:scale-[0.99]"
              >
                <span>Ver Planos & Cotação</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer action bar - centered on mobile */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          Total: <strong className="text-slate-900">{currentInput.beneficiaries.length} vidas</strong> em{' '}
          <strong className="text-slate-900">{currentInput.state}</strong> (
          {currentInput.contractType === 'empresarial'
            ? 'Empresarial / MEI'
            : currentInput.contractType === 'adesao'
            ? 'Adesão'
            : 'Individual PF'}
          ).
        </div>

        <button
          onClick={onSimulate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs min-h-[48px] active:scale-[0.99]"
        >
          <span>Atualizar Estimativas & Comparação</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
