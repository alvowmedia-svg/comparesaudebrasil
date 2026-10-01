import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DetectedLocation, QuoteInput } from '../types/healthPlan';
import {
  detectLocationByGps,
  lookupCep,
  formatCep,
} from '../utils/locationService';
import { BRAZILIAN_STATES } from '../data/healthPlans';

interface LocationDetectorBarProps {
  currentInput: QuoteInput;
  onLocationChange: (location: DetectedLocation) => void;
}

export const LocationDetectorBar: React.FC<LocationDetectorBarProps> = ({
  currentInput,
  onLocationChange,
}) => {
  const [cepInput, setCepInput] = useState(currentInput.cep || '');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isManualExpanded, setIsManualExpanded] = useState(false);

  // Trigger GPS detection
  const handleDetectGps = async () => {
    setIsDetectingGps(true);
    setFeedback(null);
    try {
      const loc = await detectLocationByGps();
      onLocationChange(loc);
      setFeedback({
        type: 'success',
        message: `Localização confirmada via GPS: ${loc.city}, ${loc.state}`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Não foi possível obter sinal de GPS. Digite seu CEP.',
      });
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Trigger CEP lookup
  const handleLookupCep = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = cepInput.replace(/\D/g, '');
    if (clean.length !== 8) {
      setFeedback({
        type: 'error',
        message: 'Digite um CEP válido com 8 dígitos numéricos.',
      });
      return;
    }

    setIsSearchingCep(true);
    setFeedback(null);
    try {
      const loc = await lookupCep(clean);
      onLocationChange(loc);
      setFeedback({
        type: 'success',
        message: `CEP identificado: ${loc.city}, ${loc.state} ${
          loc.neighborhood ? `(${loc.neighborhood})` : ''
        }`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'CEP não localizado.',
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepInputChange = (val: string) => {
    const formatted = formatCep(val);
    setCepInput(formatted);
    // Auto-search when 8 digits are reached
    const digits = val.replace(/\D/g, '');
    if (digits.length === 8) {
      setTimeout(() => {
        lookupCep(digits)
          .then((loc) => {
            onLocationChange(loc);
            setFeedback({
              type: 'success',
              message: `CEP identificado: ${loc.city}, ${loc.state}`,
            });
            setTimeout(() => setFeedback(null), 4000);
          })
          .catch(() => {});
      }, 100);
    }
  };

  const currentStateObj = BRAZILIAN_STATES.find((s) => s.uf === currentInput.state);

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-3.5 sm:p-5 border border-teal-800/60 shadow-md w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Current Active Location - centered on mobile & tablet */}
        <div className="space-y-1.5 flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-auto">
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs">Localização Ativa para Precisão de Rede & Preços</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap max-w-full">
            <h3 className="text-base sm:text-xl md:text-2xl font-bold font-display text-white flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 flex-wrap text-center lg:text-left break-words">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
              <span>
                {currentInput.city}, {currentInput.state}
              </span>
              <span className="text-xs text-slate-300 font-normal">
                ({currentStateObj ? currentStateObj.name : 'Brasil'})
              </span>
            </h3>

            {/* Detection method badge */}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-700/60 inline-flex items-center">
              {currentInput.detectedLocation?.method === 'gps'
                ? 'Sinal de GPS'
                : currentInput.detectedLocation?.method === 'cep'
                ? `CEP ${currentInput.detectedLocation.cep}`
                : currentInput.detectedLocation?.method === 'ip'
                ? 'Detecção por IP'
                : 'Seleção Regional'}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl text-center lg:text-left">
            Tabelas e rede credenciada ajustadas para{' '}
            <strong className="text-slate-200">{currentInput.city}</strong> e região.
          </p>
        </div>

        {/* Right: GPS, CEP and Manual Actions - centered on mobile & tablet */}
        <div className="flex flex-col items-center justify-center lg:items-end gap-2.5 w-full lg:w-auto max-w-sm mx-auto lg:max-w-none lg:mx-0">
          {/* CEP Input Form - centered */}
          <form onSubmit={handleLookupCep} className="flex items-center justify-center gap-2 w-full">
            <input
              type="text"
              value={cepInput}
              onChange={(e) => handleCepInputChange(e.target.value)}
              placeholder="Digite seu CEP (ex: 01310-100)"
              maxLength={9}
              className="w-full flex-1 px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono h-10 text-center min-w-0"
            />
            <button
              type="submit"
              disabled={isSearchingCep}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors h-10 flex items-center justify-center gap-1 shrink-0 active:scale-[0.97] text-xs font-semibold"
              title="Buscar CEP"
            >
              {isSearchingCep ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </form>

          {/* Action buttons: 2 columns grid centered */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* 1-Click GPS button */}
            <button
              onClick={handleDetectGps}
              disabled={isDetectingGps}
              className="h-10 px-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-[0.98] w-full"
              title="Usar localização do dispositivo (GPS)"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Localizando...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 text-teal-200" />
                  <span>Localizar GPS</span>
                </>
              )}
            </button>

            {/* Mudar Estado Button */}
            <button
              onClick={() => setIsManualExpanded(!isManualExpanded)}
              className="h-10 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors whitespace-nowrap flex items-center justify-center active:scale-[0.98] w-full"
            >
              {isManualExpanded ? 'Fechar UFs' : 'Mudar UF (27)'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert if any */}
      {feedback && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800'
              : 'bg-rose-950/80 text-rose-200 border border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="leading-snug">{feedback.message}</span>
        </div>
      )}

      {/* Quick State Picker Tray when expanded */}
      {isManualExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 block font-semibold">
              Selecione seu Estado para calibrar a cotação regional:
            </span>
            <span className="text-[10px] text-teal-400">27 UFs</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1.5 text-xs max-h-52 overflow-y-auto p-1">
            {BRAZILIAN_STATES.map((st) => (
              <button
                key={st.uf}
                onClick={() => {
                  onLocationChange({
                    city: st.name,
                    state: st.uf,
                    stateName: st.name,
                    method: 'manual',
                    accuracy: 'approximate',
                  });
                  setIsManualExpanded(false);
                }}
                className={`px-2 py-2 rounded-xl transition-colors border text-xs min-h-[40px] flex items-center justify-center font-bold ${
                  currentInput.state === st.uf
                    ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title={st.name}
              >
                {st.uf}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
