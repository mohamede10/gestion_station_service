"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  StationMock, 
  TankMock, 
  PumpMock, 
  SubscriberMock, 
  ProductMock, 
  PaymentMock, 
  ExpenseMock, 
  EmployeeMock, 
  FuelDeliveryMock, 
  FuelPumpShiftMock, 
  ShiftSubscriberCredit,
  GeneratedInvoiceMock,
  InvoiceCategory,
  INITIAL_STATIONS, 
  INITIAL_TANKS, 
  INITIAL_PUMPS, 
  INITIAL_SUBSCRIBERS, 
  INITIAL_PRODUCTS, 
  INITIAL_PAYMENTS, 
  INITIAL_EXPENSES, 
  INITIAL_EMPLOYEES, 
  INITIAL_DELIVERIES, 
  INITIAL_PUMP_SHIFTS,
  INITIAL_INVOICES,
  UserAccountMock,
  INITIAL_USERS,
  FuelType,
  NozzleKey,
  PumpNozzleMock,
  createNozzle
} from '@/lib/data-mock';
import { ReceiptData } from '@/components/ReceiptModal';

export type UserRole = 'SUPER_ADMIN' | 'GERANT' | 'CHEF_PISTE' | 'CAISSIER';

export interface CreateStationInput {
  code: string;
  name: string;
  city: string;
  tanks?: {
    code?: string;
    fuelType: FuelType;
    capacity: number;
    initialStock: number;
  }[];
  // Chaque pompe possède deux pistolets indépendants (carburant, cuve, prix, index).
  pumps?: {
    name?: string;
    pistolet1?: { fuelType: FuelType; tankIndex?: number; tankId?: string; unitPrice?: number };
    pistolet2?: { fuelType: FuelType; tankIndex?: number; tankId?: string; unitPrice?: number };
    // Champs historiques acceptés pour compatibilité.
    fuelType?: FuelType;
    tankIndex?: number;
    tankId?: string;
    unitPrice?: number;
  }[];
  manager?: {
    fullName: string;
    email: string;
    password?: string;
  };
  pompistes?: {
    fullName: string;
    baseSalary?: number;
    prime?: number;
    primeLabel?: string;
  }[];
}

export interface SystemAlert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface StationContextType {
  // Authentication & Session
  currentUser: UserAccountMock | null;
  isAuthReady: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchUserDemo: (user: UserAccountMock) => void;
  allUsers: UserAccountMock[];

  // Navigation & Role
  stations: StationMock[];
  currentStation: StationMock | null;
  setCurrentStation: (station: StationMock | null) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Station Management
  addStation: (data: CreateStationInput) => Promise<StationMock>;
  addTankToStation: (stationId: string, data: { code: string; fuelType: FuelType; capacity: number; initialStock: number }) => TankMock;
  addPumpToStation: (stationId: string, data: {
    name: string;
    pistolet1?: { fuelType: FuelType; tankId: string; unitPrice?: number };
    pistolet2?: { fuelType: FuelType; tankId: string; unitPrice?: number };
    // Compatibilité avec l'ancien formulaire à un seul pistolet.
    fuelType?: FuelType;
    tankId?: string;
    unitPrice?: number;
  }) => PumpMock;
  switchTankValve: (tankId: string) => void;
  updateTankPumpLinks: (tankId: string, pumpIds: string[]) => void;
  deleteStation: (stationId: string) => Promise<boolean>;
  deleteAllStations: () => Promise<boolean>;
  deleteTank: (tankId: string) => void;
  deletePump: (pumpId: string) => void;

  // Télématique Ruptela Smart5 & Sondes Eurosens Dominator BT
  updateTankTelematics: (tankId: string, data: Partial<TankMock>) => void;
  configureTankSensor: (tankId: string, config: { telematicsImei: string; sensorBleMac: string; sensorIndex?: number }) => void;

  // Gestion des Utilisateurs & Personnel
  users: UserAccountMock[];
  addUser: (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    stationId: string | null;
    stationName?: string | null;
  }) => UserAccountMock;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<UserAccountMock>) => void;
  deleteEmployee: (empId: string) => void;
  deleteSubscriber: (subId: string) => void;

  // Data Collections
  tanks: TankMock[];
  pumps: PumpMock[];
  subscribers: SubscriberMock[];
  products: ProductMock[];
  payments: PaymentMock[];
  expenses: ExpenseMock[];
  employees: EmployeeMock[];
  deliveries: FuelDeliveryMock[];
  pumpShifts: FuelPumpShiftMock[];
  invoices: GeneratedInvoiceMock[];
  addInvoice: (data: {
    stationId?: string;
    category: InvoiceCategory;
    categoryLabel: string;
    receipt: ReceiptData;
    amount?: number;
  }) => GeneratedInvoiceMock;

  // Business Actions
  recordPumpShift: (data: {
    pumpId: string;
    nozzleKey: NozzleKey;
    startIndex: number;
    endIndex: number;
    returnToTank: number;
    pompisteName: string;
    shiftType: 'MATIN' | 'SOIR' | 'NUIT';
    // Crédit abonné pendant la tournée (supporte plusieurs abonnés et litres spécifiques).
    subscriberMode?: 'NONE' | 'EXISTING' | 'NEW';
    subscriberId?: string;
    subscriberLiters?: number;
    newSubscriber?: { name: string; phone: string; address: string; initialAdvance?: number };
    subscriberCredits?: Array<{
      mode: 'EXISTING' | 'NEW';
      subscriberId?: string;
      liters: number;
      newSubscriber?: { name: string; phone?: string; address?: string; initialAdvance?: number };
    }>;
  }) => { receipt: ReceiptData; shift: FuelPumpShiftMock };

  recordTankDipstick: (data: {
    tankId: string;
    physicalStock: number;
    operatorName: string;
  }) => { receipt: ReceiptData; tank: TankMock; gap: number };

  recordFuelDelivery: (data: {
    tankId: string;
    deliveryNoteNumber: string;
    truckPlate: string;
    driverName: string;
    supplier: string;
    litersDelivered: number;
    operatorName: string;
  }) => { receipt: ReceiptData; delivery: FuelDeliveryMock };

  recordFuelSale: (data: {
    tankId: string;
    litersSold: number;
    operatorName?: string;
    unitPrice?: number;
    pumpId?: string;
    notes?: string;
  }) => { receipt: ReceiptData; tank: TankMock; litersSold: number };

  addSubscriber: (data: {
    code: string;
    name: string;
    phone: string;
    address: string;
    stationId?: string;
    initialAdvance?: number;
    initialCredit?: number;
    creditLiters?: number;
  }) => SubscriberMock;

  recordSubscriberPayment: (data: {
    subscriberId: string;
    payerName: string;
    accountNumber: string;
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH';
    referenceNo: string;
    amount: number;
    notes: string;
  }) => { receipt: ReceiptData; payment: PaymentMock };

  recordSubscriberVoucher: (data: {
    subscriberId: string;
    fuelType: FuelType;
    liters: number;
    unitPrice: number;
    vehiclePlate: string;
    driverName: string;
    voucherNo: string;
  }) => { receipt: ReceiptData; totalAmount: number };

  addProduct: (data: {
    code: string;
    name: string;
    unitType: string;
    price: number;
    stock: number;
  }) => ProductMock;

  recordProductSale: (data: {
    productId: string;
    quantity: number;
    clientName: string;
  }) => { receipt: ReceiptData; total: number };

  restockProduct: (productId: string, quantity: number) => void;

  addExpense: (data: {
    category: 'EDG' | 'GROUPE_ELECTROGENE' | 'TELEPHONE_INTERNET' | 'TRANSPORT' | 'ENTRETIEN_REPARATIONS' | 'FOURNITURES' | 'DIVERS';
    amount: number;
    beneficiary: string;
    notes: string;
  }) => { receipt: ReceiptData; expense: ExpenseMock };

  recordBankDeposit: (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    depositorName: string;
    slipNumber: string;
    notes: string;
  }) => { receipt: ReceiptData; expense: ExpenseMock };

  addEmployee: (data: {
    fullName: string;
    jobTitle: string;
    stationId?: string;
    baseSalary: number;
    transportAllowance: number;
    livingAllowance: number;
    housingAllowance: number;
    prime?: number;
    primeLabel?: string;
  }) => EmployeeMock;

  updateEmployee: (
    empId: string, 
    updates: Partial<Pick<EmployeeMock, 'shortages' | 'loans' | 'prime' | 'primeLabel' | 'baseSalary' | 'transportAllowance' | 'livingAllowance' | 'housingAllowance'>>
  ) => void;

  generateEmployeePayslip: (empId: string) => ReceiptData | null;

  resetAllData: () => void;

  // Alertes Internes & Notifications (Pas de popups Chrome)
  alerts: SystemAlert[];
  notify: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void;
  notifySuccess: (message: string, title?: string) => void;
  notifyError: (message: string, title?: string) => void;
  notifyWarning: (message: string, title?: string) => void;
  notifyInfo: (message: string, title?: string) => void;
  removeAlert: (id: string) => void;
  confirmModal: ConfirmModalState | null;
  askConfirm: (options: { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel?: () => void }) => void;
  closeConfirm: () => void;

  // Numérotation & Codes Automatiques Système
  generateSubscriberCode: () => string;
  generateVoucherNumber: () => string;
  generateProductCode: () => string;
  generateStationCode: (city?: string) => string;
  generateDeliveryNoteNumber: () => string;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

const STORAGE_KEY = 'TOTALENERGIES_STATION_MANAGER_V7';

// Groupe de bascule : Essence (SUPER/ESSENCE) et Gazoil partagent un point de
// rencontre distinct. Plusieurs cuves d'un même groupe peuvent alimenter
// toutes les pompes du groupe.
export function fuelBasculeGroup(fuelType: FuelType): string {
  return fuelType === 'GAZOIL' ? 'GAZOIL' : 'ESSENCE';
}

function resolveTankId(
  spec: { fuelType?: FuelType; tankIndex?: number; tankId?: string } | undefined,
  createdTanks: TankMock[],
  fallbackFuelType: FuelType
): string {
  if (spec?.tankIndex !== undefined && createdTanks[spec.tankIndex]) {
    return createdTanks[spec.tankIndex].id;
  }
  if (spec?.tankId && createdTanks.some((t) => t.id === spec.tankId)) {
    return spec.tankId;
  }
  if (spec?.fuelType) {
    const match = createdTanks.find((t) => fuelBasculeGroup(t.fuelType) === fuelBasculeGroup(spec.fuelType!));
    if (match) return match.id;
  }
  const fallback = createdTanks.find((t) => fuelBasculeGroup(t.fuelType) === fuelBasculeGroup(fallbackFuelType));
  return fallback?.id || createdTanks[0]?.id || '';
}

