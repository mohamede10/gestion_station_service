"use client";

import React, { useState, useMemo } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  FileText, 
  Fuel, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  DollarSign, 
  Users, 
  Receipt, 
  Building2, 
  Calendar, 
  Search, 
  ArrowRight, 
  Printer, 
  Clock, 
  Filter, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';
import { InvoiceCategory, GeneratedInvoiceMock } from '@/lib/data-mock';

// Définition des catégories de services pour l'affichage
interface ServiceCategoryConfig {
  id: InvoiceCategory;
  label: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
}

const SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  {
    id: 'RECEPTION_CITERNE',
    label: 'Réception Citerne (Dépotage)',
    subtitle: 'Bons de livraison hydrocarbures & certificats de dépotage',
    description: 'Enregistrement des camions citernes, volume dépoté en cuve, bon de livraison (BL) et transporteur.',
    icon: Truck,
    color: 'from-blue-600 to-cyan-600',
    bgLight: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-cyan-400'
  },
  {
    id: 'VENTE_POMPE',
    label: 'Ventes Carburants & Pompes',
    subtitle: 'Tickets de ventes pompes, relevés d\'index & quarts',
    description: 'Recettes pompes par tournée/quart de travail, sorties cuves et certificats de déduction instantanée.',
    icon: Fuel,
    color: 'from-red-600 to-amber-600',
    bgLight: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400'
  },
  {
    id: 'BON_LIVRAISON_ABONNE',
    label: 'Bons de Livraison & Crédit Abonnés',
    subtitle: 'Bons de carburant délivrés sur compte client / flotte',
    description: 'Bons carburants émis par immatriculation véhicule, chauffeur et imputation sur compte crédit abonné.',
    icon: FileText,
    color: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400'
  },
  {
    id: 'PAIEMENT_ABONNE',
    label: 'Récépissés Règlements Abonnés',
    subtitle: 'Récépissés officiels de versement & recharges de compte',
    description: 'Versements bancaires, chèques et Mobile Money reçus des entreprises et clients abonnés.',
    icon: CreditCard,
    color: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400'
  },
  {
    id: 'VENTE_PRODUIT',
    label: 'Boutique, Lubrifiants & Gaz',
    subtitle: 'Factures & tickets de caisse lubrifiants, bidons et gaz',
    description: 'Ventes comptoir de lubrifiants TotalEnergies, bouteilles de gaz et produits d\'entretien.',
    icon: ShoppingBag,
    color: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400'
  },
  {
    id: 'SALAIRE_BULLETIN',
    label: 'Bulletins de Paie & RH',
    subtitle: 'Bulletins de salaire certifiés du personnel & primes',
    description: 'Fiches de paie mensuelles, indemnités, primes exceptionnelles accordées et retenues sur salaires.',
    icon: Users,
    color: 'from-pink-600 to-rose-600',
    bgLight: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400'
  },
  {
    id: 'DEPENSE',
    label: 'Dépenses & Sorties de Caisse',
    subtitle: 'Bons de décaissement charges d\'exploitation',
    description: 'Bons de sortie de caisse pour carburant groupe, électricité EDG, entretien et fournitures.',
    icon: DollarSign,
    color: 'from-red-600 to-rose-700',
    bgLight: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400'
  },
  {
    id: 'VERSEMENT_BANCAIRE',
    label: 'Versements Bancaires Recettes',
    subtitle: 'Bordereaux de dépôt bancaire des recettes station',
    description: 'Bordereaux de transfert des espèces de la station vers les comptes bancaires d\'encaissement.',
    icon: Building2,
    color: 'from-blue-700 to-indigo-700',
    bgLight: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400'
  }
];

