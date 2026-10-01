import { DetectedLocation } from '../types/healthPlan';
import { BRAZILIAN_STATES } from '../data/healthPlans';

// Map of full state names / variants to 2-letter UF
const STATE_NAME_TO_UF: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapá: 'AP',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceará: 'CE',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  goiás: 'GO',
  goias: 'GO',
  maranhão: 'MA',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  pará: 'PA',
  para: 'PA',
  paraíba: 'PB',
  paraiba: 'PB',
  paraná: 'PR',
  parana: 'PR',
  pernambuco: 'PE',
  piauí: 'PI',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondônia: 'RO',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

// Normalize any state input to standard 2-letter UF
export function normalizeStateToUf(stateStr: string): string {
  if (!stateStr) return 'SP';
  const clean = stateStr.trim().toUpperCase();
  if (BRAZILIAN_STATES.some((s) => s.uf === clean)) {
    return clean;
  }
  const lower = stateStr.trim().toLowerCase();
  return STATE_NAME_TO_UF[lower] || 'SP';
}

// Format CEP with standard 00000-000 mask
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Lookup address by Brazilian Postal Code (CEP) using ViaCEP with BrasilAPI fallback
 */
export async function lookupCep(rawCep: string): Promise<DetectedLocation> {
  const cleanCep = rawCep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    throw new Error('O CEP deve conter exatamente 8 dígitos numéricos.');
  }

  try {
    // 1st attempt: ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (response.ok) {
      const data = await response.json();
      if (!data.erro) {
        return {
          city: data.localidade || 'São Paulo',
          state: data.uf || 'SP',
          neighborhood: data.bairro || undefined,
          cep: formatCep(cleanCep),
          method: 'cep',
          accuracy: 'precise',
        };
      }
    }
  } catch (e) {
    // continue to fallback
  }

  // 2nd attempt: BrasilAPI fallback
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
    if (response.ok) {
      const data = await response.json();
      return {
        city: data.city || 'São Paulo',
        state: data.state || 'SP',
        neighborhood: data.neighborhood || undefined,
        cep: formatCep(cleanCep),
        method: 'cep',
        accuracy: 'precise',
      };
    }
  } catch (e) {
    // fall through
  }

  throw new Error('CEP não localizado nas bases oficiais. Verifique a digitação.');
}

/**
 * Detect user location using Browser GPS Geolocation API with reverse geocoding
 */
export async function detectLocationByGps(): Promise<DetectedLocation> {
  if (!navigator.geolocation) {
    throw new Error('Geolocalização não é suportada pelo seu navegador.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR,pt;q=0.9',
              },
            }
          );

          if (!res.ok) {
            throw new Error('Falha no serviço de mapas.');
          }

          const data = await res.json();
          const address = data.address || {};

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county ||
            'São Paulo';

          const stateRaw = address.state || 'SP';
          const stateUf = normalizeStateToUf(stateRaw);

          resolve({
            city,
            state: stateUf,
            stateName: address.state,
            neighborhood: address.suburb || address.neighbourhood,
            method: 'gps',
            accuracy: 'precise',
          });
        } catch (err: any) {
          reject(new Error('Não foi possível obter o endereço exato a partir das coordenadas.'));
        }
      },
      (err) => {
        let msg = 'Permissão de localização negada ou não disponível.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permissão de GPS negada no navegador.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Tempo limite esgotado ao buscar sinal de GPS.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Detect user location using IP geolocation (fast, requires no permissions)
 */
export async function detectLocationByIp(): Promise<DetectedLocation> {
  // First attempt backend proxy endpoint
  try {
    const res = await fetch('/api/detect-location');
    if (res.ok) {
      const data = await res.json();
      if (data && data.stateUf) {
        return {
          city: data.city || 'São Paulo',
          state: data.stateUf || 'SP',
          stateName: data.stateName,
          method: 'ip',
          accuracy: 'approximate',
        };
      }
    }
  } catch (e) {
    // continue to client fallbacks
  }

  // Client-side fallback to free IP APIs
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const stateUf = normalizeStateToUf(data.region_code || data.region || 'SP');
      return {
        city: data.city || 'São Paulo',
        state: stateUf,
        method: 'ip',
        accuracy: 'approximate',
      };
    }
  } catch (e) {
    // continue
  }

  // Second client-side fallback
  try {
    const res = await fetch('https://freeipapi.com/api/json');
    if (res.ok) {
      const data = await res.json();
      const stateUf = normalizeStateToUf(data.regionName || 'SP');
      return {
        city: data.cityName || 'São Paulo',
        state: stateUf,
        method: 'ip',
        accuracy: 'approximate',
      };
    }
  } catch (e) {
    // fallback
  }

  // Default fallback
  return {
    city: 'São Paulo',
    state: 'SP',
    method: 'ip',
    accuracy: 'approximate',
  };
}

/**
 * Best-effort detection: tries GPS if permission prompt allows, otherwise seamless IP
 */
export async function detectLocationBestEffort(): Promise<DetectedLocation> {
  try {
    // Check permission if browser supports Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      const perm = await navigator.permissions.query({ name: 'geolocation' as any });
      if (perm.state === 'granted') {
        return await detectLocationByGps();
      }
    }
  } catch (e) {
    // permissions query not supported or failed
  }

  // Try IP first for instant, non-blocking response without user prompt interruption
  try {
    const ipLoc = await detectLocationByIp();
    return ipLoc;
  } catch (e) {
    return {
      city: 'São Paulo',
      state: 'SP',
      method: 'manual',
      accuracy: 'approximate',
    };
  }
}
