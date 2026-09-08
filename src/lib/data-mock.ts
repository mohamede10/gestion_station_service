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

export const INITIAL_USERS: UserAccountMock[] = [
  {
    id: 'usr-super',
    name: 'M. Diallo (Directeur Réseau)',
    email: 'superadmin@totalenergies.gn',
    password: 'admin',
    role: 'SUPER_ADMIN',
    stationId: null,
    stationName: 'Supervision Réseau National'
  },
  {
    id: 'usr-gerant-kiss',
    name: 'Sidiki Souaré (Gérant)',
    email: 'gerant.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'GERANT',
    stationId: 'st-kissosso',
    stationName: 'TotalEnergies Kissosso'
  },
  {
    id: 'usr-gerant-matam',
    name: 'Amadou Baldé (Gérant)',
    email: 'gerant.matam@totalenergies.gn',
    password: 'admin',
    role: 'GERANT',
    stationId: 'st-matam',
    stationName: 'TotalEnergies Matam'
  },
  {
    id: 'usr-cdp-kiss',
    name: 'Mory Diawara (Chef de Piste)',
    email: 'cdp.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'CHEF_PISTE',
    stationId: 'st-kissosso',
    stationName: 'TotalEnergies Kissosso'
  },
  {
    id: 'usr-caisse-kiss',
    name: 'Mariama Camara (Caissière)',
    email: 'caisse.kissosso@totalenergies.gn',
    password: 'admin',
    role: 'CAISSIER',
    stationId: 'st-kissosso',
    stationName: 'TotalEnergies Kissosso'
  }
];


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
  payerName: string;       // MANDATORY: Nom du déposant / payeur
  accountNumber: string;   // MANDATORY: N° de compte bancaire ou Mobile Money
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

export const INITIAL_STATIONS: StationMock[] = [
  { id: 'st-kissosso', code: 'ST-KISSOSSO', name: 'TotalEnergies Kissosso', city: 'Conakry (Kissosso)' },
  { id: 'st-matam', code: 'ST-MATAM', name: 'TotalEnergies Matam', city: 'Conakry (Matam)' },
  { id: 'st-kindia', code: 'ST-KINDIA', name: 'TotalEnergies Kindia Centre', city: 'Kindia' },
];

export const INITIAL_TANKS: TankMock[] = [
  { id: 'tk-super-kiss', stationId: 'st-kissosso', code: 'CUVE 01 - SUPER', fuelType: 'SUPER', capacity: 45000, initialStock: 12000, currentStock: 28500, physicalStock: 28350, lastDipstickDate: '2026-09-06 18:00' },
  { id: 'tk-gazoil-kiss', stationId: 'st-kissosso', code: 'CUVE 02 - GAZOIL', fuelType: 'GAZOIL', capacity: 45000, initialStock: 15000, currentStock: 31200, physicalStock: 31100, lastDipstickDate: '2026-09-06 18:00' },
  
  { id: 'tk-super-matam', stationId: 'st-matam', code: 'CUVE 01 - SUPER', fuelType: 'SUPER', capacity: 30000, initialStock: 8000, currentStock: 18200, physicalStock: 18200, lastDipstickDate: '2026-09-06 17:30' },
  { id: 'tk-gazoil-matam', stationId: 'st-matam', code: 'CUVE 02 - GAZOIL', fuelType: 'GAZOIL', capacity: 30000, initialStock: 9000, currentStock: 22100, physicalStock: 22050, lastDipstickDate: '2026-09-06 17:30' },
];

export const INITIAL_PUMPS: PumpMock[] = [
  { id: 'p1', stationId: 'st-kissosso', tankId: 'tk-super-kiss', name: 'Pompe 01 (Super)', fuelType: 'SUPER', startIndex: 145200, endIndex: 147800, returnToTank: 20, unitPrice: 12000 },
  { id: 'p2', stationId: 'st-kissosso', tankId: 'tk-super-kiss', name: 'Pompe 02 (Super)', fuelType: 'SUPER', startIndex: 98400, endIndex: 100500, returnToTank: 10, unitPrice: 12000 },
  { id: 'p3', stationId: 'st-kissosso', tankId: 'tk-gazoil-kiss', name: 'Pompe 03 (Gazoil)', fuelType: 'GAZOIL', startIndex: 210500, endIndex: 213900, returnToTank: 30, unitPrice: 12000 },
  { id: 'p4', stationId: 'st-kissosso', tankId: 'tk-gazoil-kiss', name: 'Pompe 04 (Gazoil)', fuelType: 'GAZOIL', startIndex: 185100, endIndex: 188300, returnToTank: 15, unitPrice: 12000 },
];

