import React, { useState } from 'react';
import { X, Send, Sparkles, Bot, User, HelpCircle, CheckCircle } from 'lucide-react';
import { QuoteInput } from '../types/healthPlan';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

interface AiHealthAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  quoteContext: QuoteInput;
}

export const AiHealthAdvisor: React.FC<AiHealthAdvisorProps> = ({
  isOpen,
  onClose,
  quoteContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Olá! Sou o Consultor de Inteligência em Planos de Saúde. Analisei a sua simulação para ${
        quoteContext.beneficiaries.length
      } vida(s) no estado de ${quoteContext.state} (${
        quoteContext.contractType === 'empresarial' ? 'Empresarial / MEI' : 'Individual'
      }). Como posso te orientar sobre coberturas, carências ANS, hospitais ou economia?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Vale mais a pena com ou sem coparticipação?',
    'Como funciona a portabilidade de carências da ANS?',
    'MEI com 6 meses de abertura já pode contratar?',
    'Como funciona a dedução integral no Imposto de Renda?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: query,
          quoteContext,
        }),
      });

      const data = await res.json();
      const aiReply =
        data.reply ||
        'Não foi possível obter resposta no momento. Por favor, verifique sua conexão ou tente novamente.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Prazos máximos ANS: 24h para emergências, 30 dias para consultas e exames simples, 180 dias para cirurgias e 300 dias para parto. A contratação via MEI proporciona economia média de 30% em relação ao plano individual com as mesmas coberturas hospitalares.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] sm:h-[650px] max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm font-display">Consultor Especialista ANS</h3>
                <span className="text-[10px] bg-teal-800 text-teal-200 px-1.5 py-0.2 rounded font-mono">
                  Gemini IA
                </span>
              </div>
              <p className="text-[11px] text-teal-200 line-clamp-1">
                Normativas da ANS e mercado de saúde
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-teal-200 hover:text-white rounded-lg hover:bg-teal-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 sm:space-y-4 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                  m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-teal-700 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 italic text-xs p-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>Analisando normativas da ANS e dados de mercado...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700 rounded-full transition-colors whitespace-nowrap shrink-0 border border-slate-200 min-h-[32px] flex items-center"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tire dúvidas sobre carências, coparticipação, MEI..."
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 min-h-[44px]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 active:scale-[0.97]"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
