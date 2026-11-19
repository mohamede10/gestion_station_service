export type InvoiceCategory = 
  | 'RECEPTION_CITERNE' 
  | 'VENTE_POMPE' 
  | 'VENTE_PRODUIT' 
  | 'BON_LIVRAISON_ABONNE' 
  | 'PAIEMENT_ABONNE' 
  | 'SALAIRE_BULLETIN' 
  | 'DEPENSE' 
  | 'VERSEMENT_BANCAIRE' 
  | 'JAUGEAGE_CUVE';

export interface GeneratedInvoiceMock {
  id: string;
  stationId: string;
  category: InvoiceCategory;
  categoryLabel: string;
  title: string;
  docNumber: string;
  stationName: string;
  timestamp: string;
  operatorName: string;
  amount?: number;
  fields: { label: string; value: string | number }[];
  notes?: string;
}

export interface StationMock {
  id: string;
  code: string;
  name: string;
  city: string;
}

export interface UserAccountMock {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'GERANT' | 'CHEF_PISTE' | 'CAISSIER';
  stationId: string | null; // null for Super Admin
  stationName: string | null;
}

// ─── UTILISATEURS ────────────────────────────────────────────────────────────
// Seul et unique compte Administrateur conservé pour démarrage à zéro
export const INITIAL_USERS: UserAccountMock[] = [
  {
    id: 'usr-admin',
    name: 'Administrateur',
    email: 'admin@totalenergies.gn',
    password: 'admin',
    role: 'SUPER_ADMIN',
    stationId: null,
    stationName: 'Supervision'
  }
];

// ─── TYPES CARBURANTS ────────────────────────────────────────────────────────
export type FuelType = 'ESSENCE' | 'GAZOIL' | 'SUPER';

export function formatFuelName(fuelType?: string | null): string {
  if (!fuelType) return 'Non défini';
  const upper = fuelType.toUpperCase();
  if (upper === 'SUPER' || upper === 'ESSENCE') return 'Essence';
  if (upper === 'GAZOIL') return 'Gazoil';
  return fuelType;
}

// ─── INTERFACES ──────────────────────────────────────────────────────────────

// Un pistolet est une sortie indépendante d'une pompe (index et carburant propres).
export type NozzleKey = 'P1' | 'P2';

export interface PumpNozzleMock {
  fuelType: FuelType;
  tankId: string;
  startIndex: number;
  endIndex: number;
  returnToTank: number;
  unitPrice: number;
}

export function createNozzle(fuelType: FuelType, tankId: string, unitPrice = 12000): PumpNozzleMock {
  return {
    fuelType,
    tankId,
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice
  };
}

export interface TankMock {
  id: string;
  stationId: string;
  code: string;
  fuelType: FuelType;
  capacity: number;
  initialStock: number;
  currentStock: number;
  physicalStock: number;
  lastDipstickDate: string;
  // Bascule / vanne : plusieurs cuves du même carburant alimentent un même
  // point de rencontre. Le technicien ouvre la vanne de la cuve active.
  valveStatus: 'OPEN' | 'CLOSED';
  basculeGroup: string;
  suppliesPumpIds: string[];
  // Télématique Ruptela Smart5 & Sondes Eurosens Dominator BT
  telematicsImei?: string;
  sensorBleMac?: string;
  sensorIndex?: number;
  sensorLiters?: number;
  sensorPercent?: number;
  sensorTemperature?: number;
  sensorBattery?: number;
  sensorRssi?: number;
  lastTelematicsUpdate?: string;
  telematicsStatus?: 'ONLINE' | 'OFFLINE' | 'ALERT_THEFT' | 'ALERT_LOW' | 'ALERT_DELIVERY';
}

export interface PumpMock {
  id: string;
  stationId: string;
  // Champs historiques (miroir du pistolet 1) conservés pour compatibilité.
  tankId: string;
  name: string;
  fuelType: FuelType;
  startIndex: number;
  endIndex: number;
  returnToTank: number;
  unitPrice: number;
  // Une pompe dessert toujours deux pistolets, avec des index indépendants.
  nozzle1: PumpNozzleMock;
  nozzle2: PumpNozzleMock;
}