export const INITIAL_SUBSCRIBERS: SubscriberMock[] = [
  { id: 'sub-1', stationId: 'st-kissosso', code: 'ABON-001', name: 'SEKOU CAMARA', phone: '+224 621 44 55 66', address: 'Kissosso Piste', currentAdvance: 2000000, currentCredit: 11584000, lastPaymentDate: '2026-09-02' },
  { id: 'sub-2', stationId: 'st-kissosso', code: 'ABON-002', name: 'SOCIETE TRANSKONIA', phone: '+224 664 12 34 56', address: 'Matoto', currentAdvance: 5000000, currentCredit: 30120000, lastPaymentDate: '2026-09-01' },
  { id: 'sub-3', stationId: 'st-kissosso', code: 'ABON-003', name: 'BEGEC BTP', phone: '+224 622 99 88 77', address: 'Kipé', currentAdvance: 10000000, currentCredit: 4530000, lastPaymentDate: '2026-09-03' },
  { id: 'sub-4', stationId: 'st-kissosso', code: 'ABON-004', name: 'GROUPE UHODA', phone: '+224 628 33 22 11', address: 'Kaloum', currentAdvance: 0, currentCredit: 10800000, lastPaymentDate: '2026-08-28' },
  { id: 'sub-5', stationId: 'st-kissosso', code: 'ABON-005', name: 'SOUMAH TRANSPORT', phone: '+224 669 00 11 22', address: 'Dabompa', currentAdvance: 500000, currentCredit: 655000, lastPaymentDate: '2026-08-30' },
];

export const INITIAL_PRODUCTS: ProductMock[] = [
  { id: 'prd-1', stationId: 'st-kissosso', code: 'LUB-01', name: 'QUARTZ 9000 B5', unitType: 'BIDON 5L', price: 395500, stock: 45 },
  { id: 'prd-2', stationId: 'st-kissosso', code: 'LUB-02', name: 'QUARTZ 7000 B4', unitType: 'BIDON 4L', price: 325500, stock: 60 },
  { id: 'prd-3', stationId: 'st-kissosso', code: 'LUB-03', name: 'RUBIA S50 B5', unitType: 'BIDON 5L', price: 250500, stock: 32 },
  { id: 'prd-4', stationId: 'st-kissosso', code: 'GAZ-01', name: 'BOUTEILLE GAZ 12KG', unitType: 'BOUTEILLE', price: 125000, stock: 24 },
  { id: 'prd-5', stationId: 'st-kissosso', code: 'GAZ-02', name: 'BOUTEILLE GAZ 6KG', unitType: 'BOUTEILLE', price: 60000, stock: 35 },
  { id: 'prd-6', stationId: 'st-kissosso', code: 'LUB-04', name: 'MOTOR OIL VRAC (FUT)', unitType: 'FUT 200L', price: 38000, stock: 4 },
];

export const INITIAL_PAYMENTS: PaymentMock[] = [
  { id: 'pay-1', stationId: 'st-kissosso', subscriberId: 'sub-3', subscriberName: 'BEGEC BTP', payerName: 'Mory Keita (Comptable BEGEC)', accountNumber: 'GN012 00100 00458912301 44', paymentMethod: 'BANK_TRANSFER', referenceNo: 'VIR-2026-0903', amount: 4530000, notes: 'Règlement partiel facture août', timestamp: '2026-09-03 14:22' },
  { id: 'pay-2', stationId: 'st-kissosso', subscriberId: 'sub-1', subscriberName: 'SEKOU CAMARA', payerName: 'Sékou Camara', accountNumber: '+224 621 44 55 66 (Orange Money)', paymentMethod: 'MOBILE_MONEY', referenceNo: 'OM-88492019', amount: 2000000, notes: 'Acompte approvisionnement flotte', timestamp: '2026-09-02 10:15' },
  { id: 'pay-3', stationId: 'st-kissosso', subscriberId: 'sub-2', subscriberName: 'SOCIETE TRANSKONIA', payerName: 'Ibrahima Diallo (Directeur Financier)', accountNumber: 'ECOBANK-GN-9901428', paymentMethod: 'CHECK', referenceNo: 'CHQ-554091', amount: 15000000, notes: 'Acompte carburant mensuel', timestamp: '2026-09-01 16:45' },
];

export const INITIAL_EXPENSES: ExpenseMock[] = [
  { id: 'exp-1', stationId: 'st-kissosso', category: 'EDG', amount: 1450000, beneficiary: 'Électricité de Guinée (EDG)', notes: 'Facture d\'électricité de la station mois d\'août', timestamp: '2026-09-04 09:30' },
  { id: 'exp-2', stationId: 'st-kissosso', category: 'GROUPE_ELECTROGENE', amount: 650000, beneficiary: 'Station Total (Super carbu groupe)', notes: 'Achat 54L Gazoil pour alimentation groupe électrogène secours', timestamp: '2026-09-05 11:00' },
  { id: 'exp-3', stationId: 'st-kissosso', category: 'FOURNITURES', amount: 180000, beneficiary: 'Papeterie Moderne Kissosso', notes: 'Achat de rouleaux papier pour tickets de caisse et registre', timestamp: '2026-09-03 15:10' },
  { id: 'exp-4', stationId: 'st-kissosso', category: 'TRANSPORT', amount: 250000, beneficiary: 'Transporteur Keita', notes: 'Frais de transport documents comptables vers siège', timestamp: '2026-09-02 14:00' },
];

