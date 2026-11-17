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
  tankId: string;
  name: string;
  fuelType: FuelType;
  startIndex: number;
  endIndex: number;
  returnToTank: number;
  unitPrice: number;
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

// ─── DONNÉES DE DÉPART (RÉFÉRENCE OFFICIELLE TOTALENERGIES) ──────────────────

export const INITIAL_STATIONS: StationMock[] = [
  {
    id: 'stat-kissosso-001',
    code: 'KISSOSSO',
    name: 'TotalEnergies Kissosso',
    city: 'Conakry'
  },
  {
    id: 'stat-matoto-002',
    code: 'MATOTO',
    name: 'TotalEnergies Matoto',
    city: 'Conakry'
  },
  {
    id: 'stat-bellevue-003',
    code: 'BELLEVUE',
    name: 'TotalEnergies Belle-Vue',
    city: 'Conakry'
  }
];

export const INITIAL_TANKS: TankMock[] = [
  {
    id: 'tank-super-01',
    stationId: 'stat-kissosso-001',
    code: 'CUVE-01',
    fuelType: 'ESSENCE',
    capacity: 50000,
    initialStock: 0,
    currentStock: 0,
    physicalStock: 0,
    sensorLiters: 0,
    sensorPercent: 0,
    sensorTemperature: 28.5,
    sensorBattery: 98,
    sensorRssi: -64,
    telematicsImei: '865421098765432',
    sensorBleMac: 'C3:45:12:89:FE:A1',
    sensorIndex: 1,
    lastTelematicsUpdate: new Date().toISOString(),
    telematicsStatus: 'ONLINE',
    lastDipstickDate: new Date().toISOString().substring(0, 16)
  },
  {
    id: 'tank-gazoil-02',
    stationId: 'stat-kissosso-001',
    code: 'CUVE-02',
    fuelType: 'GAZOIL',
    capacity: 60000,
    initialStock: 0,
    currentStock: 0,
    physicalStock: 0,
    sensorLiters: 0,
    sensorPercent: 0,
    sensorTemperature: 27.8,
    sensorBattery: 99,
    sensorRssi: -62,
    telematicsImei: '865421098765432',
    sensorBleMac: 'C3:45:12:89:FE:B2',
    sensorIndex: 2,
    lastTelematicsUpdate: new Date().toISOString(),
    telematicsStatus: 'ONLINE',
    lastDipstickDate: new Date().toISOString().substring(0, 16)
  }
];

export const INITIAL_PUMPS: PumpMock[] = [
  {
    id: 'pump-01',
    stationId: 'stat-kissosso-001',
    tankId: 'tank-super-01',
    name: 'Pompe 1 - Essence',
    fuelType: 'ESSENCE',
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice: 12000
  },
  {
    id: 'pump-02',
    stationId: 'stat-kissosso-001',
    tankId: 'tank-super-01',
    name: 'Pompe 2 - Essence',
    fuelType: 'ESSENCE',
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice: 12000
  },
  {
    id: 'pump-03',
    stationId: 'stat-kissosso-001',
    tankId: 'tank-gazoil-02',
    name: 'Pompe 3 - Gazoil',
    fuelType: 'GAZOIL',
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice: 12000
  },
  {
    id: 'pump-04',
    stationId: 'stat-kissosso-001',
    tankId: 'tank-gazoil-02',
    name: 'Pompe 4 - Gazoil',
    fuelType: 'GAZOIL',
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice: 12000
  }
];

export const INITIAL_SUBSCRIBERS: SubscriberMock[] = [
  {
    id: 'sub-01',
    stationId: 'stat-kissosso-001',
    code: 'ABN-BTP-01',
    name: 'Guinée BTP & Carrières SA',
    phone: '+224 622 10 20 30',
    address: 'Zone Industrielle Matoto, Conakry',
    currentAdvance: 0,
    currentCredit: 0,
    lastPaymentDate: new Date().toISOString().substring(0, 10)
  },
  {
    id: 'sub-02',
    stationId: 'stat-kissosso-001',
    code: 'ABN-LOG-02',
    name: 'Express Transport Guinée',
    phone: '+224 628 44 55 66',
    address: 'Kissosso Carrefour, Conakry',
    currentAdvance: 0,
    currentCredit: 0,
    lastPaymentDate: new Date().toISOString().substring(0, 10)
  }
];

export const INITIAL_PRODUCTS: ProductMock[] = [
  {
    id: 'prod-01',
    stationId: 'stat-kissosso-001',
    code: 'RUBIA-7400-5L',
    name: 'Total Quartz / Rubia TIR 7400 15W40 (5L)',
    unitType: 'BIDON',
    price: 285000,
    stock: 0
  },
  {
    id: 'prod-02',
    stationId: 'stat-kissosso-001',
    code: 'QUARTZ-9000-5L',
    name: 'Total Quartz 9000 5W40 Synthétique (5L)',
    unitType: 'BIDON',
    price: 460000,
    stock: 0
  },
  {
    id: 'prod-03',
    stationId: 'stat-kissosso-001',
    code: 'GAZ-B6',
    name: 'Bouteille Gaz TotalGaz 6kg (Recharge)',
    unitType: 'UNITE',
    price: 65000,
    stock: 0
  },
  {
    id: 'prod-04',
    stationId: 'stat-kissosso-001',
    code: 'GAZ-B12',
    name: 'Bouteille Gaz TotalGaz 12.5kg (Recharge)',
    unitType: 'UNITE',
    price: 130000,
    stock: 0
  }
];

export const INITIAL_PAYMENTS: PaymentMock[] = [];

export const INITIAL_EXPENSES: ExpenseMock[] = [];

export const INITIAL_EMPLOYEES: EmployeeMock[] = [
  {
    id: 'emp-01',
    stationId: 'stat-kissosso-001',
    fullName: 'Sidiki Souaré',
    jobTitle: 'Gérant Station',
    baseSalary: 4500000,
    transportAllowance: 500000,
    livingAllowance: 300000,
    housingAllowance: 700000,
    prime: 0,
    primeLabel: '',
    shortages: 0,
    loans: 0,
    netSalary: 6000000
  },
  {
    id: 'emp-02',
    stationId: 'stat-kissosso-001',
    fullName: 'Mamadou Baïlo',
    jobTitle: 'Chef de Piste',
    baseSalary: 3000000,
    transportAllowance: 400000,
    livingAllowance: 200000,
    housingAllowance: 400000,
    prime: 0,
    primeLabel: '',
    shortages: 0,
    loans: 0,
    netSalary: 4000000
  },
  {
    id: 'emp-03',
    stationId: 'stat-kissosso-001',
    fullName: 'Laye Souaré',
    jobTitle: 'Pompiste Senior',
    baseSalary: 2200000,
    transportAllowance: 300000,
    livingAllowance: 150000,
    housingAllowance: 250000,
    prime: 0,
    primeLabel: '',
    shortages: 0,
    loans: 0,
    netSalary: 2900000
  }
];

export const INITIAL_DELIVERIES: FuelDeliveryMock[] = [];

export const INITIAL_PUMP_SHIFTS: FuelPumpShiftMock[] = [];

export const INITIAL_INVOICES: GeneratedInvoiceMock[] = [];