export interface SubscriberMock {
  id: string;
  stationId: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  currentAdvance: number;
  currentCredit: number;
  lastPaymentDate?: string;
  // Volume initial crédité (les litres saisis à la création).
  creditLiters?: number;
}

export interface ProductMock {
  id: string;
  stationId: string;
  code: string;
  name: string;
  unitType: string;
  price: number;
  stock: number;
}

export interface PaymentMock {
  id: string;
  stationId: string;
  subscriberId?: string;
  subscriberName?: string;
  payerName: string;
  accountNumber: string;
  paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH';
  referenceNo: string;
  amount: number;
  notes: string;
  timestamp: string;
}

export interface ExpenseMock {
  id: string;
  stationId: string;
  category: 'EDG' | 'GROUPE_ELECTROGENE' | 'TELEPHONE_INTERNET' | 'TRANSPORT' | 'ENTRETIEN_REPARATIONS' | 'FOURNITURES' | 'DIVERS';
  amount: number;
  beneficiary: string;
  notes: string;
  timestamp: string;
}

export interface EmployeeMock {
  id: string;
  stationId: string;
  fullName: string;
  jobTitle: string;
  baseSalary: number;
  transportAllowance: number;
  livingAllowance: number;
  housingAllowance: number;
  prime: number;        // Prime exceptionnelle accordée par l'admin
  primeLabel: string;   // Libellé de la prime (ex: "Prime de rendement")
  shortages: number;
  loans: number;
  netSalary: number;
}

export interface FuelDeliveryMock {
  id: string;
  stationId: string;
  tankId: string;
  tankCode: string;
  fuelType: FuelType;
  deliveryNoteNumber: string;
  truckPlate: string;
  driverName: string;
  supplier: string;
  litersDelivered: number;
  operatorName: string;
  timestamp: string;
}

export interface FuelPumpShiftMock {
  id: string;
  stationId: string;
  pumpId: string;
  pumpName: string;
  fuelType: FuelType;
  startIndex: number;
  endIndex: number;
  returnToTank: number;
  litersSold: number;
  unitPrice: number;
  totalAmount: number;
  pompisteName: string;
  shiftType: 'MATIN' | 'SOIR' | 'NUIT';
  timestamp: string;
  // Pistolet utilisé et abonné crédité pendant la tournée (si applicable).
  nozzleKey?: NozzleKey;
  nozzleLabel?: string;
  subscriberId?: string;
  subscriberName?: string;
  creditedAmount?: number;
}

export interface CertifiedDocumentMock {
  id: string;
  docNumber: string;
  docType: 'RECETTE_POMPE' | 'JAUGEAGE_CUVE' | 'LIVRAISON_CARBURANT' | 'VERSEMENT_ABONNE' | 'SORTIE_CAISSE' | 'VENTE_LUBRIFIANT' | 'BULLETIN_PAIE' | 'FACTURE_ABONNE';
  stationId: string;
  stationName: string;
  title: string;
  operatorName: string;
  timestamp: string;
  fields: { label: string; value: string | number }[];
  notes?: string;
}

// ─── DONNÉES DE DÉPART ───────────────────────────────────────────────────────
// Aucune donnée de démonstration : la base Supabase est la seule source de vérité.
// Les stations sont créées depuis l'application avec les codes ST-001, ST-002, ...

export const INITIAL_STATIONS: StationMock[] = [];

export const INITIAL_TANKS: TankMock[] = [];

export const INITIAL_PUMPS: PumpMock[] = [];

export const INITIAL_SUBSCRIBERS: SubscriberMock[] = [];

export const INITIAL_PRODUCTS: ProductMock[] = [];

export const INITIAL_PAYMENTS: PaymentMock[] = [];

export const INITIAL_EXPENSES: ExpenseMock[] = [];

export const INITIAL_EMPLOYEES: EmployeeMock[] = [];

export const INITIAL_DELIVERIES: FuelDeliveryMock[] = [];

export const INITIAL_PUMP_SHIFTS: FuelPumpShiftMock[] = [];

export const INITIAL_INVOICES: GeneratedInvoiceMock[] = [];