export default function FacturesPage() {
  const { 
    invoices, 
    deliveries, 
    pumpShifts, 
    payments, 
    expenses, 
    employees, 
    currentStation, 
    stations
  } = useStation();

  const activeStationName = currentStation ? currentStation.name : 'VUE CONSOLIDÉE (Toutes Stations)';

  // État de sélection de catégorie (null = vue liste des catégories, sinon la catégorie sélectionnée)
  const [selectedCategory, setSelectedCategory] = useState<InvoiceCategory | null>(null);

  // Recherche & filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState<string>(currentStation ? currentStation.id : 'ALL');

  // Modal d'affichage / impression de la facture
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);

  // Construction de l'historique consolidé (invoices explicites + dérivations rétrocompatibles)
  const allInvoices = useMemo(() => {
    const list: GeneratedInvoiceMock[] = [...invoices];
    const existingDocNumbers = new Set(invoices.map(i => i.docNumber));

    // 1. Dérivations des Réceptions Citernes si non déjà enregistrées
    deliveries.forEach(del => {
      const docNo = `BL-${del.deliveryNoteNumber}`;
      if (!existingDocNumbers.has(docNo)) {
        list.push({
          id: `del-inv-${del.id}`,
          stationId: del.stationId,
          category: 'RECEPTION_CITERNE',
          categoryLabel: 'Réception Citerne / Dépotage',
          title: 'CERTIFICAT OFFICIEL DE RÉCEPTION & DÉPOTAGE CITERNE',
          docNumber: del.deliveryNoteNumber,
          stationName: stations.find(s => s.id === del.stationId)?.name || 'TotalEnergies Station',
          timestamp: del.timestamp,
          operatorName: del.operatorName,
          amount: del.litersDelivered,
          fields: [
            { label: 'N° Bon de Livraison (BL)', value: del.deliveryNoteNumber },
            { label: 'Cuve Réceptrice', value: `${del.tankCode} (${del.fuelType})` },
            { label: 'Volume Réceptionné', value: `${del.litersDelivered.toLocaleString('fr-FR')} Litres` },
            { label: 'Camion Citerne', value: del.truckPlate },
            { label: 'Chauffeur', value: del.driverName },
            { label: 'Fournisseur / Dépôt', value: del.supplier }
          ],
          notes: 'Dépotage réceptionné conforme au bon de livraison transporteur.'
        });
      }
    });

    // 2. Dérivations des Quarts Pompes
    pumpShifts.forEach(shift => {
      const docNo = `SHIFT-${shift.id}`;
      if (!existingDocNumbers.has(docNo)) {
        list.push({
          id: `shift-inv-${shift.id}`,
          stationId: shift.stationId,
          category: 'VENTE_POMPE',
          categoryLabel: 'Vente Pompe / Quart',
          title: 'CERTIFICAT OFFICIEL DE VENTE & FIN DE QUART POMPE',
          docNumber: docNo,
          stationName: stations.find(s => s.id === shift.stationId)?.name || 'TotalEnergies Station',
          timestamp: shift.timestamp,
          operatorName: shift.pompisteName,
          amount: shift.totalAmount,
          fields: [
            { label: 'Pompe', value: `${shift.pumpName} (${shift.fuelType})` },
            { label: 'Quart / Tournée', value: shift.shiftType },
            { label: 'Index Départ', value: shift.startIndex.toLocaleString('fr-FR') },
            { label: 'Index Arrivée', value: shift.endIndex.toLocaleString('fr-FR') },
            { label: 'Retour en Cuve', value: `${shift.returnToTank.toLocaleString('fr-FR')} L` },
            { label: 'Quantité Nette Vendue', value: `${shift.litersSold.toLocaleString('fr-FR')} L` },
            { label: 'Prix Unitaire', value: `${shift.unitPrice.toLocaleString('fr-FR')} GNF / L` },
            { label: 'RECETTE TOTALE', value: `${shift.totalAmount.toLocaleString('fr-FR')} GNF` }
          ],
          notes: 'Relevé de quart certifié conforme aux compteurs volumétriques.'
        });
      }
    });

    // 3. Dérivations des Versements Abonnés
    payments.forEach(pay => {
      const docNo = `PAY-${pay.id}`;
      if (!existingDocNumbers.has(docNo)) {
        list.push({
          id: `pay-inv-${pay.id}`,
          stationId: pay.stationId,
          category: 'PAIEMENT_ABONNE',
          categoryLabel: 'Paiement / Versement Abonné',
          title: 'RÉCÉPISSÉ OFFICIEL DE VERSEMENT ABONNÉ',
          docNumber: pay.referenceNo || docNo,
          stationName: stations.find(s => s.id === pay.stationId)?.name || 'TotalEnergies Station',
          timestamp: pay.timestamp,
          operatorName: 'Caisse Principale',
          amount: pay.amount,
          fields: [
            { label: 'Abonné / Client', value: pay.subscriberName || 'Client Abonné' },
            { label: 'Nom du Déposant', value: pay.payerName },
            { label: 'N° Compte / Réf', value: pay.accountNumber },
            { label: 'Mode de Règlement', value: pay.paymentMethod },
            { label: 'MONTANT ENCAISSÉ', value: `${pay.amount.toLocaleString('fr-FR')} GNF` }
          ],
          notes: pay.notes || 'Versement enregistré avec succès.'
        });
      }
    });

    // 4. Dérivations des Dépenses de Caisse
    expenses.forEach(exp => {
      const isBank = exp.category === 'DIVERS' && exp.beneficiary.startsWith('BANQUE:');
      const cat: InvoiceCategory = isBank ? 'VERSEMENT_BANCAIRE' : 'DEPENSE';
      const docNo = `EXP-${exp.id}`;
      if (!existingDocNumbers.has(docNo)) {
        list.push({
          id: `exp-inv-${exp.id}`,
          stationId: exp.stationId,
          category: cat,
          categoryLabel: isBank ? 'Versement Bancaire Recettes' : 'Dépense de Caisse',
          title: isBank ? 'RÉCÉPISSÉ DE VERSEMENT BANCAIRE' : 'BON DE SORTIE DE CAISSE DÉPENSE',
          docNumber: docNo,
          stationName: stations.find(s => s.id === exp.stationId)?.name || 'TotalEnergies Station',
          timestamp: exp.timestamp,
          operatorName: 'Caissier Station',
          amount: exp.amount,
          fields: [
            { label: 'Catégorie', value: exp.category },
            { label: 'Bénéficiaire', value: exp.beneficiary },
            { label: 'Montant', value: `${exp.amount.toLocaleString('fr-FR')} GNF` },
            { label: 'Description', value: exp.notes }
          ],
          notes: exp.notes
        });
      }
    });

    return list;
  }, [invoices, deliveries, pumpShifts, payments, expenses, stations]);

  // Filtrage selon la station sélectionnée
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter(inv => {
      if (currentStation && inv.stationId && inv.stationId !== currentStation.id) {
        return false;
      }
      if (stationFilter !== 'ALL' && inv.stationId && inv.stationId !== stationFilter) {
        return false;
      }
      return true;
    });
  }, [allInvoices, currentStation, stationFilter]);

  // Compteur par catégorie
  const countByCategory = useMemo(() => {
    const counts: Record<string, { count: number; totalAmount: number }> = {};
    SERVICE_CATEGORIES.forEach(cat => {
      counts[cat.id] = { count: 0, totalAmount: 0 };
    });

    filteredInvoices.forEach(inv => {
      if (counts[inv.category]) {
        counts[inv.category].count += 1;
        counts[inv.category].totalAmount += (inv.amount || 0);
      }
    });

    return counts;
  }, [filteredInvoices]);

  // Factures de la catégorie active
  const categoryInvoices = useMemo(() => {
    if (!selectedCategory) return [];
    let list = filteredInvoices.filter(i => i.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => 
        i.docNumber.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.operatorName.toLowerCase().includes(q) ||
        i.fields.some(f => String(f.value).toLowerCase().includes(q) || f.label.toLowerCase().includes(q))
      );
    }

    return list;
  }, [filteredInvoices, selectedCategory, searchQuery]);

  // Ouvrir le modal officiel pour impression / visualisation
  const handleOpenReceipt = (invoice: GeneratedInvoiceMock) => {
    const data: ReceiptData = {
      title: invoice.title,
      docNumber: invoice.docNumber,
      stationName: invoice.stationName,
      timestamp: invoice.timestamp,
      operatorName: invoice.operatorName,
      fields: invoice.fields,
      notes: invoice.notes
    };
    setActiveReceipt(data);
    setReceiptModalOpen(true);
  };

  const activeCategoryConfig = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* En-tête Principal */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" /> REGISTRE CENTRAL & HISTORIQUE DES FACTURES
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Historique des Factures & Documents Certifiés
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Classement méthodique par catégorie de service : Réception Citerne, Ventes Pompes, Bons Abonnés, Salaires, Dépenses...
          </p>
        </div>

        {/* Total consolidé */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Pièces Enregistrées</div>
            <div className="text-lg font-black text-white font-mono">{filteredInvoices.length}</div>
          </div>
        </div>
      </div>

      {/* VUE 1 : LISTE DES CATÉGORIES DE SERVICES */}
      {!selectedCategory ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-red-500" /> Choisissez un service pour consulter ses factures
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {SERVICE_CATEGORIES.length} catégories disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const stats = countByCategory[cat.id] || { count: 0, totalAmount: 0 };

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`group relative bg-slate-900 border border-slate-800 hover:${cat.borderColor} p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-slate-950/50 flex flex-col justify-between overflow-hidden`}
                >
                  {/* Effet lumineux en arrière-plan */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cat.color} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition`}></div>

                  <div>
                    {/* Badge d'icône & compteur */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-950 border border-slate-800 text-white font-mono">
                          {stats.count} pièce{stats.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-white text-base group-hover:text-red-400 transition">
                      {cat.label}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1 line-clamp-1">
                      {cat.subtitle}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition flex items-center gap-1">
                      Voir les factures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VUE 2 : DÉTAIL DES FACTURES DE LA CATÉGORIE SÉLECTIONNÉE */
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          
          {/* Barre de retour et titre de la catégorie */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" /> Retour aux Catégories
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activeCategoryConfig?.color}`}></span>
                  <h3 className="text-lg font-black text-white">
                    {activeCategoryConfig?.label}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {categoryInvoices.length} document{categoryInvoices.length > 1 ? 's' : ''} trouvé{categoryInvoices.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par N°, client, immat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Liste des factures */}
          {categoryInvoices.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Aucun document dans cette catégorie</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Aucune facture ou certificat n'a encore été généré pour ce service. Les nouvelles transactions apparaîtront ici automatiquement dès leur validation.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                Retourner aux Catégories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
                >
                  <div className="space-y-3">
                    {/* Header carte facture */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-wider block">
                          N° {inv.docNumber}
                        </span>
                        <h4 className="font-extrabold text-sm text-white line-clamp-1 mt-0.5">
                          {inv.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-950 border border-slate-800 text-slate-300 shrink-0">
                        Certifié
                      </span>
                    </div>

                    {/* Champs clés */}
                    <div className="space-y-1.5 text-xs">
                      {inv.fields.slice(0, 4).map((f, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-300">
                          <span className="text-slate-400 text-[11px] truncate max-w-[140px]">{f.label} :</span>
                          <span className="font-bold text-white text-[11px] text-right truncate max-w-[160px] font-mono">
                            {f.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Horodatage & opérateur */}
                    <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                      <span className="flex items-center gap-1 truncate">
                        <Clock className="w-3 h-3" /> {inv.timestamp}
                      </span>
                      <span className="truncate max-w-[120px]">
                        Opérateur: <strong>{inv.operatorName}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Bouton pour ouvrir / imprimer la facture */}
                  <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                    {inv.amount !== undefined && (
                      <div>
                        <span className="text-[10px] text-slate-400 block">Montant / Volume</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {typeof inv.amount === 'number' ? inv.amount.toLocaleString('fr-FR') : inv.amount}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleOpenReceipt(inv)}
                      className="ml-auto px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-red-950/40 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Voir / Imprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Officiel de Facture / Récépissé */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={activeReceipt}
      />

    </div>
  );
}
