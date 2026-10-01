import {
  AccommodationType,
  AnsAgeBracket,
  Beneficiary,
  CalculatedPlanQuote,
  ContractType,
  CopayType,
  CoverageArea,
  HealthPlanDefinition,
  PlanPricingBreakdown,
  QuoteInput,
} from '../types/healthPlan';

/**
 * Returns the official ANS age bracket for a given age (0 to 120)
 */
export function getAnsAgeBracket(age: number): AnsAgeBracket {
  if (age < 0) return '00-18';
  if (age <= 18) return '00-18';
  if (age <= 23) return '19-23';
  if (age <= 28) return '24-28';
  if (age <= 33) return '29-33';
  if (age <= 38) return '34-38';
  if (age <= 43) return '39-43';
  if (age <= 48) return '44-48';
  if (age <= 53) return '49-53';
  if (age <= 58) return '54-58';
  return '59+';
}

/**
 * Returns human-readable label for ANS bracket
 */
export function getAnsAgeBracketLabel(bracket: AnsAgeBracket): string {
  switch (bracket) {
    case '00-18':
      return '00 a 18 anos';
    case '19-23':
      return '19 a 23 anos';
    case '24-28':
      return '24 a 28 anos';
    case '29-33':
      return '29 a 33 anos';
    case '34-38':
      return '34 a 38 anos';
    case '39-43':
      return '39 a 43 anos';
    case '44-48':
      return '44 a 48 anos';
    case '49-53':
      return '49 a 53 anos';
    case '54-58':
      return '54 a 58 anos';
    case '59+':
      return '59 anos ou mais';
  }
}

/**
 * Official ANS actuarial curve factor relative to the base 00-18 bracket.
 * Strictly adheres to ANS normative rules:
 * - 59+ bracket must not exceed 6.0x the 00-18 bracket.
 * - Variation between brackets 7 and 10 cannot exceed variation between brackets 1 and 7.
 */
export const ANS_BRACKET_FACTORS: Record<AnsAgeBracket, number> = {
  '00-18': 1.0,
  '19-23': 1.15,
  '24-28': 1.32,
  '29-33': 1.55,
  '34-38': 1.82,
  '39-43': 2.22,
  '44-48': 2.8,
  '49-53': 3.55,
  '54-58': 4.45,
  '59+': 5.85,
};

/**
 * Multiplier for contract modality (Individual vs CNPJ/PME vs Adesão)
 */
export function getContractTypeMultiplier(
  contractType: ContractType,
  livesCount: number
): number {
  switch (contractType) {
    case 'individual':
      // Pessoa Física benchmark tabela pública cheia
      return 1.0;
    case 'adesao':
      // Coletivo por Adesão (entidades de classe, sindicatos, associações)
      return 0.82;
    case 'empresarial':
      // Coletivo Empresarial (MEI, PME, Grandes Empresas)
      if (livesCount >= 30) return 0.6; // ~40% economia
      if (livesCount >= 6) return 0.66; // ~34% economia
      if (livesCount >= 2) return 0.7; // ~30% economia (PME padrão)
      return 0.75; // MEI 1 vida (~25% economia)
  }
}

/**
 * Multiplier for Coparticipation
 * Plans with copay reduce monthly premiums by 20% to 26%
 */
export function getCopayMultiplier(copay: CopayType): number {
  return copay === 'com_coparticipacao' ? 0.76 : 1.0;
}

/**
 * Multiplier for Accommodation
 * Apartment (private room) is usually 20% to 24% higher than infirmary (shared room)
 */
export function getAccommodationMultiplier(accommodation: AccommodationType): number {
  return accommodation === 'apartamento' ? 1.22 : 1.0;
}

/**
 * Multiplier for Coverage Area
 */
export function getCoverageAreaMultiplier(area: CoverageArea): number {
  switch (area) {
    case 'regional':
      return 0.9;
    case 'estadual':
      return 1.0;
    case 'nacional':
      return 1.25;
  }
}

/**
 * Regional price adjustment factor by Brazilian State / UF
 * Reflects regional healthcare operational costs and hospital table indices
 */
export function getStateFactor(stateUf: string): number {
  switch (stateUf) {
    case 'SP':
      return 1.08;
    case 'RJ':
      return 1.05;
    case 'DF':
      return 1.06;
    case 'MG':
      return 0.98;
    case 'RS':
    case 'PR':
    case 'SC':
      return 0.96;
    case 'BA':
    case 'PE':
    case 'CE':
      return 0.94;
    default:
      return 0.95;
  }
}

/**
 * Calculates a complete health plan quotation for a single plan definition
 * based on user input parameters and multi-factor conditional logic.
 */
