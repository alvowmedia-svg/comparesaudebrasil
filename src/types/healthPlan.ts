export type ContractType = 'individual' | 'empresarial' | 'adesao';

export type AccommodationType = 'enfermaria' | 'apartamento';

export type CopayType = 'com_coparticipacao' | 'sem_coparticipacao';

export type CoverageArea = 'regional' | 'estadual' | 'nacional';

export type AnsAgeBracket =
  | '00-18'
  | '19-23'
  | '24-28'
  | '29-33'
  | '34-38'
  | '39-43'
  | '44-48'
  | '49-53'
  | '54-58'
  | '59+';

export interface Beneficiary {
  id: string;
  name: string;
  relationship: 'titular' | 'conjuge' | 'filho' | 'pais' | 'outro';
  age: number;
  ageBracket: AnsAgeBracket;
}

export interface DetectedLocation {
  city: string;
  state: string; // UF ex: 'SP', 'RJ'
  stateName?: string;
  neighborhood?: string;
  cep?: string;
  method: 'gps' | 'ip' | 'cep' | 'manual';
  accuracy?: 'precise' | 'approximate';
}

export interface QuoteInput {
  contractType: ContractType;
  cnpjLivesCount?: number;
  state: string;
  city: string;
  cep?: string;
  detectedLocation?: DetectedLocation;
  accommodation: AccommodationType;
  copay: CopayType;
  coverageArea: CoverageArea;
  beneficiaries: Beneficiary[];
  selectedHospitals?: string[];
  maxMonthlyBudget?: number;
  operatorFilter?: string;
}

export interface ReferenceHospital {
  name: string;
  city: string;
  state: string;
  tier: 'excelencia' | 'referencia' | 'regional';
}

export interface PlanPricingBreakdown {
  beneficiaryId: string;
  beneficiaryName: string;
  relationship: string;
  age: number;
  ageBracket: AnsAgeBracket;
  basePrice: number;
  calculatedPrice: number;
}

export interface CalculatedPlanQuote {
  planId: string;
  planName: string;
  operatorId: string;
  operatorName: string;
  operatorLogoText: string;
  operatorColor: string;
  ansRegister: string;
  ansScore: number; // IDSS 0.00 to 1.00
  segmentation: string; // Ex: Ambulatorial + Hospitalar com Obstetrícia
  accommodation: AccommodationType;
  copay: CopayType;
  coverageArea: CoverageArea;
  reimbursementConsultation: number; // R$
  emergencyWaitHours: number; // 24h
  consultationWaitDays: number; // 30d
  examWaitDays: number; // 30-90d
  surgeryWaitDays: number; // 180d
  maternityWaitDays: number; // 300d
  preExistingWaitMonths: number; // 24m (CPT)
  hospitals: string[];
  keyHighlights: string[];
  telemedicine: boolean;
  travelInsurance: boolean;
  totalMonthlyPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  perBeneficiaryBreakdown: PlanPricingBreakdown[];
  savingsVsIndividual?: number; // Economia estimada se empresarial/coparticipação
}

export interface HealthPlanDefinition {
  id: string;
  name: string;
  operatorId: string;
  operatorName: string;
  operatorColor: string;
  ansRegister: string;
  ansScore: number;
  availableContracts: ContractType[];
  availableAccommodations: AccommodationType[];
  availableCopay: CopayType[];
  coverageArea: CoverageArea;
  tier: 'economico' | 'intermediario' | 'executivo' | 'premium';
  baseIndex0to18: number; // R$ base mensal para faixa 0-18 individual enfermaria
  reimbursementConsultation: number;
  hospitals: string[];
  highlights: string[];
  telemedicine: boolean;
  travelInsurance: boolean;
  regions: string[]; // UFs supported
}