function resolveNozzleSpec(
  spec: { fuelType: FuelType; tankIndex?: number; tankId?: string; unitPrice?: number } | undefined,
  legacy: { fuelType?: FuelType; tankIndex?: number; tankId?: string; unitPrice?: number },
  createdTanks: TankMock[],
  fallbackFuelType: FuelType
): { fuelType: FuelType; tankId: string; unitPrice: number } {
  const fuelType = spec?.fuelType || legacy.fuelType || fallbackFuelType;
  return {
    fuelType,
    tankId: resolveTankId(spec || legacy, createdTanks, fuelType),
    unitPrice: Number(spec?.unitPrice ?? legacy.unitPrice) || 12000
  };
}

function pumpFromSpecs(
  id: string,
  stationId: string,
  name: string,
  nozzle1: { fuelType: FuelType; tankId: string; unitPrice: number },
  nozzle2: { fuelType: FuelType; tankId: string; unitPrice: number }
): PumpMock {
  return {
    id,
    stationId,
    tankId: nozzle1.tankId,
    name,
    fuelType: nozzle1.fuelType,
    startIndex: 0,
    endIndex: 0,
    returnToTank: 0,
    unitPrice: nozzle1.unitPrice,
    nozzle1: createNozzle(nozzle1.fuelType, nozzle1.tankId, nozzle1.unitPrice),
    nozzle2: createNozzle(nozzle2.fuelType, nozzle2.tankId, nozzle2.unitPrice)
  };
}

