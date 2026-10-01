import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Location detection proxy endpoint
  app.get('/api/detect-location', async (req, res) => {
    try {
      const forwarded = req.headers['x-forwarded-for'];
      const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

      // In local dev/private IP, fallback to São Paulo or check external IP
      if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('10.') || clientIp.startsWith('192.168.')) {
        return res.json({
          city: 'São Paulo',
          stateUf: 'SP',
          stateName: 'São Paulo',
          country: 'BR',
          method: 'default',
        });
      }

      const lookupRes = await fetch(`https://freeipapi.com/api/json/${clientIp}`);
      if (lookupRes.ok) {
        const data = await lookupRes.json();
        const stateUf = (data.regionName || 'SP').toUpperCase();
        return res.json({
          city: data.cityName || 'São Paulo',
          stateUf: stateUf.length === 2 ? stateUf : 'SP',
          stateName: data.regionName,
          country: data.countryCode || 'BR',
          method: 'ip',
        });
      }

      res.json({ city: 'São Paulo', stateUf: 'SP', stateName: 'São Paulo', method: 'fallback' });
    } catch (e: any) {
      res.json({ city: 'São Paulo', stateUf: 'SP', stateName: 'São Paulo', method: 'fallback' });
    }
  });

  // AI Health Advisor Endpoint using Google GenAI SDK
  app.post('/api/ai-advisor', async (req, res) => {
    try {
      const { userMessage, quoteContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(200).json({
          reply: `Informações Regulatórias ANS:\n\n• **Modalidade & Descontos**: Para a modalidade ${
            quoteContext?.contractType === 'empresarial' ? 'Empresarial (MEI/PME)' : 'Individual'
          }, o mercado oferece uma economia de até 35% quando contratado via CNPJ ativo.\n• **Carências Oficiais**: Urgência/Emergência em 24h, consultas eletivas em 30 dias, cirurgias/internações em 180 dias e parto em 300 dias.\n• **Benefício Fiscal**: Todos os valores pagos em plano de saúde para você e dependentes diretos são 100% dedutíveis no IRPF (Imposto de Renda) na declaração completa, sem teto limite anual.\n• **Coparticipação**: Planos com coparticipação reduzem a mensalidade fixa em aproximadamente 24% com teto de cobrança regulado pela ANS.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é o Consultor Sênior de Inteligência em Planos de Saúde do ComparaSaúde Brasil. Você conhece profundamente todas as operadoras (Bradesco Saúde, Amil, SulAmérica, NotreDame GNDI, Unimed, Porto Seguro, Alice, Hapvida), as 10 faixas etárias da ANS (RN 563), prazos de carência, portabilidade de carências e vantagens fiscais no IRPF.

Contexto da Cotação do Usuário:
- Modalidade: ${quoteContext?.contractType || 'empresarial'}
- UF: ${quoteContext?.state || 'SP'}
- Quantidade de Vidas: ${quoteContext?.beneficiaries?.length || 1}
- Detalhes das Vidas: ${JSON.stringify(quoteContext?.beneficiaries || [])}
- Acomodação: ${quoteContext?.accommodation || 'apartamento'}
- Coparticipação: ${quoteContext?.copay || 'com_coparticipacao'}
- Teto Orçamentário: ${quoteContext?.maxMonthlyBudget ? 'R$ ' + quoteContext.maxMonthlyBudget : 'Sem limite'}

Pergunta ou Consulta do Usuário:
"${userMessage}"

Diretrizes da sua Resposta:
1. Forneça uma análise precisa, consultiva e em tom amigável e profissional.
2. Destaque orientações práticas de custo-benefício (ex: MEI a partir de 1 vida, economia de coparticipação, aproveitamento de carências de plano anterior).
3. Cite regras da ANS (Agência Nacional de Saúde Suplementar) pertinentes.
4. Utilize formatação limpa com tópicos concisos e números.
5. Escreva em português do Brasil impecável.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const reply = response.text || 'Orientação indisponível no momento.';
      res.json({ reply });
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar consultoria.' });
    }
  });

  // Setup Vite dev server or static serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