export function calculateSinglePlanQuote(
  plan: HealthPlanDefinition,
  input: QuoteInput
): CalculatedPlanQuote {
  const livesCount = input.beneficiaries.length;
  const contractMultiplier = getContractTypeMultiplier(input.contractType, livesCount);
  const copayMultiplier = getCopayMultiplier(input.copay);
  const accommodationMultiplier = getAccommodationMultiplier(input.accommodation);
  const stateMultiplier = getStateFactor(input.state);

  // Geographic factor: if user specifically requested national coverage, adjust
  const coverageMultiplier =
    input.coverageArea === 'nacional' && plan.coverageArea === 'nacional'
      ? 1.0
      : plan.coverageArea === 'regional'
      ? 0.92
      : 1.05;

  let totalMonthlyPrice = 0;
  let individualBaselineTotal = 0;

  const perBeneficiaryBreakdown: PlanPricingBreakdown[] = input.beneficiaries.map((beneficiary) => {
    const bracket = getAnsAgeBracket(beneficiary.age);
    const bracketFactor = ANS_BRACKET_FACTORS[bracket];

    // Base price without discount (individual, no copay, infirmary)
    const rawIndividualPrice = plan.baseIndex0to18 * bracketFactor * stateMultiplier;

    // Calculated price applying all user conditions
    const finalPrice =
      rawIndividualPrice *
      contractMultiplier *
      copayMultiplier *
      accommodationMultiplier *
      coverageMultiplier;

    const roundedPrice = Math.round(finalPrice);
    totalMonthlyPrice += roundedPrice;
    individualBaselineTotal += Math.round(rawIndividualPrice * accommodationMultiplier);

    return {
      beneficiaryId: beneficiary.id,
      beneficiaryName: beneficiary.name || 'Beneficiário',
      relationship: beneficiary.relationship,
      age: beneficiary.age,
      ageBracket: bracket,
      basePrice: Math.round(rawIndividualPrice),
      calculatedPrice: roundedPrice,
    };
  });

  // Calculate market price range (Min and Max standard market dispersion)
  const priceRangeMin = Math.round(totalMonthlyPrice * 0.94);
  const priceRangeMax = Math.round(totalMonthlyPrice * 1.08);

  // Calculate savings vs pure individual contract without copay
  const savingsVsIndividual = Math.max(0, individualBaselineTotal - totalMonthlyPrice);

  return {
    planId: plan.id,
    planName: plan.name,
    operatorId: plan.operatorId,
    operatorName: plan.operatorName,
    operatorLogoText: plan.operatorName.split(' ')[0],
    operatorColor: plan.operatorColor,
    ansRegister: plan.ansRegister,
    ansScore: plan.ansScore,
    segmentation: 'Ambulatorial + Hospitalar com Obstetrícia',
    accommodation: input.accommodation,
    copay: input.copay,
    coverageArea: plan.coverageArea,
    reimbursementConsultation: plan.reimbursementConsultation,
    emergencyWaitHours: 24,
    consultationWaitDays: 30,
    examWaitDays: 60,
    surgeryWaitDays: 180,
    maternityWaitDays: 300,
    preExistingWaitMonths: 24,
    hospitals: plan.hospitals,
    keyHighlights: plan.highlights,
    telemedicine: plan.telemedicine,
    travelInsurance: plan.travelInsurance,
    totalMonthlyPrice,
    priceRangeMin,
    priceRangeMax,
    perBeneficiaryBreakdown,
    savingsVsIndividual: savingsVsIndividual > 20 ? savingsVsIndividual : undefined,
  };
}

/**
 * Filter and rank all plans in database according to user quote input
 */
export function calculateAllPlanQuotes(
  allPlans: HealthPlanDefinition[],
  input: QuoteInput
): CalculatedPlanQuote[] {
  // Filter compatible plans
  const compatiblePlans = allPlans.filter((plan) => {
    // Check if plan serves this UF
    if (!plan.regions.includes(input.state)) {
      return false;
    }

    // Check if contract type is available for this plan
    if (!plan.availableContracts.includes(input.contractType)) {
      return false;
    }

    // If user filtered by specific operator
    if (input.operatorFilter && input.operatorFilter !== 'all' && plan.operatorId !== input.operatorFilter) {
      return false;
    }

    // If user requested specific hospital filter, verify coverage
    if (input.selectedHospitals && input.selectedHospitals.length > 0) {
      const hasSelectedHospital = input.selectedHospitals.some((h) =>
        plan.hospitals.some((ph) => ph.toLowerCase().includes(h.toLowerCase()))
      );
      if (!hasSelectedHospital) return false;
    }

    return true;
  });

  // Calculate pricing for each compatible plan
  const quotes = compatiblePlans.map((plan) => calculateSinglePlanQuote(plan, input));

  // If budget filter is active
  if (input.maxMonthlyBudget && input.maxMonthlyBudget > 0) {
    return quotes
      .filter((q) => q.totalMonthlyPrice <= input.maxMonthlyBudget!)
      .sort((a, b) => a.totalMonthlyPrice - b.totalMonthlyPrice);
  }

  // Default sorting: Best ANS score and value balance
  return quotes.sort((a, b) => a.totalMonthlyPrice - b.totalMonthlyPrice);
}

/**
 * Estimated tax deductibility on IRPF (Imposto de Renda da Pessoa Física)
 * Brazil allows 100% deduction of health expenses without ceiling limit!
 */
export function calculateEstimatedTaxSavings(annualHealthSpending: number, taxBracketPercent: number = 27.5): number {
  return Math.round(annualHealthSpending * (taxBracketPercent / 100));
}