export function StationProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // States
  const [currentUser, setCurrentUser] = useState<UserAccountMock | null>(null);
  const [users, setUsers] = useState<UserAccountMock[]>(INITIAL_USERS);
  const [stations, setStations] = useState<StationMock[]>(INITIAL_STATIONS);
  const [currentStation, setCurrentStation] = useState<StationMock | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');

  const [tanks, setTanks] = useState<TankMock[]>(INITIAL_TANKS);
  const [pumps, setPumps] = useState<PumpMock[]>(INITIAL_PUMPS);
  const [subscribers, setSubscribers] = useState<SubscriberMock[]>(INITIAL_SUBSCRIBERS);
  const [products, setProducts] = useState<ProductMock[]>(INITIAL_PRODUCTS);
  const [payments, setPayments] = useState<PaymentMock[]>(INITIAL_PAYMENTS);
  const [expenses, setExpenses] = useState<ExpenseMock[]>(INITIAL_EXPENSES);
  const [employees, setEmployees] = useState<EmployeeMock[]>(INITIAL_EMPLOYEES);
  const [deliveries, setDeliveries] = useState<FuelDeliveryMock[]>(INITIAL_DELIVERIES);
  const [pumpShifts, setPumpShifts] = useState<FuelPumpShiftMock[]>(INITIAL_PUMP_SHIFTS);
  const [invoices, setInvoices] = useState<GeneratedInvoiceMock[]>(INITIAL_INVOICES);

  // Alertes & Notifications Système (dans le système, pas dans Chrome)
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const notify = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    const id = `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAlert: SystemAlert = { id, type, message, title };
    setAlerts(prev => [...prev.slice(-3), newAlert]);
    setTimeout(() => {
      removeAlert(id);
    }, 4500);
  };

  const notifySuccess = (message: string, title?: string) => notify(message, 'success', title || 'Succès');
  const notifyError = (message: string, title?: string) => notify(message, 'error', title || 'Erreur');
  const notifyWarning = (message: string, title?: string) => notify(message, 'warning', title || 'Attention');
  const notifyInfo = (message: string, title?: string) => notify(message, 'info', title || 'Information');

  const askConfirm = (options: { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel?: () => void }) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || 'Confirmation requise',
      message: options.message,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel
    });
  };

  const closeConfirm = () => {
    setConfirmModal(null);
  };

  // Interception de window.alert pour garantir 0 popups Chrome
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).alert = (msg: any) => {
        const text = typeof msg === 'string' ? msg : JSON.stringify(msg);
        if (text && text.includes('✅')) {
          notifySuccess(text.replace(/^[✅\s]+/, '').trim());
        } else if (text && (text.toLowerCase().includes('erreur') || text.includes('❌') || text.toLowerCase().includes('attention'))) {
          notifyError(text.replace(/^[❌\s]+/, '').trim());
        } else {
          notifyInfo(text);
        }
      };
    }
  }, []);

  // Ajout / Enregistrement d'une facture / reçu dans l'historique global
  const addInvoice = (data: {
    stationId?: string;
    category: InvoiceCategory;
    categoryLabel: string;
    receipt: ReceiptData;
    amount?: number;
  }): GeneratedInvoiceMock => {
    const targetStationId = data.stationId || activeStationId || (currentStation ? currentStation.id : 'stat-kissosso-001');
    const newInvoice: GeneratedInvoiceMock = {
      id: `inv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      stationId: targetStationId,
      category: data.category,
      categoryLabel: data.categoryLabel,
      title: data.receipt.title,
      docNumber: data.receipt.docNumber,
      stationName: data.receipt.stationName || activeStationName,
      timestamp: data.receipt.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: data.receipt.operatorName || (currentUser?.name || 'Direction'),
      amount: data.amount,
      fields: data.receipt.fields,
      notes: data.receipt.notes
    };

    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  // Générateurs automatiques de codes système
  const generateSubscriberCode = () => {
    return `ABN-${String(subscribers.length + 1).padStart(3, '0')}`;
  };

  const generateVoucherNumber = () => {
    const currentYear = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `BON-${currentYear}-${randomHex}`;
  };

  const generateProductCode = () => {
    return `ART-${String(products.length + 1).padStart(3, '0')}`;
  };

  // Code station séquentiel : ST-001, ST-002, ST-003, ...
  // Le numéro suivant est calculé à partir du plus grand numéro existant.
  const generateStationCode = (_city?: string) => {
    const maxNumber = stations.reduce((max, st) => {
      const match = /^ST-(\d+)$/i.exec((st.code || '').trim());
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `ST-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  const generateDeliveryNoteNumber = () => {
    const currentYear = new Date().getFullYear();
    return `BL-${currentYear}-${String(deliveries.length + 1).padStart(4, '0')}`;
  };

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      // Nettoyage proactif de tous les anciens caches de démonstration
      ['TOTALENERGIES_STATION_MANAGER_V6', 'TOTALENERGIES_STATION_MANAGER_V5', 'TOTALENERGIES_STATION_MANAGER_V4', 'TOTALENERGIES_STATION_MANAGER_V3', 'TOTALENERGIES_STATION_MANAGER_V2', 'TOTALENERGIES_STATION_MANAGER_V1'].forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.users && Array.isArray(parsed.users)) setUsers(parsed.users);
        if (Array.isArray(parsed.stations)) {
          setStations(parsed.stations);
        } else {
          setStations(INITIAL_STATIONS);
        }
        if (parsed.currentStation !== undefined) setCurrentStation(parsed.currentStation);
        if (Array.isArray(parsed.tanks)) {
          // Migration douce des anciens caches : nouveaux champs par défaut.
          setTanks(parsed.tanks.map((t: any) => ({
            ...t,
            valveStatus: t.valveStatus || 'CLOSED',
            basculeGroup: t.basculeGroup || fuelBasculeGroup(t.fuelType),
            suppliesPumpIds: Array.isArray(t.suppliesPumpIds) ? t.suppliesPumpIds : []
          })));
        } else {
          setTanks(INITIAL_TANKS);
        }
        if (Array.isArray(parsed.pumps)) {
          setPumps(parsed.pumps.map((p: any) => ({
            ...p,
            nozzle1: p.nozzle1 || createNozzle(p.fuelType || 'ESSENCE', p.tankId || '', p.unitPrice || 12000),
            nozzle2: p.nozzle2 || createNozzle(p.fuelType === 'GAZOIL' ? 'ESSENCE' : 'GAZOIL', p.tankId || '', p.unitPrice || 12000)
          })));
        } else {
          setPumps(INITIAL_PUMPS);
        }
        if (Array.isArray(parsed.subscribers)) {
          setSubscribers(parsed.subscribers.map((s: any) => ({ ...s, creditLiters: s.creditLiters || 0 })));
        } else {
          setSubscribers(INITIAL_SUBSCRIBERS);
        }
        if (Array.isArray(parsed.products)) {
          setProducts(parsed.products);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
        if (Array.isArray(parsed.employees)) {
          setEmployees(parsed.employees.map((e: any) => ({
            ...e,
            prime: Number(e.prime) || 0,
            primeLabel: e.primeLabel || ''
          })));
        } else {
          setEmployees(INITIAL_EMPLOYEES);
        }
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.deliveries) setDeliveries(parsed.deliveries);
        if (parsed.pumpShifts) setPumpShifts(parsed.pumpShifts);
        if (Array.isArray(parsed.invoices)) setInvoices(parsed.invoices);
      } else {
        setStations(INITIAL_STATIONS);
        setTanks(INITIAL_TANKS);
        setPumps(INITIAL_PUMPS);
        setSubscribers(INITIAL_SUBSCRIBERS);
        setProducts(INITIAL_PRODUCTS);
        setEmployees(INITIAL_EMPLOYEES);
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }

    // Synchronisation avec la base Supabase — NON DESTRUCTIVE :
    // La BD sert uniquement à ajouter les entités absentes du localStorage.
    // Les stocks/données modifiées en session sont TOUJOURS prioritaires (localStorage).
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !Array.isArray(data.stations)) return;

        // Si la BD ne retourne aucune station, on garde le localStorage intact
        if (data.stations.length === 0) return;

        // Ajouter les stations BD absentes du localStorage (sans supprimer)
        setStations(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newOnes = data.stations
            .filter((st: any) => !existingIds.has(st.id))
            .map((st: any) => ({
              id: st.id,
              code: st.code,
              name: st.name,
              city: st.city
            }));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });

        const dbTanks: TankMock[] = [];
        const dbPumps: PumpMock[] = [];
        const dbEmployees: EmployeeMock[] = [];

        data.stations.forEach((st: any) => {
          if (st.tanks) {
            st.tanks.forEach((t: any) => {
              dbTanks.push({
                id: t.id,
                stationId: t.stationId,
                code: t.code,
                fuelType: t.fuelType,
                capacity: t.capacity,
                initialStock: t.initialStock,
                // On garde le stock BD uniquement si > 0, sinon on laisse le localStorage gérer
                currentStock: t.currentStock,
                physicalStock: t.currentStock,
                lastDipstickDate: new Date().toISOString().substring(0, 16),
                valveStatus: t.valveStatus || 'CLOSED',
                basculeGroup: t.basculeGroup || fuelBasculeGroup(t.fuelType),
                suppliesPumpIds: Array.isArray(t.suppliesPumpIds) ? t.suppliesPumpIds : []
              });
            });
          }
          if (st.pumps) {
            st.pumps.forEach((p: any) => {
              const stationTanks: TankMock[] = st.tanks || [];
              const n1Spec = resolveNozzleSpec(p.pistolet1, p, stationTanks, p.fuelType || 'ESSENCE');
              const alternate = stationTanks.find((t) => fuelBasculeGroup(t.fuelType) !== fuelBasculeGroup(n1Spec.fuelType));
              const n2Spec = resolveNozzleSpec(
                p.pistolet2,
                { fuelType: alternate?.fuelType || n1Spec.fuelType, tankId: alternate?.id || n1Spec.tankId, unitPrice: n1Spec.unitPrice },
                stationTanks,
                alternate?.fuelType || n1Spec.fuelType
              );
              dbPumps.push(pumpFromSpecs(
                p.id,
                p.stationId,
                p.name,
                n1Spec,
                n2Spec
              ));
            });
          }
          if (st.employees) {
            st.employees.forEach((e: any) => {
              dbEmployees.push({
                id: e.id,
                stationId: e.stationId,
                fullName: e.fullName,
                jobTitle: e.jobTitle,
                baseSalary: e.baseSalary,
                transportAllowance: e.transportAllowance,
                livingAllowance: e.livingAllowance,
                housingAllowance: e.housingAllowance,
                prime: Number(e.prime) || 0,
                primeLabel: e.primeLabel || '',
                shortages: 0,
                loans: 0,
                netSalary: (Number(e.baseSalary) || 0) + (Number(e.prime) || 0)
              });
            });
          }
        });

        // Cuves : n'ajouter que les cuves absentes du localStorage
        // Les cuves existantes conservent leur currentStock localStorage (prioritaire)
        if (dbTanks.length > 0) {
          setTanks(prev => {
            const localIds = new Set(prev.map(t => t.id));
            const additions = dbTanks.filter(t => !localIds.has(t.id));
            return additions.length > 0 ? [...prev, ...additions] : prev;
          });
        }

        // Pompes : même logique non-destructive
        if (dbPumps.length > 0) {
          setPumps(prev => {
            const localIds = new Set(prev.map(p => p.id));
            const additions = dbPumps.filter(p => !localIds.has(p.id));
            return additions.length > 0 ? [...prev, ...additions] : prev;
          });
        }

        // Employés : même logique non-destructive
        if (dbEmployees.length > 0) {
          setEmployees(prev => {
            const localIds = new Set(prev.map(e => e.id));
            const additions = dbEmployees.filter(e => !localIds.has(e.id));
            return additions.length > 0 ? [...prev, ...additions] : prev;
          });
        }
      })
      .catch(err => console.warn('Sync stations with API (non-bloquant):', err));
  }, []);

  // Sync to localStorage on change
  useEffect(() => {
    if (!isClient) return;
    try {
      const payload = {
        currentUser,
        users,
        stations,
        currentStation,
        userRole,
        tanks,
        pumps,
        subscribers,
        products,
        payments,
        expenses,
        employees,
        deliveries,
        pumpShifts,
        invoices
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist to localStorage:', e);
    }
  }, [
    isClient,
    currentUser,
    users,
    stations,
    currentStation,
    userRole,
    tanks,
    pumps,
    subscribers,
    products,
    payments,
    expenses,
    employees,
    deliveries,
    pumpShifts,
    invoices
  ]);

  // Auth Methods
  const login = async (email: string, password?: string): Promise<boolean> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Tenter l'authentification avec la base de données Supabase via l'API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: password || 'admin' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const user: UserAccountMock = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            stationId: data.user.stationId,
            stationName: data.user.stationName,
            password: password
          };
          setCurrentUser(user);
          setUserRole(user.role);
          if (user.role === 'SUPER_ADMIN') {
            setCurrentStation(null);
          } else {
            const targetStation = stations.find(s => s.id === user.stationId) || stations[0];
            setCurrentStation(targetStation);
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('API auth error, falling back to local list:', err);
    }

    // 2. Fallback local pour mode hors-ligne ou compte de secours
    const user = users.find(u => u.email.toLowerCase() === trimmedEmail) || INITIAL_USERS.find(u => u.email.toLowerCase() === trimmedEmail);
    if (user || trimmedEmail === 'admin@totalenergies.gn' || trimmedEmail === 'superadmin@totalenergies.gn') {
      const validUser: UserAccountMock = user || {
        id: 'usr-admin',
        name: 'Administrateur',
        email: 'admin@totalenergies.gn',
        password: 'admin',
        role: 'SUPER_ADMIN',
        stationId: null,
        stationName: 'Supervision'
      };
      if (password && validUser.password && validUser.password !== password) {
        return false;
      }
      setCurrentUser(validUser);
      setUserRole(validUser.role);
      if (validUser.role === 'SUPER_ADMIN') {
        setCurrentStation(null);
      } else {
        const targetStation = stations.find(s => s.id === validUser.stationId) || stations[0] || null;
        setCurrentStation(targetStation);
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserDemo = (user: UserAccountMock) => {
    setCurrentUser(user);
    setUserRole(user.role);
    if (user.role === 'SUPER_ADMIN') {
      setCurrentStation(null);
    } else {
      const targetStation = stations.find(s => s.id === user.stationId) || stations[0] || null;
      setCurrentStation(targetStation);
    }
  };


  const activeStationId = currentStation ? currentStation.id : (stations[0]?.id || '');
  const activeStationName = currentStation ? currentStation.name : (stations[0]?.name || 'Supervision Réseau (Aucune Station)');

  // Helper: Add Station (Complète & Flexible)
  const addStation = async (data: CreateStationInput): Promise<StationMock> => {
    const stationId = `st-${Date.now()}`;
    const requestedCode = (data.code || '').trim().toUpperCase();
    const cleanCode = /^ST-\d{3,}$/.test(requestedCode) ? requestedCode : generateStationCode();
    const cleanName = data.name.trim();
    const cleanCity = data.city.trim();

    const newSt: StationMock = {
      id: stationId,
      code: cleanCode,
      name: cleanName,
      city: cleanCity
    };

    // 1. Cuves personnalisées (la première cuve de chaque groupe ouvre sa vanne)
    const createdTanks: TankMock[] = [];
    const pushTank = (tank: Omit<TankMock, 'valveStatus' | 'basculeGroup' | 'suppliesPumpIds'>) => {
      const group = fuelBasculeGroup(tank.fuelType);
      createdTanks.push({
        ...tank,
        valveStatus: createdTanks.some((t) => fuelBasculeGroup(t.fuelType) === group) ? 'CLOSED' : 'OPEN',
        basculeGroup: group,
        suppliesPumpIds: []
      });
    };

    if (data.tanks && data.tanks.length > 0) {
      data.tanks.forEach((t, i) => {
        const initialStock = Number(t.initialStock) || 0;
        pushTank({
          id: `tk-${stationId}-${i + 1}`,
          stationId: stationId,
          code: t.code || `CUVE 0${i + 1} - ${t.fuelType}`,
          fuelType: t.fuelType,
          capacity: Number(t.capacity) || 45000,
          initialStock,
          currentStock: initialStock,
          physicalStock: initialStock,
          lastDipstickDate: new Date().toISOString().substring(0, 16)
        });
      });
    } else {
      // Cuves standard par défaut
      pushTank({
        id: `tk-essence-${stationId}`,
        stationId: stationId,
        code: 'CUVE 01 - ESSENCE',
        fuelType: 'ESSENCE',
        capacity: 45000,
        initialStock: 10000,
        currentStock: 10000,
        physicalStock: 10000,
        lastDipstickDate: new Date().toISOString().substring(0, 16)
      });
      pushTank({
        id: `tk-gazoil-${stationId}`,
        stationId: stationId,
        code: 'CUVE 02 - GAZOIL',
        fuelType: 'GAZOIL',
        capacity: 45000,
        initialStock: 12000,
        currentStock: 12000,
        physicalStock: 12000,
        lastDipstickDate: new Date().toISOString().substring(0, 16)
      });
    }

    // 2. Pompes à deux pistolets (index indépendants)
    const createdPumps: PumpMock[] = [];
    if (data.pumps && data.pumps.length > 0) {
      data.pumps.forEach((p, i) => {
        const legacyFuel = p.fuelType || 'ESSENCE';
        const s1 = resolveNozzleSpec(p.pistolet1, p, createdTanks, legacyFuel);
        const otherGroup = fuelBasculeGroup(s1.fuelType) === 'GAZOIL' ? 'ESSENCE' : 'GAZOIL';
        const fallbackTank2 = createdTanks.find((t) => fuelBasculeGroup(t.fuelType) === otherGroup);
        const defaultNozzle2 = {
          fuelType: (fallbackTank2?.fuelType || s1.fuelType) as FuelType,
          tankIndex: fallbackTank2 ? createdTanks.indexOf(fallbackTank2) : createdTanks.indexOf(createdTanks.find((t) => t.id === s1.tankId)!),
          unitPrice: s1.unitPrice
        };
        const s2 = resolveNozzleSpec(p.pistolet2, { ...defaultNozzle2 }, createdTanks, defaultNozzle2.fuelType);

        createdPumps.push(pumpFromSpecs(
          `p-${stationId}-${i + 1}`,
          stationId,
          p.name || `Pompe 0${i + 1} (${fuelBasculeGroup(s1.fuelType) === 'ESSENCE' ? 'Essence' : 'Gazoil'})`,
          s1,
          s2
        ));
      });
    } else {
      // Pompe standard : pistolet1 essence, pistolet2 gazoil
      const essenceTank = createdTanks.find((t) => fuelBasculeGroup(t.fuelType) === 'ESSENCE') || createdTanks[0];
      const gazoilTank = createdTanks.find((t) => fuelBasculeGroup(t.fuelType) === 'GAZOIL') || essenceTank;
      createdPumps.push(pumpFromSpecs(
        `p-${stationId}-1`,
        stationId,
        'Pompe 01 (2 pistolets)',
        { fuelType: essenceTank?.fuelType || 'ESSENCE', tankId: essenceTank?.id || '', unitPrice: 12000 },
        { fuelType: gazoilTank?.fuelType || 'GAZOIL', tankId: gazoilTank?.id || '', unitPrice: 12000 }
      ));
    }

    // Les cuves alimentent les pompes via leurs pistolets (point de rencontre).
    createdPumps.forEach((pump) => {
      [pump.nozzle1, pump.nozzle2].forEach((nozzle) => {
        const tank = createdTanks.find((t) => t.id === nozzle.tankId);
        if (tank && !tank.suppliesPumpIds.includes(pump.id)) {
          tank.suppliesPumpIds.push(pump.id);
        }
      });
    });

    // 3. Compte Gérant si spécifié
    if (data.manager && data.manager.email && data.manager.fullName) {
      const managerUser: UserAccountMock = {
        id: `usr-${Date.now()}`,
        name: data.manager.fullName,
        email: data.manager.email.trim().toLowerCase(),
        password: data.manager.password || 'admin',
        role: 'GERANT',
        stationId: stationId,
        stationName: cleanName
      };
      setUsers(prev => [...prev, managerUser]);
    }

    // 4. Pompistes / Employés
    const createdEmployees: EmployeeMock[] = [];
    if (data.pompistes && data.pompistes.length > 0) {
      data.pompistes.forEach((emp, i) => {
        if (emp.fullName && emp.fullName.trim()) {
          createdEmployees.push({
            id: `emp-${stationId}-${i + 1}`,
            stationId: stationId,
            fullName: emp.fullName.trim(),
            jobTitle: 'Pompiste',
            baseSalary: Number(emp.baseSalary) || 1500000,
            transportAllowance: 150000,
            livingAllowance: 150000,
            housingAllowance: 200000,
            prime: Number(emp.prime) || 0,
            primeLabel: emp.primeLabel || '',
            shortages: 0,
            loans: 0,
            netSalary: 2000000 + (Number(emp.prime) || 0)
          });
        }
      });
    }

    // Sauvegarde dans Supabase via API : la base est la source de vérité
    let finalStation = newSt;
    let finalTanks = createdTanks;
    let finalPumps = createdPumps;
    let finalEmployees = createdEmployees;

    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          city: cleanCity,
          tanks: createdTanks,
          pumps: createdPumps.map((p) => ({
            name: p.name,
            fuelType: p.fuelType,
            unitPrice: p.unitPrice,
            pistolet1: {
              fuelType: p.nozzle1.fuelType,
              tankId: p.nozzle1.tankId,
              unitPrice: p.nozzle1.unitPrice
            },
            pistolet2: {
              fuelType: p.nozzle2.fuelType,
              tankId: p.nozzle2.tankId,
              unitPrice: p.nozzle2.unitPrice
            }
          })),
          manager: data.manager,
          pompistes: createdEmployees.map((emp) => ({
            fullName: emp.fullName,
            baseSalary: emp.baseSalary,
            prime: emp.prime,
            primeLabel: emp.primeLabel
          }))
        })
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'Synchronisation de la station impossible.');
      }

      finalStation = {
        id: payload.station.id,
        code: payload.station.code,
        name: payload.station.name,
        city: payload.station.city
      };

      if (Array.isArray(payload.tanks) && payload.tanks.length > 0) {
        finalTanks = payload.tanks.map((t: any) => ({
          id: t.id,
          stationId: t.stationId,
          code: t.code,
          fuelType: t.fuelType,
          capacity: t.capacity,
          initialStock: t.initialStock,
          currentStock: t.currentStock,
          physicalStock: t.currentStock,
          lastDipstickDate: new Date().toISOString().substring(0, 16),
          valveStatus: t.valveStatus || 'CLOSED',
          basculeGroup: t.basculeGroup || fuelBasculeGroup(t.fuelType),
          suppliesPumpIds: Array.isArray(t.suppliesPumpIds) ? t.suppliesPumpIds : []
        }));
      }

      if (Array.isArray(payload.pumps) && payload.pumps.length > 0) {
        finalPumps = payload.pumps.map((p: any, i: number) => {
          const local = createdPumps[i];
          const n1 = p.pistolet1 || {};
          const n2 = p.pistolet2 || {};
          const nozzle1 = {
            fuelType: (n1.fuelType || p.fuelType || local?.nozzle1.fuelType || 'ESSENCE') as FuelType,
            tankId: n1.tankId || p.tankId || local?.nozzle1.tankId || '',
            unitPrice: Number(n1.unitPrice) || local?.nozzle1.unitPrice || 12000
          };
          const nozzle2 = {
            fuelType: (n2.fuelType || local?.nozzle2.fuelType || 'GAZOIL') as FuelType,
            tankId: n2.tankId || local?.nozzle2.tankId || '',
            unitPrice: Number(n2.unitPrice) || local?.nozzle2.unitPrice || 12000
          };
          return pumpFromSpecs(p.id, p.stationId, p.name || local?.name || `Pompe ${i + 1}`, nozzle1, nozzle2);
        });
      }

      if (Array.isArray(payload.employees) && payload.employees.length > 0) {
        finalEmployees = payload.employees.map((e: any, empIndex: number) => ({
          id: e.id,
          stationId: e.stationId,
          fullName: e.fullName,
          jobTitle: e.jobTitle,
          baseSalary: e.baseSalary,
          transportAllowance: e.transportAllowance,
          livingAllowance: e.livingAllowance,
          housingAllowance: e.housingAllowance,
          prime: Number(e.prime) || createdEmployees[empIndex]?.prime || 0,
          primeLabel: e.primeLabel || createdEmployees[empIndex]?.primeLabel || '',
          shortages: 0,
          loans: 0,
          netSalary: (Number(e.baseSalary) || 0) + (Number(e.prime) || createdEmployees[empIndex]?.prime || 0)
        }));
      }
    } catch (e) {
      console.warn('Sync Supabase station error:', e);
    }

    setStations(prev => [...prev, finalStation]);
    setTanks(prev => [...prev, ...finalTanks]);
    setPumps(prev => [...prev, ...finalPumps]);
    if (finalEmployees.length > 0) {
      setEmployees(prev => [...prev, ...finalEmployees]);
    }

    return finalStation;
  };

  const addTankToStation = (stationId: string, data: { code: string; fuelType: FuelType; capacity: number; initialStock: number }): TankMock => {
    const group = fuelBasculeGroup(data.fuelType);
    const hasOpenTank = tanks.some((t) => t.stationId === stationId && fuelBasculeGroup(t.fuelType) === group && t.valveStatus !== 'CLOSED');
    const newTank: TankMock = {
      id: `tk-${stationId}-${Date.now()}`,
      stationId,
      code: data.code,
      fuelType: data.fuelType,
      capacity: Number(data.capacity) || 45000,
      initialStock: Number(data.initialStock) || 0,
      currentStock: Number(data.initialStock) || 0,
      physicalStock: Number(data.initialStock) || 0,
      lastDipstickDate: new Date().toISOString().substring(0, 16),
      valveStatus: hasOpenTank ? 'CLOSED' : 'OPEN',
      basculeGroup: group,
      suppliesPumpIds: []
    };
    setTanks(prev => [...prev, newTank]);
    return newTank;
  };

  const addPumpToStation = (stationId: string, data: {
    name: string;
    pistolet1?: { fuelType: FuelType; tankId: string; unitPrice?: number };
    pistolet2?: { fuelType: FuelType; tankId: string; unitPrice?: number };
    fuelType?: FuelType;
    tankId?: string;
    unitPrice?: number;
  }): PumpMock => {
    const stationTanks = tanks.filter((t) => t.stationId === stationId);
    const primaryFuel = data.pistolet1?.fuelType || data.fuelType || 'ESSENCE';
    const n1 = {
      fuelType: primaryFuel,
      tankId: data.pistolet1?.tankId || data.tankId || stationTanks.find((t) => fuelBasculeGroup(t.fuelType) === fuelBasculeGroup(primaryFuel))?.id || '',
      unitPrice: Number(data.pistolet1?.unitPrice ?? data.unitPrice) || 12000
    };
    const otherGroup = fuelBasculeGroup(primaryFuel) === 'GAZOIL' ? 'ESSENCE' : 'GAZOIL';
    const altTank = stationTanks.find((t) => fuelBasculeGroup(t.fuelType) === otherGroup) || stationTanks.find((t) => t.id === n1.tankId);
    const n2 = {
      fuelType: data.pistolet2?.fuelType || altTank?.fuelType || primaryFuel,
      tankId: data.pistolet2?.tankId || altTank?.id || n1.tankId,
      unitPrice: Number(data.pistolet2?.unitPrice) || n1.unitPrice
    };
    const newPump = pumpFromSpecs(`p-${stationId}-${Date.now()}`, stationId, data.name, n1, n2);
    setPumps(prev => [...prev, newPump]);
    setTanks(prev => prev.map((t) => {
      const serves = [n1.tankId, n2.tankId].includes(t.id);
      return serves && !t.suppliesPumpIds.includes(newPump.id)
        ? { ...t, suppliesPumpIds: [...t.suppliesPumpIds, newPump.id] }
        : t;
    }));
    return newPump;
  };

  // Bascule manuelle : ouvrir la vanne d'une cuve ferme toutes les autres
  // cuves du même groupe (même carburant) servant les mêmes pompes.
  const switchTankValve = (tankId: string) => {
    const target = tanks.find((t) => t.id === tankId);
    if (!target) return;
    const group = target.basculeGroup || fuelBasculeGroup(target.fuelType);
    setTanks(prev => prev.map((t) => {
      if (t.stationId !== target.stationId) return t;
      if ((t.basculeGroup || fuelBasculeGroup(t.fuelType)) !== group) return t;
      return { ...t, valveStatus: t.id === tankId ? 'OPEN' : 'CLOSED' };
    }));
    notifySuccess(`Vanne ouverte sur ${target.code}. Les autres cuves ${fuelBasculeGroup(target.fuelType) === 'ESSENCE' ? 'essence' : 'gazoil'} sont fermées.`);
  };

  // Lie ou délie manuellement une cuve aux pompes qu'elle alimente.
  const updateTankPumpLinks = (tankId: string, pumpIds: string[]) => {
    setTanks(prev => prev.map((t) => t.id === tankId
      ? { ...t, suppliesPumpIds: Array.from(new Set(pumpIds)) }
      : t));
  };

  const deleteStation = async (stationId: string): Promise<boolean> => {
    try {
      fetch(`/api/stations?id=${stationId}`, { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}

    setStations(prev => prev.filter(s => s.id !== stationId));
    setUsers(prev => prev.filter(u => u.stationId !== stationId));
    setTanks(prev => prev.filter(t => t.stationId !== stationId));
    setPumps(prev => prev.filter(p => p.stationId !== stationId));
    setEmployees(prev => prev.filter(e => e.stationId !== stationId));
    setSubscribers(prev => prev.filter(s => s.stationId !== stationId));
    setPayments(prev => prev.filter(p => p.stationId !== stationId));
    setExpenses(prev => prev.filter(e => e.stationId !== stationId));
    if (currentStation?.id === stationId) {
      setCurrentStation(null);
    }
    return true;
  };

  const deleteAllStations = async (): Promise<boolean> => {
    try {
      fetch('/api/stations?all=true', { method: 'DELETE' }).catch(console.warn);
    } catch (e) {}

    setStations([]);
    setCurrentStation(null);
    setUsers(prev => prev.filter(u => u.role === 'SUPER_ADMIN' || !u.stationId));
    setTanks([]);
    setPumps([]);
    setEmployees([]);
    setSubscribers([]);
    setPayments([]);
    setExpenses([]);
    setDeliveries([]);
    setPumpShifts([]);
    return true;
  };

  const deleteTank = (tankId: string) => {
    setTanks(prev => prev.filter(t => t.id !== tankId));
  };

  const deletePump = (pumpId: string) => {
    setPumps(prev => prev.filter(p => p.id !== pumpId));
  };

  // Télématique Ruptela Smart5 & Sondes Eurosens Dominator BT
  const updateTankTelematics = (tankId: string, data: Partial<TankMock>) => {
    setTanks(prev => prev.map(t => {
      if (t.id !== tankId) return t;
      const updatedLiters = data.sensorLiters !== undefined ? data.sensorLiters : (data.physicalStock !== undefined ? data.physicalStock : t.sensorLiters || t.physicalStock);
      const updatedPercent = t.capacity > 0 ? Math.min(100, Math.max(0, Math.round((updatedLiters / t.capacity) * 100))) : 0;
      return {
        ...t,
        ...data,
        sensorLiters: updatedLiters,
        sensorPercent: updatedPercent,
        physicalStock: updatedLiters, // Synchronise aussi le stock physique avec la sonde
        lastTelematicsUpdate: data.lastTelematicsUpdate || new Date().toISOString(),
        telematicsStatus: data.telematicsStatus || 'ONLINE'
      };
    }));
  };

  const configureTankSensor = (tankId: string, config: { telematicsImei: string; sensorBleMac: string; sensorIndex?: number }) => {
    setTanks(prev => prev.map(t => {
      if (t.id !== tankId) return t;
      return {
        ...t,
        telematicsImei: config.telematicsImei.trim(),
        sensorBleMac: config.sensorBleMac.trim(),
        sensorIndex: config.sensorIndex || 1,
        telematicsStatus: t.telematicsStatus || 'ONLINE'
      };
    }));
  };

  // Helper: Add User Account
  const addUser = (data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    stationId: string | null;
    stationName?: string | null;
  }): UserAccountMock => {
    const targetStation = data.stationId ? stations.find(s => s.id === data.stationId) : null;
    const newUser: UserAccountMock = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password || 'admin',
      role: data.role,
      stationId: data.stationId,
      stationName: data.stationName || (targetStation ? targetStation.name : (data.stationId ? 'Station Dédiée' : 'Supervision Réseau'))
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateUser = (userId: string, data: Partial<UserAccountMock>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const deleteEmployee = (empId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== empId));
  };

  const deleteSubscriber = (subId: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== subId));
  };

  // Helper: Record Pump Shift
  const recordPumpShift = (data: {
    pumpId: string;
    nozzleKey: NozzleKey;
    startIndex: number;
    endIndex: number;
    returnToTank: number;
    pompisteName: string;
    shiftType: 'MATIN' | 'SOIR' | 'NUIT';
    subscriberMode?: 'NONE' | 'EXISTING' | 'NEW';
    subscriberId?: string;
    subscriberLiters?: number;
    newSubscriber?: { name: string; phone: string; address: string; initialAdvance?: number };
    subscriberCredits?: Array<{
      mode: 'EXISTING' | 'NEW';
      subscriberId?: string;
      liters: number;
      newSubscriber?: { name: string; phone?: string; address?: string; initialAdvance?: number };
    }>;
  }) => {
    const pump = pumps.find(p => p.id === data.pumpId);
    if (!pump) throw new Error('Pompe non trouvée');

    // Chaque pistolet possède son propre index, son prix et son carburant.
    const legacyNozzle: PumpNozzleMock = {
      fuelType: pump.fuelType,
      tankId: pump.tankId,
      startIndex: pump.startIndex,
      endIndex: pump.endIndex,
      returnToTank: pump.returnToTank,
      unitPrice: pump.unitPrice
    };
    const nozzle = data.nozzleKey === 'P2'
      ? (pump.nozzle2 || legacyNozzle)
      : (pump.nozzle1 || legacyNozzle);
    const nozzleLabel = data.nozzleKey === 'P2' ? 'Pistolet 2' : 'Pistolet 1';

    const litersSold = Math.max(0, data.endIndex - data.startIndex - data.returnToTank);
    const totalAmount = litersSold * nozzle.unitPrice;

    // Mise à jour de l'index du pistolet concerné (le pistolet 1 reste le miroir historique).
    setPumps(prev => prev.map(p => {
      if (p.id !== data.pumpId) return p;
      const indices = { startIndex: data.startIndex, endIndex: data.endIndex, returnToTank: data.returnToTank };
      if (data.nozzleKey === 'P2') {
        return {
          ...p,
          nozzle2: { ...(p.nozzle2 || createNozzle(nozzle.fuelType, nozzle.tankId, nozzle.unitPrice)), ...indices }
        };
      }
      return {
        ...p,
        ...indices,
        nozzle1: { ...(p.nozzle1 || createNozzle(nozzle.fuelType, nozzle.tankId, nozzle.unitPrice)), ...indices }
      };
    }));

    // La cuve débitée est celle dont la vanne est ouverte dans le groupe du pistolet.
    const group = fuelBasculeGroup(nozzle.fuelType);
    const groupTanks = tanks.filter((t) => t.stationId === pump.stationId && fuelBasculeGroup(t.fuelType) === group);
    const sourceTank = groupTanks.find((t) => t.id === nozzle.tankId && t.valveStatus !== 'CLOSED' && t.currentStock > 0)
      || groupTanks.find((t) => t.valveStatus === 'OPEN' && t.currentStock > 0)
      || groupTanks.find((t) => t.currentStock > 0)
      || groupTanks.find((t) => t.id === nozzle.tankId);

    if (sourceTank) {
      setTanks(prev => prev.map(t => {
        if (t.id !== sourceTank.id) return t;
        const newStock = Math.max(0, t.currentStock - litersSold);
        return {
          ...t,
          currentStock: newStock,
          sensorLiters: newStock,
          physicalStock: newStock,
          sensorPercent: t.capacity > 0 ? Math.min(100, Math.round((newStock / t.capacity) * 100)) : 0,
          lastTelematicsUpdate: new Date().toISOString()
        };
      }));
    }

    // Identification ou création d'abonnés pendant la tournée : chaque montant
    // est calculé spécifiquement d'après les litres pris par chaque client.
    const recordedCredits: ShiftSubscriberCredit[] = [];
    let totalCreditedLiters = 0;
    let totalCreditedAmount = 0;

    // Normalisation des crédits abonnés (soit liste multiple, soit entrée unique rétro-compatible)
    const creditsToProcess = (data.subscriberCredits && data.subscriberCredits.length > 0)
      ? data.subscriberCredits
      : (data.subscriberMode && data.subscriberMode !== 'NONE')
        ? [{
            mode: data.subscriberMode,
            subscriberId: data.subscriberId,
            liters: (data.subscriberLiters && data.subscriberLiters > 0) ? data.subscriberLiters : litersSold,
            newSubscriber: data.newSubscriber
          }]
        : [];

    for (const item of creditsToProcess) {
      const itemLiters = Math.max(0, Number(item.liters) || 0);
      if (itemLiters <= 0) continue;

      let sub: SubscriberMock | undefined;
      if (item.mode === 'EXISTING' && item.subscriberId) {
        sub = subscribers.find((s) => s.id === item.subscriberId);
      } else if (item.mode === 'NEW' && item.newSubscriber?.name?.trim()) {
        sub = addSubscriber({
          code: generateSubscriberCode(),
          name: item.newSubscriber.name.trim(),
          phone: item.newSubscriber.phone || '',
          address: item.newSubscriber.address || '',
          stationId: pump.stationId,
          initialAdvance: Number(item.newSubscriber.initialAdvance) || 0,
          initialCredit: 0
        });
      }

      if (sub) {
        const itemAmount = itemLiters * nozzle.unitPrice;
        totalCreditedLiters += itemLiters;
        totalCreditedAmount += itemAmount;
        const targetSubId = sub.id;

        setSubscribers(prev => prev.map((s) => s.id === targetSubId
          ? { ...s, currentCredit: s.currentCredit + itemAmount }
          : s));

        recordedCredits.push({
          subscriberId: sub.id,
          subscriberName: sub.name,
          liters: itemLiters,
          unitPrice: nozzle.unitPrice,
          amount: itemAmount
        });
      }
    }

    const cashLiters = Math.max(0, litersSold - totalCreditedLiters);
    const cashAmount = cashLiters * nozzle.unitPrice;

    const firstCredit = recordedCredits[0];
    const shift: FuelPumpShiftMock = {
      id: `shift-${Date.now()}`,
      stationId: pump.stationId,
      pumpId: pump.id,
      pumpName: pump.name,
      fuelType: nozzle.fuelType,
      startIndex: data.startIndex,
      endIndex: data.endIndex,
      returnToTank: data.returnToTank,
      litersSold,
      unitPrice: nozzle.unitPrice,
      totalAmount,
      pompisteName: data.pompisteName,
      shiftType: data.shiftType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      nozzleKey: data.nozzleKey,
      nozzleLabel,
      subscriberId: firstCredit?.subscriberId,
      subscriberName: recordedCredits.length > 1
        ? `${recordedCredits.length} abonnés (${totalCreditedLiters.toLocaleString('fr-FR')} L)`
        : firstCredit?.subscriberName,
      creditedAmount: totalCreditedAmount,
      creditedLiters: totalCreditedLiters,
      cashLiters,
      cashAmount,
      subscriberCredits: recordedCredits
    };

    setPumpShifts(prev => [shift, ...prev]);

    const docNo = `REC-POMPE-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'BON DE SAISIE DE FEUILLE DE TOUR POMPE (CERTIFIÉ)',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: data.pompisteName,
      fields: [
        { label: 'Pompe Saisie', value: pump.name },
        { label: 'Pistolet', value: `${nozzleLabel} - ${group === 'ESSENCE' ? 'Essence' : 'Gazoil'}` },
        { label: 'Cuve en Service (Vanne)', value: sourceTank ? `${sourceTank.code} (${sourceTank.valveStatus === 'OPEN' ? 'OUVERTE' : 'FERMÉE'})` : 'Aucune cuve disponible' },
        { label: 'Quart / Tournée', value: data.shiftType },
        { label: 'Index Départ', value: data.startIndex.toLocaleString('fr-FR') },
        { label: 'Index Arrivée', value: data.endIndex.toLocaleString('fr-FR') },
        { label: 'Retour en Cuve', value: `${data.returnToTank.toLocaleString('fr-FR')} Litres` },
        { label: 'Quantité Totale Vendue', value: `${litersSold.toLocaleString('fr-FR')} Litres` },
        { label: 'Prix Unitaire', value: `${nozzle.unitPrice.toLocaleString('fr-FR')} GNF / L` },
        { label: 'VALEUR TOTALE DU CARBURANT', value: `${totalAmount.toLocaleString('fr-FR')} GNF` },
        ...(recordedCredits.map((c, i) => ({
          label: `Bon Abonné #${i + 1} (${c.subscriberName})`,
          value: `${c.liters.toLocaleString('fr-FR')} L × ${nozzle.unitPrice.toLocaleString('fr-FR')} GNF = ${c.amount.toLocaleString('fr-FR')} GNF (Crédit)`
        }))),
        ...(recordedCredits.length > 0 ? [
          { label: 'TOTAL CRÉDITS ABONNÉS', value: `${totalCreditedAmount.toLocaleString('fr-FR')} GNF (${totalCreditedLiters.toLocaleString('fr-FR')} L)` },
          { label: 'RECETTE ESPÈCES À VERSER (CASH)', value: `${cashAmount.toLocaleString('fr-FR')} GNF (${cashLiters.toLocaleString('fr-FR')} L)` }
        ] : [
          { label: 'RECETTE COMPTANT (ESPÈCES)', value: `${totalAmount.toLocaleString('fr-FR')} GNF` }
        ])
      ],
      notes: sourceTank
        ? (recordedCredits.length > 0
            ? `Tournée validée avec ${recordedCredits.length} bon(s) abonné(s) pour ${totalCreditedLiters.toLocaleString('fr-FR')} L (${totalCreditedAmount.toLocaleString('fr-FR')} GNF) portés au crédit. Espèces nettes à recouvrer : ${cashAmount.toLocaleString('fr-FR')} GNF.`
            : 'Saisie enregistrée avec succès (100% Espèces). Sortie de cuve déduite en temps réel.')
        : 'Tournée enregistrée, mais aucune cuve de ce groupe n\'est disponible : ouvrir une vanne pour débiter le stock.'
    };

    addInvoice({
      stationId: pump.stationId,
      category: 'VENTE_POMPE',
      categoryLabel: 'Vente Pompe / Quart',
      receipt,
      amount: totalAmount
    });

    return { receipt, shift };
  };

  // Helper: Saisie directe d'une vente de carburant (Mise à jour Live Cuve & Télématique)
  const recordFuelSale = (data: {
    tankId: string;
    litersSold: number;
    operatorName?: string;
    unitPrice?: number;
    pumpId?: string;
    notes?: string;
  }) => {
    const tank = tanks.find(t => t.id === data.tankId);
    if (!tank) throw new Error('Cuve introuvable');

    const litersSold = Math.max(0, data.litersSold);
    const unitPrice = data.unitPrice || 12000;
    const totalAmount = litersSold * unitPrice;
    const opName = data.operatorName || (currentUser?.name || 'Chef de Piste');

    // 1. Déduction immédiate en temps réel sur la cuve (Stock physique, Sonde Ruptela, Stock théorique)
    let updatedTank: TankMock = tank;
    setTanks(prev => prev.map(t => {
      if (t.id === data.tankId) {
        const newStock = Math.max(0, t.currentStock - litersSold);
        updatedTank = {
          ...t,
          currentStock: newStock,
          sensorLiters: newStock,
          physicalStock: newStock,
          sensorPercent: t.capacity > 0 ? Math.min(100, Math.round((newStock / t.capacity) * 100)) : 0,
          lastTelematicsUpdate: new Date().toISOString()
        };
        return updatedTank;
      }
      return t;
    }));

    // 2. Mettre à jour l'index de la pompe associée si disponible
    const targetPump = data.pumpId 
      ? pumps.find(p => p.id === data.pumpId)
      : pumps.find(p => p.tankId === tank.id);

    if (targetPump) {
      setPumps(prev => prev.map(p => {
        if (p.id !== targetPump.id) return p;
        const nozzle1 = p.nozzle1 || createNozzle(p.fuelType, p.tankId, p.unitPrice);
        const nozzle2 = p.nozzle2 || createNozzle(p.fuelType === 'GAZOIL' ? 'ESSENCE' : 'GAZOIL', p.tankId, p.unitPrice);
        const targetKey = nozzle1.tankId === tank.id || fuelBasculeGroup(nozzle1.fuelType) === fuelBasculeGroup(tank.fuelType)
          ? 'P1'
          : 'P2';
        return targetKey === 'P1'
          ? {
              ...p,
              endIndex: p.endIndex + litersSold,
              nozzle1: { ...nozzle1, endIndex: nozzle1.endIndex + litersSold }
            }
          : { ...p, nozzle2: { ...nozzle2, endIndex: nozzle2.endIndex + litersSold } };
      }));
    }

    // 3. Enregistrer dans l'historique des tournées / shifts
    const shift: FuelPumpShiftMock = {
      id: `shift-${Date.now()}`,
      stationId: tank.stationId,
      pumpId: targetPump?.id || 'direct-sale',
      pumpName: targetPump?.name || `Vente Directe - ${tank.code}`,
      fuelType: tank.fuelType,
      startIndex: targetPump?.endIndex || 0,
      endIndex: (targetPump?.endIndex || 0) + litersSold,
      returnToTank: 0,
      litersSold,
      unitPrice,
      totalAmount,
      pompisteName: opName,
      shiftType: 'MATIN',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setPumpShifts(prev => [shift, ...prev]);

    // 4. Générer le reçu certifié
    const docNo = `VTE-CARBU-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'CERTIFICAT OFFICIEL DE VENTE & SORTIE DE CUVE EN DIRECT',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: opName,
      fields: [
        { label: 'Cuve Débitée', value: `${tank.code} (${tank.fuelType})` },
        { label: 'Volume Vendu Déduit', value: `${litersSold.toLocaleString('fr-FR')} Litres` },
        { label: 'Nouveau Stock Restant', value: `${Math.max(0, tank.currentStock - litersSold).toLocaleString('fr-FR')} Litres` },
        { label: 'Prix Unitaire', value: `${unitPrice.toLocaleString('fr-FR')} GNF / L` },
        { label: 'Recette Correspondante', value: `${totalAmount.toLocaleString('fr-FR')} GNF` }
      ],
      notes: data.notes || 'Déduction télématique et physique exécutée avec succès en direct.'
    };

    addInvoice({
      stationId: tank.stationId,
      category: 'VENTE_POMPE',
      categoryLabel: 'Vente Carburant Live',
      receipt,
      amount: totalAmount
    });

    return { receipt, tank: updatedTank, litersSold };
  };

  // Helper: Record Tank Dipstick
  const recordTankDipstick = (data: {
    tankId: string;
    physicalStock: number;
    operatorName: string;
  }) => {
    const tank = tanks.find(t => t.id === data.tankId);
    if (!tank) throw new Error('Cuve introuvable');

    const gap = data.physicalStock - tank.currentStock;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedTank: TankMock = {
      ...tank,
      physicalStock: data.physicalStock,
      lastDipstickDate: nowStr
    };

    setTanks(prev => prev.map(t => t.id === data.tankId ? updatedTank : t));

    const docNo = `JAUGE-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'CERTIFICAT DE JAUGEAGE ET DE DÉTECTION D\'ÉCART CUVE',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: data.operatorName,
      fields: [
        { label: 'Cuve Concernée', value: `${tank.code} (${tank.fuelType})` },
        { label: 'Capacité Totale Cuve', value: `${tank.capacity.toLocaleString('fr-FR')} Litres` },
        { label: 'Stock Théorique (Système)', value: `${tank.currentStock.toLocaleString('fr-FR')} Litres` },
        { label: 'Stock Physique Mesuré (Jauge)', value: `${data.physicalStock.toLocaleString('fr-FR')} Litres` },
        { label: 'Écart / Coulage Détecté', value: `${gap > 0 ? '+' : ''}${gap.toLocaleString('fr-FR')} Litres (${Math.abs(gap * 12000).toLocaleString('fr-FR')} GNF)` },
        { label: 'Statut du Jaugeage', value: gap === 0 ? 'CONFORME (0 Litre d\'écart)' : (gap < 0 ? `PERTE / COULAGE (${gap} L)` : `EXCÉDENT (+${gap} L)`) }
      ],
      notes: gap < 0 
        ? 'Alerte : Perte ou coulage potentiel détecté sur cette cuve. Vérifier fuite ou décalage index.' 
        : 'Jaugeage certifié conforme.'
    };

    return { receipt, tank: updatedTank, gap };
  };

  // Helper: Record Fuel Delivery (Entrée de stock)
  const recordFuelDelivery = (data: {
    tankId: string;
    deliveryNoteNumber: string;
    truckPlate: string;
    driverName: string;
    supplier: string;
    litersDelivered: number;
    operatorName: string;
  }) => {
    const tank = tanks.find(t => t.id === data.tankId);
    if (!tank) throw new Error('Cuve introuvable');

    const delivery: FuelDeliveryMock = {
      id: `del-${Date.now()}`,
      stationId: tank.stationId,
      tankId: tank.id,
      tankCode: tank.code,
      fuelType: tank.fuelType,
      deliveryNoteNumber: data.deliveryNoteNumber,
      truckPlate: data.truckPlate,
      driverName: data.driverName,
      supplier: data.supplier,
      litersDelivered: data.litersDelivered,
      operatorName: data.operatorName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Increase tank currentStock & sync live telematics
    setTanks(prev => prev.map(t => {
      if (t.id === data.tankId) {
        const newStock = t.currentStock + data.litersDelivered;
        return {
          ...t,
          currentStock: newStock,
          sensorLiters: newStock,
          physicalStock: newStock,
          sensorPercent: t.capacity > 0 ? Math.min(100, Math.round((newStock / t.capacity) * 100)) : 0,
          lastTelematicsUpdate: new Date().toISOString()
        };
      }
      return t;
    }));

    setDeliveries(prev => [delivery, ...prev]);

    const docNo = `LIV-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'CERTIFICAT OFFICIEL DE RÉCEPTION & DÉPOTAGE CITERNE',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: data.operatorName,
      fields: [
        { label: 'N° Bon de Livraison (BL)', value: data.deliveryNoteNumber },
        { label: 'Cuve Réceptrice', value: `${tank.code} (${tank.fuelType})` },
        { label: 'Volume Dépoté / Réceptionné', value: `${data.litersDelivered.toLocaleString('fr-FR')} Litres` },
        { label: 'Camion Citerne', value: data.truckPlate },
        { label: 'Chauffeur Citerne', value: data.driverName },
        { label: 'Dépôt Expéditeur', value: data.supplier },
        { label: 'Nouveau Stock Théorique Cuve', value: `${(tank.currentStock + data.litersDelivered).toLocaleString('fr-FR')} Litres` }
      ],
      notes: 'Dépotage réceptionné conforme au bon de livraison transporteur.'
    };

    addInvoice({
      stationId: tank.stationId,
      category: 'RECEPTION_CITERNE',
      categoryLabel: 'Réception Citerne / Dépotage',
      receipt,
      amount: data.litersDelivered
    });

    return { receipt, delivery };
  };

  // Helper: Add Subscriber
  const addSubscriber = (data: {
    code: string;
    name: string;
    phone: string;
    address: string;
    stationId?: string;
    initialAdvance?: number;
    initialCredit?: number;
    creditLiters?: number;
  }) => {
    const targetStationId = data.stationId || activeStationId;
    const newSub: SubscriberMock = {
      id: `sub-${Date.now()}`,
      stationId: targetStationId,
      code: data.code.toUpperCase(),
      name: data.name.toUpperCase(),
      phone: data.phone,
      address: data.address,
      currentAdvance: data.initialAdvance || 0,
      currentCredit: data.initialCredit || 0,
      creditLiters: data.creditLiters || 0,
      lastPaymentDate: new Date().toISOString().substring(0, 10)
    };

    setSubscribers(prev => [newSub, ...prev]);
    return newSub;
  };

  // Helper: Record Subscriber Payment (Mandatory: payerName & accountNumber)
  const recordSubscriberPayment = (data: {
    subscriberId: string;
    payerName: string;
    accountNumber: string;
    paymentMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHECK' | 'CASH';
    referenceNo: string;
    amount: number;
    notes: string;
  }) => {
    if (!data.payerName.trim() || !data.accountNumber.trim()) {
      throw new Error('Le Nom du Déposant et le Numéro de Compte doivent obligatoirement être renseignés !');
    }

    const sub = subscribers.find(s => s.id === data.subscriberId);
    if (!sub) throw new Error('Abonné introuvable');

    const payment: PaymentMock = {
      id: `pay-${Date.now()}`,
      stationId: sub.stationId,
      subscriberId: sub.id,
      subscriberName: sub.name,
      payerName: data.payerName,
      accountNumber: data.accountNumber,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo || `REF-${Date.now()}`,
      amount: data.amount,
      notes: data.notes,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSubscribers(prev => prev.map(s => {
      if (s.id === data.subscriberId) {
        if (s.currentCredit > 0) {
          const newCredit = Math.max(0, s.currentCredit - data.amount);
          const extraAdvance = data.amount > s.currentCredit ? data.amount - s.currentCredit : 0;
          return {
            ...s,
            currentCredit: newCredit,
            currentAdvance: s.currentAdvance + extraAdvance,
            lastPaymentDate: new Date().toISOString().substring(0, 10)
          };
        } else {
          return {
            ...s,
            currentAdvance: s.currentAdvance + data.amount,
            lastPaymentDate: new Date().toISOString().substring(0, 10)
          };
        }
      }
      return s;
    }));

    setPayments(prev => [payment, ...prev]);

    const docNo = `VERSET-${Math.floor(10000 + Math.random() * 90000)}`;
    const receipt: ReceiptData = {
      title: 'RÉCÉPISSÉ OFFICIEL DE VERSEMENT ABONNÉ (CERTIFIÉ)',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: 'Caissier Principal Station',
      fields: [
        { label: 'Client / Abonné', value: `${sub.name} (${sub.code})` },
        { label: 'Nom du Déposant / Payeur *', value: data.payerName },
        { label: 'N° Compte / RIB / OM *', value: data.accountNumber },
        { label: 'Mode de Règlement', value: data.paymentMethod },
        { label: 'Référence Transaction / Chèque', value: payment.referenceNo },
        { label: 'MONTANT ENCAISSÉ CERTIFIÉ', value: `${data.amount.toLocaleString('fr-FR')} GNF` }
      ],
      notes: data.notes || 'Versement enregistré avec succès et répercuté sur le compte abonné.'
    };

    addInvoice({
      stationId: sub.stationId,
      category: 'PAIEMENT_ABONNE',
      categoryLabel: 'Paiement / Versement Abonné',
      receipt,
      amount: data.amount
    });

    return { receipt, payment };
  };

  // Helper: Record Subscriber Voucher / Consommation carburant à crédit
  const recordSubscriberVoucher = (data: {
    subscriberId: string;
    fuelType: FuelType;
    liters: number;
    unitPrice: number;
    vehiclePlate: string;
    driverName: string;
    voucherNo: string;
  }) => {
    const sub = subscribers.find(s => s.id === data.subscriberId);
    if (!sub) throw new Error('Abonné introuvable');

    const totalAmount = data.liters * data.unitPrice;

    setSubscribers(prev => prev.map(s => {
      if (s.id === data.subscriberId) {
        return {
          ...s,
          currentCredit: s.currentCredit + totalAmount
        };
      }
      return s;
    }));

    // Déduire les litres de la cuve dont la vanne est ouverte dans le groupe.
    const group = fuelBasculeGroup(data.fuelType);
    const groupTanks = tanks.filter((t) => t.stationId === sub.stationId && fuelBasculeGroup(t.fuelType) === group);
    const sourceTank = groupTanks.find((t) => t.valveStatus === 'OPEN' && t.currentStock > 0)
      || groupTanks.find((t) => t.currentStock > 0);

    if (sourceTank) {
      const sourceTankId = sourceTank.id;
      setTanks(prev => prev.map(t => {
        if (t.id !== sourceTankId) return t;
        const newStock = Math.max(0, t.currentStock - data.liters);
        return {
          ...t,
          currentStock: newStock,
          sensorLiters: newStock,
          physicalStock: newStock,
          sensorPercent: t.capacity > 0 ? Math.min(100, Math.round((newStock / t.capacity) * 100)) : 0,
          lastTelematicsUpdate: new Date().toISOString()
        };
      }));
    }

    const docNo = `BON-CARBU-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'BON DE CARBURANT À CRÉDIT ABONNÉ CERTIFIÉ',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: 'Chef de Piste',
      fields: [
        { label: 'Abonné Facturé', value: `${sub.name} (${sub.code})` },
        { label: 'N° Bon Client', value: data.voucherNo },
        { label: 'Immatriculation Véhicule', value: data.vehiclePlate },
        { label: 'Chauffeur Bénéficiaire', value: data.driverName },
        { label: 'Carburant Délivré', value: `${data.fuelType} - ${data.liters.toLocaleString('fr-FR')} Litres` },
        { label: 'Prix Unitaire', value: `${data.unitPrice.toLocaleString('fr-FR')} GNF` },
        { label: 'MONTANT TOTAL VALISÉ', value: `${totalAmount.toLocaleString('fr-FR')} GNF` }
      ],
      notes: 'Carburant servi sur présentation de bon régulier. Montant porté au compte crédit client.'
    };

    addInvoice({
      stationId: sub.stationId,
      category: 'BON_LIVRAISON_ABONNE',
      categoryLabel: 'Bon Carburant / Crédit Abonné',
      receipt,
      amount: totalAmount
    });

    return { receipt, totalAmount };
  };

  // Helper: Add Product
  const addProduct = (data: {
    code: string;
    name: string;
    unitType: string;
    price: number;
    stock: number;
  }) => {
    const newP: ProductMock = {
      id: `prd-${Date.now()}`,
      stationId: activeStationId,
      code: data.code.toUpperCase(),
      name: data.name.toUpperCase(),
      unitType: data.unitType,
      price: data.price,
      stock: data.stock
    };
    setProducts(prev => [newP, ...prev]);
    return newP;
  };

  // Helper: Record Product Sale
  const recordProductSale = (data: {
    productId: string;
    quantity: number;
    clientName: string;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) throw new Error('Produit introuvable');
    if (prod.stock < data.quantity) {
      throw new Error(`Stock insuffisant ! Disponible: ${prod.stock}`);
    }

    const total = prod.price * data.quantity;

    setProducts(prev => prev.map(p => 
      p.id === data.productId ? { ...p, stock: p.stock - data.quantity } : p
    ));

    const docNo = `VENTE-LUB-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'TICKET DE VENTE LUBRIFIANTS & GAZ (CERTIFIÉ)',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: 'Vendeur Boutique',
      fields: [
        { label: 'Désignation Produit', value: `${prod.name} (${prod.unitType})` },
        { label: 'Quantité Vendue', value: `${data.quantity} unité(s)` },
        { label: 'Prix Unitaire', value: `${prod.price.toLocaleString('fr-FR')} GNF` },
        { label: 'TOTAL ENCAISSÉ', value: `${total.toLocaleString('fr-FR')} GNF` },
        { label: 'Client / Destinataire', value: data.clientName || 'Comptant Boutique' },
        { label: 'Stock Restant en Rayon', value: `${prod.stock - data.quantity} unités` }
      ],
      notes: 'Paiement comptant encaissé en caisse boutique.'
    };

    addInvoice({
      stationId: activeStationId,
      category: 'VENTE_PRODUIT',
      categoryLabel: 'Vente Lubrifiant / Gaz',
      receipt,
      amount: total
    });

    return { receipt, total };
  };

  // Helper: Restock Product
  const restockProduct = (productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, stock: p.stock + quantity } : p
    ));
  };

  // Helper: Add Expense
  const addExpense = (data: {
    category: 'EDG' | 'GROUPE_ELECTROGENE' | 'TELEPHONE_INTERNET' | 'TRANSPORT' | 'ENTRETIEN_REPARATIONS' | 'FOURNITURES' | 'DIVERS';
    amount: number;
    beneficiary: string;
    notes: string;
  }) => {
    const newExp: ExpenseMock = {
      id: `exp-${Date.now()}`,
      stationId: activeStationId,
      category: data.category,
      amount: data.amount,
      beneficiary: data.beneficiary,
      notes: data.notes,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setExpenses(prev => [newExp, ...prev]);

    const docNo = `DEPENSE-${Math.floor(1000 + Math.random() * 9000)}`;
    const receipt: ReceiptData = {
      title: 'BON OFFICIEL DE SORTIE DE CAISSE CERTIFIÉ',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: 'Caissier Station',
      fields: [
        { label: 'Catégorie de Dépense', value: data.category },
        { label: 'Bénéficiaire / Fournisseur', value: data.beneficiary },
        { label: 'Montant Décaissé', value: `${data.amount.toLocaleString('fr-FR')} GNF` },
        { label: 'Motif / Description', value: data.notes }
      ],
      notes: 'Décaissement validé sur pièce justificative par le Chef de Station.'
    };

    addInvoice({
      stationId: activeStationId,
      category: 'DEPENSE',
      categoryLabel: 'Dépense de Caisse',
      receipt,
      amount: data.amount
    });

    return { receipt, expense: newExp };
  };

  // Helper: Record Bank Deposit (Versement bancaire des recettes)
  const recordBankDeposit = (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    depositorName: string;
    slipNumber: string;
    notes: string;
  }) => {
    const newExp: ExpenseMock = {
      id: `exp-bank-${Date.now()}`,
      stationId: activeStationId,
      category: 'DIVERS',
      amount: data.amount,
      beneficiary: `BANQUE: ${data.bankName} (N° ${data.accountNumber})`,
      notes: `Versement des recettes station - Bordereau N° ${data.slipNumber}. Déposant: ${data.depositorName}. ${data.notes}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setExpenses(prev => [newExp, ...prev]);

    const docNo = `BORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const receipt: ReceiptData = {
      title: 'RÉCÉPISSÉ DE VERSEMENT BANCAIRE DES RECETTES',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: data.depositorName,
      fields: [
        { label: 'Banque Réceptrice', value: data.bankName },
        { label: 'N° de Compte Station *', value: data.accountNumber },
        { label: 'Nom du Déposant / Convoyeur *', value: data.depositorName },
        { label: 'N° Bordereau de Versement', value: data.slipNumber },
        { label: 'MONTANT VERSÉ À LA BANQUE', value: `${data.amount.toLocaleString('fr-FR')} GNF` }
      ],
      notes: 'Fonds retirés de la caisse station et déposés sur le compte bancaire officiel.'
    };

    addInvoice({
      stationId: activeStationId,
      category: 'VERSEMENT_BANCAIRE',
      categoryLabel: 'Versement Bancaire Recettes',
      receipt,
      amount: data.amount
    });

    return { receipt, expense: newExp };
  };

  // Helper: Add Employee
  const addEmployee = (data: {
    fullName: string;
    jobTitle: string;
    stationId?: string;
    baseSalary: number;
    transportAllowance: number;
    livingAllowance: number;
    housingAllowance: number;
    prime?: number;
    primeLabel?: string;
  }) => {
    const prime = Number(data.prime) || 0;
    const gross = data.baseSalary + data.transportAllowance + data.livingAllowance + data.housingAllowance + prime;
    const targetStationId = data.stationId || activeStationId;
    const newEmp: EmployeeMock = {
      id: `emp-${Date.now()}`,
      stationId: targetStationId,
      fullName: data.fullName.toUpperCase(),
      jobTitle: data.jobTitle,
      baseSalary: data.baseSalary,
      transportAllowance: data.transportAllowance,
      livingAllowance: data.livingAllowance,
      housingAllowance: data.housingAllowance,
      prime,
      primeLabel: data.primeLabel || '',
      shortages: 0,
      loans: 0,
      netSalary: gross
    };

    setEmployees(prev => [newEmp, ...prev]);
    return newEmp;
  };

  // Helper: Update Employee
  const updateEmployee = (
    empId: string, 
    updates: Partial<Pick<EmployeeMock, 'shortages' | 'loans' | 'prime' | 'primeLabel' | 'baseSalary' | 'transportAllowance' | 'livingAllowance' | 'housingAllowance'>>
  ) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const updated = { ...emp, ...updates };
        const totalAllowances = updated.transportAllowance + updated.livingAllowance + updated.housingAllowance;
        const gross = updated.baseSalary + totalAllowances;
        const net = gross + (updated.prime || 0) - updated.shortages - updated.loans;
        return { ...updated, netSalary: net };
      }
      return emp;
    }));
  };

  // Helper: Generate Employee Payslip
  const generateEmployeePayslip = (empId: string): ReceiptData | null => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return null;

    // La prime est saisie à la création du pompiste : aucun ajout a posteriori.
    const prime = emp.prime || 0;
    const primeLabel = emp.primeLabel || 'Prime Exceptionnelle';
    const totalAllowances = emp.transportAllowance + emp.livingAllowance + emp.housingAllowance;
    const gross = emp.baseSalary + totalAllowances;
    const net = gross + prime - emp.shortages - emp.loans;

    const docNo = `PAIE-${new Date().getFullYear()}-${(new Date().getMonth()+1).toString().padStart(2,'0')}-${Math.floor(100 + Math.random() * 900)}`;
    const periodLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const slip: ReceiptData = {
      title: 'BULLETIN DE PAIE CERTIFIÉ DE L\'EMPLOYÉ',
      docNumber: docNo,
      stationName: activeStationName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: 'Direction Station TotalEnergies',
      fields: [
        { label: 'Nom & Prénom de l\'Employé', value: emp.fullName },
        { label: 'Poste / Fonction', value: emp.jobTitle },
        { label: 'Période de Paie', value: periodLabel },
        { label: 'Salaire de Base', value: `${emp.baseSalary.toLocaleString('fr-FR')} GNF` },
        { label: 'Primes & Indemnités (Transport, Panier, Logement)', value: `${totalAllowances.toLocaleString('fr-FR')} GNF` },
        ...(prime > 0 ? [{ label: `🏆 ${primeLabel}`, value: `+${prime.toLocaleString('fr-FR')} GNF` }] : []),
        { label: 'SALAIRE BRUT TOTAL', value: `${(gross + prime).toLocaleString('fr-FR')} GNF` },
        { label: 'Déductions Manquants Pompiste', value: emp.shortages > 0 ? `-${emp.shortages.toLocaleString('fr-FR')} GNF` : '0 GNF' },
        { label: 'Déductions Prêts & Avances', value: emp.loans > 0 ? `-${emp.loans.toLocaleString('fr-FR')} GNF` : '0 GNF' },
        { label: 'NET À PAYER COMPTANT', value: `${net.toLocaleString('fr-FR')} GNF` }
      ],
      notes: prime > 0
        ? `Bulletin arrêté et certifié conforme. ${primeLabel} accordée par la Direction pour ce mois.`
        : 'Bulletin arrêté et certifié conforme aux feuilles de tournées et aux états d\'heures.'
    };

    addInvoice({
      stationId: emp.stationId,
      category: 'SALAIRE_BULLETIN',
      categoryLabel: 'Bulletin de Salaire RH',
      receipt: slip,
      amount: net
    });

    return slip;
  };

  // Helper: Reset All Data to defaults (remise à zéro avec données officielles)
  const resetAllData = () => {
    setStations(INITIAL_STATIONS);
    setCurrentStation(null);
    setUserRole('SUPER_ADMIN');
    setUsers(INITIAL_USERS);
    setTanks(INITIAL_TANKS);
    setPumps(INITIAL_PUMPS);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setProducts(INITIAL_PRODUCTS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setEmployees(INITIAL_EMPLOYEES);
    setDeliveries(INITIAL_DELIVERIES);
    setPumpShifts(INITIAL_PUMP_SHIFTS);
    setInvoices(INITIAL_INVOICES);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V6');
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V5');
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V4');
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V3');
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V2');
      localStorage.removeItem('TOTALENERGIES_STATION_MANAGER_V1');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  };

  return (
    <StationContext.Provider
      value={{
        // Auth
        currentUser,
        isAuthReady: isClient,
        login,
        logout,
        switchUserDemo,
        allUsers: users,
        // Navigation
        stations,
        currentStation,
        setCurrentStation,
        userRole,
        setUserRole,
        addStation,
        addTankToStation,
        addPumpToStation,
        switchTankValve,
        updateTankPumpLinks,
        deleteStation,
        deleteAllStations,
        deleteTank,
        deletePump,
        updateTankTelematics,
        configureTankSensor,
        // Users & Personnel
        users,
        addUser,
        deleteUser,
        updateUser,
        deleteEmployee,
        deleteSubscriber,
        // Data
        tanks,
        pumps,
        subscribers,
        products,
        payments,
        expenses,
        employees,
        deliveries,
        pumpShifts,
        invoices,
        addInvoice,
        // Actions
        recordPumpShift,
        recordFuelSale,
        recordTankDipstick,
        recordFuelDelivery,
        addSubscriber,
        recordSubscriberPayment,
        recordSubscriberVoucher,
        addProduct,
        recordProductSale,
        restockProduct,
        addExpense,
        recordBankDeposit,
        addEmployee,
        updateEmployee,
        generateEmployeePayslip,
        resetAllData,
        // Alerts & Confirmation
        alerts,
        notify,
        notifySuccess,
        notifyError,
        notifyWarning,
        notifyInfo,
        removeAlert,
        confirmModal,
        askConfirm,
        closeConfirm,
        // Codes Automatiques
        generateSubscriberCode,
        generateVoucherNumber,
        generateProductCode,
        generateStationCode,
        generateDeliveryNoteNumber
      }}
    >
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}
