"use client";

import React, { useState } from 'react';
import { useStation } from '@/context/StationContext';
import { 
  PackageCheck, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  PlusCircle, 
  PackagePlus, 
  TrendingUp 
} from 'lucide-react';
import ReceiptModal, { ReceiptData } from '@/components/ReceiptModal';

export default function LubrifiantsPage() {
  const { 
    currentStation, 
    products, 
    recordProductSale, 
    addProduct, 
    restockProduct 
  } = useStation();

  const isGlobal = !currentStation;
  const filteredProducts = isGlobal ? products : products.filter(p => p.stationId === currentStation.id);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'SALE' | 'RESTOCK' | 'NEW_PROD'>('SALE');

  // Vente Flash State
  const [selectedProductId, setSelectedProductId] = useState<string>(filteredProducts[0]?.id || '');
  const [saleQty, setSaleQty] = useState<string>('1');
  const [clientName, setClientName] = useState<string>('Comptant Boutique');

  // Restock State
  const [restockProductId, setRestockProductId] = useState<string>(filteredProducts[0]?.id || '');
  const [restockQty, setRestockQty] = useState<string>('10');

  // New Product State
  const [newCode, setNewCode] = useState<string>('LUB-0' + (products.length + 1));
  const [newName, setNewName] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('BIDON 5L');
  const [newPrice, setNewPrice] = useState<string>('350000');
  const [newStock, setNewStock] = useState<string>('20');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Handlers
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      const { receipt } = recordProductSale({
        productId: selectedProductId,
        quantity: parseFloat(saleQty) || 0,
        clientName
      });
      setReceiptData(receipt);
      setReceiptModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la vente');
    }
  };

  const handleSaveRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) return;

    const qty = parseFloat(restockQty) || 0;
    restockProduct(restockProductId, qty);
    const prod = filteredProducts.find(p => p.id === restockProductId);
    alert(`Réapprovisionnement de +${qty} unités validé pour "${prod?.name || 'le produit'}" !`);
    setActiveTab('SALE');
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const prod = addProduct({
      code: newCode,
      name: newName,
      unitType: newUnit,
      price: parseFloat(newPrice) || 0,
      stock: parseFloat(newStock) || 0
    });

    alert(`Nouveau produit "${prod.name}" ajouté au catalogue boutique !`);
    setNewName('');
    setActiveTab('SALE');
  };

  const filtered = filteredProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProd = filteredProducts.find(p => p.id === selectedProductId) || filteredProducts[0];
  const totalSaleAmount = (selectedProd?.price || 0) * (parseFloat(saleQty) || 0);

  const totalInventoryValue = filteredProducts.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <PackageCheck className="w-4 h-4" /> MODULE LUBRIFIANTS, GAZ & BOUTIQUE TOTALENERGIES
          </div>
          <h2 className="text-2xl font-black text-white">Catalogue Produits, Ventes Flash & Stocks Boutique</h2>
          <p className="text-xs text-slate-400 mt-1">
            Gamme Quartz, Rubia, bouteilles de gaz TotalEnergies, fûts en vrac avec suivi des stocks et encaissements.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('SALE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'SALE' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            Vente Flash
          </button>
          <button
            onClick={() => setActiveTab('RESTOCK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'RESTOCK' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Réapprovisionnement
          </button>
          <button
            onClick={() => setActiveTab('NEW_PROD')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'NEW_PROD' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            + Nouveau Produit
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TAB: Vente Flash */}
        {activeTab === 'SALE' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-white text-base">Enregistrer Vente Boutique</h3>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sélectionner le Produit :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-amber-500"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {filteredProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unitType}) - Stock : {p.stock} | {p.price.toLocaleString('fr-FR')} GNF
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantité Vendue :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-base outline-none focus:border-amber-500"
                  value={saleQty}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setSaleQty(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nom du Client / Acheteur :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Prix Unitaire :</span>
                  <span className="font-mono text-slate-200">{(selectedProd?.price || 0).toLocaleString('fr-FR')} GNF</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-sm font-black">
                  <span className="text-slate-300">TOTAL À RECOUVRER :</span>
                  <span className="text-amber-400">{totalSaleAmount.toLocaleString('fr-FR')} GNF</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Encaisser & Imprimer Ticket de Caisse
              </button>
            </form>
          </div>
        )}

        {/* TAB: Réapprovisionnement */}
        {activeTab === 'RESTOCK' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <PackagePlus className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-white text-base">Entrée de Stock Boutique</h3>
            </div>

            <form onSubmit={handleSaveRestock} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Produit à Réapprovisionner :</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-bold outline-none focus:border-blue-500"
                  value={restockProductId}
                  onChange={(e) => setRestockProductId(e.target.value)}
                >
                  {filteredProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unitType}) - Stock Actuel : {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantité Reçue (Unités) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold text-base outline-none focus:border-blue-500"
                  value={restockQty}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setRestockQty(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" /> Enregistrer l'Entrée en Stock
              </button>
            </form>
          </div>
        )}

        {/* TAB: Nouveau Produit */}
        {activeTab === 'NEW_PROD' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base">Ajouter au Catalogue</h3>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Code Article :</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold outline-none focus:border-emerald-500"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nom Commercial :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: QUARTZ INEO MC3 5W-30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-emerald-500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Conditionnement :</label>
                  <input
                    type="text"
                    required
                    placeholder="BIDON 5L, BOUTEILLE..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prix Vente (GNF) :</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="ex: 350000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500"
                    value={newPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Stock Initial :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="ex: 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  value={newStock}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNewStock(e.target.value.replace(/[^0-9.]/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" /> Créer l'Article Boutique
              </button>
            </form>
          </div>
        )}

        {/* Product Inventory List (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-amber-400" />
                Stock Disponible Boutique ({filtered.length} articles)
              </h3>
              <span className="text-[11px] text-slate-400">
                Valeur marchande totale du stock : <strong className="text-amber-400">{totalInventoryValue.toLocaleString('fr-FR')} GNF</strong>
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher article..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((prod) => (
              <div key={prod.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{prod.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                    {prod.unitType}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    Stock : <strong className={`font-bold ${prod.stock < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{prod.stock} unités</strong>
                  </span>
                  <span className="font-black text-amber-400">{prod.price.toLocaleString('fr-FR')} GNF</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Certified Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        data={receiptData}
      />

    </div>
  );
}
