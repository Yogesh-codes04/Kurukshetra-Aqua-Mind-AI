export type ScreenId =
  | 'overview'
  | 'facilities'
  | 'water-budget'
  | 'forecasts'
  | 'ai-insights'
  | 'reports'
  | 'settings'
  | 'profile';

export * from './profile';

export type UserRole = 'admin' | 'viewer';

export type FacilityPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Facility {
  id: string;
  name: string;
  type: string;
  demandLiters: number; // Daily water demand in L/day
  minLiters: number; // Minimum required water in L/day
  priority: FacilityPriority;
  peopleServed: number; // Number of people served
  notes?: string;
}

export interface SocietyPreset {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  units: number;
  population: number;
  dailySupplyLiters: number;
  reservoirCapacityLiters: number;
  currentStoredLiters: number;
  incomingSupplyLiters: number;
  facilities: Facility[];
}

export interface WaterAvailability {
  dailySupplyLiters: number; // Available water supply in L/day
  reservoirCapacityLiters: number; // Reservoir/tank capacity in Litres
  currentStoredLiters: number; // Current stored water in Litres
  incomingSupplyLiters: number; // Expected incoming water supply in L/day
  planningPeriodDays: number; // Planning period in days
  expectedShortageDurationDays: number; // Expected shortage duration in days
}

export type ScarcityScenarioId = 'normal' | 'moderate' | 'severe' | 'critical' | 'custom';

export interface ScarcityScenario {
  id: ScarcityScenarioId;
  name: string;
  badge: string;
  supplyLiters: number;
  incomingSupplyLiters: number;
  currentStoredLiters: number;
  reservoirCapacityLiters: number;
  assumptions: string;
  severityColor: string;
}

export type AllocationStatus =
  | 'fully_met'
  | 'partially_met'
  | 'minimum_only'
  | 'critical_deficit'
  | 'zero_allocation';

export interface FacilityAllocation {
  facilityId: string;
  facilityName: string;
  type: string;
  priority: FacilityPriority;
  demandLiters: number;
  minLiters: number;
  allocatedLiters: number;
  unmetLiters: number;
  shortagePercentage: number;
  fulfilledPercentage: number;
  minMet: boolean;
  minDeficitLiters: number;
  peopleProtected: number;
  status: AllocationStatus;
  reason: string;
}

export interface SimulationResult {
  availableSupply: number;
  totalDemand: number;
  totalAllocated: number;
  remainingReserve: number;
  totalUnmetDemand: number;
  criticalDeficitCount: number;
  criticalUnmetLiters: number;
  allMinimumsMet: boolean;
  facilityAllocations: FacilityAllocation[];
  explanation: string;
  stepExplanations: string[];
  tradeOffNotes: string[];
  timestamp: string;
  isSimulatedEstimate: true;
}

export interface MeterReadingRecord {
  id: string;
  zone: string;
  meterId: string;
  volume: number;
  readingDate: string;
  source: 'manual' | 'sensor';
  readingType: string;
  technicianNotes?: string;
  recordedAt: string;
}

export interface SectorAllocation {
  id: string;
  name: string;
  category: string;
  allocated: number; // liters/day
  minBaseline?: number;
  maxCap?: number;
  percentage: number;
  description: string;
  isLocked?: boolean;
  notes?: string;
  complianceRule?: string;
}

export interface BudgetState {
  totalAvailable: number; // 100,000 L/day
  residential: number; // 52,000
  commercial: number; // 20,000
  facilities: number; // 12,000
  landscaping: number; // 7,500
  reserveLocked: number; // 10,000
  activePreset: 'standard' | 'conservation' | 'custom';
}

export interface ForecastPoint {
  date: string;
  label: string;
  actual?: number;
  forecast?: number;
  baseline: number; // 100,000 L
  ciLower?: number;
  ciUpper?: number;
  weatherTemp?: number;
  isPeak?: boolean;
  isBreach?: boolean;
}

export interface HistoricalReportPoint {
  day: number;
  dateStr: string;
  actual: number;
  budgetCeiling: number; // 100,000 L
  baseline30d: number; // 76,500 L
  isSpike?: boolean;
  spikeReason?: string;
}

export interface AlertItem {
  id: string;
  code: string;
  severity: 'critical' | 'warning' | 'budget_exceeded' | 'info';
  categoryLabel: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  impactVolume: number;
  impactUnit: string;
  breachWindow: string;
  confidence: number;
  status: 'active' | 'acknowledged' | 'resolved';
  shapDrivers: Array<{
    name: string;
    impactLiters: number;
    percentage: number;
    icon: string;
    description: string;
  }>;
  prescribedMitigations: Array<{
    id: string;
    title: string;
    impactLiters: number;
    impactPercentage: number;
    description: string;
    isDefaultSelected: boolean;
  }>;
  regulatoryNotice?: string;
}

export interface MeterLedgerRow {
  id: string;
  substation: string;
  zoneName: string;
  meterArchitecture: string;
  allocatedQuota: number;
  recordedUsage: number;
  adherenceDelta: number;
  percentageDelta: number;
  complianceStatus: 'compliant' | 'over_quota' | 'protected';
}

export interface CommunityProfile {
  id: string;
  name: string;
  phase: string;
  units: number;
  population: number;
  commercialNodes: number;
  parklandHectares: number;
  authority: string;
  officerName: string;
  emergencyPhone: string;
  dailyYieldCap: number;
  emergencyReserveFloor: number;
  perCapitaBaseline: number;
  heatAdvisoryMultiplier: number;
}
