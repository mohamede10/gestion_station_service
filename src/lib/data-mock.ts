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
// Garde uniquement le compte admin pour la connexion initiale
export const INITIAL_USERS: UserAccountMock[] = [
  {
    id: 'usr-superadmin',
    name: 'Alassane Camara',
    email: 'superadmin@totalenergies.gn',
    password: 'admin',
    role: 'SUPER_ADMIN',
    stationId: null,
    stationName: 'Supervision Réseau'
  },
  {
    id: 'usr-super',
    name: 'Administrateur Général',
    email: 'admin@totalenergies.gn',
    password: 'admin',
    role: 'SUPER_ADMIN',
    stationId: null,
    stationName: 'Supervision Réseau'
  },
  {
    id: 'usr-gerant-kissosso',
    name: 'Sidiki Souaré (Gérant)',
    email: 'gerant.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'GERANT',
    stationId: 'stat-kissosso-001',
    stationName: 'TotalEnergies Kissosso'
  },
  {
    id: 'usr-chefpiste-kissosso',
    name: 'Mamadou Baïlo (Chef de Piste)',
    email: 'chefpiste.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'CHEF_PISTE',
    stationId: 'stat-kissosso-001',
    stationName: 'TotalEnergies Kissosso'
  },
  {
    id: 'usr-caissier-kissosso',
    name: 'Aïssatou Camara (Caissière)',
    email: 'caissier.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'CAISSIER',
    stationId: 'stat-kissosso-001',
    stationName: 'TotalEnergies Kissosso'
  },
];

// ─── INTERFACES ──────────────────────────────────────────────────────────────

export interface TankMock {
  id: string;
  stationId: string;
  code: string;
  fuelType: 'SUPER' | 'GAZOIL';
  capacity: number;
  initialStock: number;
  currentStock: number;
  physicalStock: number;
  lastDipstickDate: string;
}

export interface PumpMock {
  id: string;
  stationId: string;
  tankId: string;
  name: string;
  fuelType: 'SUPER' | 'GAZOIL';
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
  shortages: number;
  loans: number;
  netSalary: number;
}

export interface FuelDeliveryMock {
  id: string;
  stationId: string;
  tankId: string;
  tankCode: string;
  fuelType: 'SUPER' | 'GAZOIL';
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
  fuelType: 'SUPER' | 'GAZOIL';
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

// ─── DONNÉES INITIALES — TOUTES VIDES ────────────────────────────────────────

export const INITIAL_STATIONS: StationMock[] = [
  { id: 'st-kissosso', code: 'ST-KISSOSSO', name: 'TotalEnergies Kissosso', city: 'Conakry (Kissosso)' },
];

export const INITIAL_TANKS: TankMock[] = [];

export const INITIAL_PUMPS: PumpMock[] = [];

export const INITIAL_SUBSCRIBERS: SubscriberMock[] = [];

export const INITIAL_PRODUCTS: ProductMock[] = [];

export const INITIAL_PAYMENTS: PaymentMock[] = [];

export const INITIAL_EXPENSES: ExpenseMock[] = [];

export const INITIAL_EMPLOYEES: EmployeeMock[] = [];

export const INITIAL_DELIVERIES: FuelDeliveryMock[] = [];

export const INITIAL_PUMP_SHIFTS: FuelPumpShiftMock[] = [];