export const INITIAL_EMPLOYEES: EmployeeMock[] = [
  { id: 'emp-1', stationId: 'st-kissosso', fullName: 'SIDIKI FATOUMATA SOUARE', jobTitle: 'Chef de Station (CDS)', baseSalary: 1500000, transportAllowance: 200000, livingAllowance: 150000, housingAllowance: 150000, shortages: 0, loans: 0, netSalary: 2000000 },
  { id: 'emp-2', stationId: 'st-kissosso', fullName: 'MORY DIAWARA', jobTitle: 'Chef de Piste (CDP)', baseSalary: 700000, transportAllowance: 100000, livingAllowance: 100000, housingAllowance: 100000, shortages: 55000, loans: 200000, netSalary: 745000 },
  { id: 'emp-3', stationId: 'st-kissosso', fullName: 'LAYE SOUARE', jobTitle: 'Pompiste Senior', baseSalary: 550000, transportAllowance: 80000, livingAllowance: 70000, housingAllowance: 50000, shortages: 210000, loans: 0, netSalary: 540000 },
  { id: 'emp-4', stationId: 'st-kissosso', fullName: 'LANCINE CAMARA', jobTitle: 'Pompiste', baseSalary: 500000, transportAllowance: 80000, livingAllowance: 60000, housingAllowance: 50000, shortages: 0, loans: 0, netSalary: 690000 },
  { id: 'emp-5', stationId: 'st-kissosso', fullName: 'MAMOUDOU CONDE', jobTitle: 'Pompiste', baseSalary: 500000, transportAllowance: 80000, livingAllowance: 60000, housingAllowance: 50000, shortages: 8000, loans: 0, netSalary: 682000 },
  { id: 'emp-6', stationId: 'st-kissosso', fullName: 'MAMADY KONATE', jobTitle: 'Gardien de Nuit', baseSalary: 450000, transportAllowance: 50000, livingAllowance: 50000, housingAllowance: 50000, shortages: 0, loans: 0, netSalary: 600000 },
];

export interface FuelDeliveryMock {
  id: string;
  stationId: string;
  tankId: string;
  tankCode: string;
  fuelType: 'SUPER' | 'GAZOIL';
  deliveryNoteNumber: string; // N° BL (Bon de Livraison)
  truckPlate: string; // Camion citerne
  driverName: string; // Chauffeur
  supplier: string; // Fournisseur / Dépôt
  litersDelivered: number; // Volume livré
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

export const INITIAL_DELIVERIES: FuelDeliveryMock[] = [
  {
    id: 'del-1',
    stationId: 'st-kissosso',
    tankId: 'tk-super-kiss',
    tankCode: 'CUVE 01 - SUPER',
    fuelType: 'SUPER',
    deliveryNoteNumber: 'BL-TEG-2026-8819',
    truckPlate: 'RC-9921-A (Citerne 45T)',
    driverName: 'Aboubacar Soumah',
    supplier: 'TotalEnergies Guinée - Dépôt Coronthie',
    litersDelivered: 20000,
    operatorName: 'Sidiki Souaré (CDS)',
    timestamp: '2026-09-05 08:30'
  },
  {
    id: 'del-2',
    stationId: 'st-kissosso',
    tankId: 'tk-gazoil-kiss',
    tankCode: 'CUVE 02 - GAZOIL',
    fuelType: 'GAZOIL',
    deliveryNoteNumber: 'BL-TEG-2026-8824',
    truckPlate: 'RC-1102-B (Citerne 40T)',
    driverName: 'Mohamed Sylla',
    supplier: 'TotalEnergies Guinée - Dépôt Coronthie',
    litersDelivered: 20000,
    operatorName: 'Sidiki Souaré (CDS)',
    timestamp: '2026-09-04 14:15'
  }
];

export const INITIAL_PUMP_SHIFTS: FuelPumpShiftMock[] = [
  {
    id: 'shift-1',
    stationId: 'st-kissosso',
    pumpId: 'p1',
    pumpName: 'Pompe 01 (Super)',
    fuelType: 'SUPER',
    startIndex: 145200,
    endIndex: 147800,
    returnToTank: 20,
    litersSold: 2580,
    unitPrice: 12000,
    totalAmount: 30960000,
    pompisteName: 'Laye Souaré',
    shiftType: 'MATIN',
    timestamp: '2026-09-06 14:00'
  },
  {
    id: 'shift-2',
    stationId: 'st-kissosso',
    pumpId: 'p3',
    pumpName: 'Pompe 03 (Gazoil)',
    fuelType: 'GAZOIL',
    startIndex: 210500,
    endIndex: 213900,
    returnToTank: 30,
    litersSold: 3370,
    unitPrice: 12000,
    totalAmount: 40440000,
    pompisteName: 'Mamoudou Condé',
    shiftType: 'MATIN',
    timestamp: '2026-09-06 14:00'
  }
];

