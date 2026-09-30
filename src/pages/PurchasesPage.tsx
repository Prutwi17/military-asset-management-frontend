import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ShoppingBag, Eye, Calendar, RefreshCw, Building2 } from 'lucide-react';
import { Purchase, Base, AssetCategory, CreatePurchaseInput, Asset } from '../types';
import { purchaseApi, baseApi, assetApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const PurchasesPage: React.FC = () => {
  const { user } = useAuth();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Add Purchase Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  // Form state
  const [refNumber, setRefNumber] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('VEHICLE');
  const [equipmentType, setEquipmentType] = useState('');
  const [baseId, setBaseId] = useState<number>(user?.base?.id || 4);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Units');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBases = async () => {
    try {
      const data = await baseApi.getAll();
      setBases(data);
      if (data.length > 0 && !user?.base?.id) {
        setBaseId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const fetchAssetsForSelection = async () => {
    try {
      const data = await assetApi.getAll();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets list:', err);
    }
  };

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchaseApi.getAll({
        category: (selectedCategory as AssetCategory) || undefined,
        baseId: selectedBase ? Number(selectedBase) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setPurchases(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load purchase records.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedBase, startDate, endDate, searchKeyword]);

  useEffect(() => {
    fetchBases();
    fetchAssetsForSelection();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleAssetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAssetId(val);
    if (val) {
      const matched = assets.find((a) => a.id === Number(val));
      if (matched) {
        setAssetName(matched.name);
        setCategory(matched.category);
        setEquipmentType(matched.equipmentType || '');
        setBaseId(matched.baseId);
        setUnit(matched.unit || 'Units');
        if (matched.purchasePrice) {
          setUnitPrice(String(matched.purchasePrice));
        }
      }
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      setFormError('Asset / Equipment Name is required.');
      return;
    }
    if (!supplier.trim()) {
      setFormError('Supplier / Vendor Name is required.');
      return;
    }
    if (!quantity || quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const parsedUnitPrice = unitPrice ? Number(unitPrice) : undefined;
      const calculatedTotal = parsedUnitPrice ? parsedUnitPrice * quantity : undefined;

      const input: CreatePurchaseInput = {
        referenceNumber: refNumber.trim() || undefined,
        assetId: selectedAssetId ? Number(selectedAssetId) : undefined,
        assetName: assetName.trim(),
        category,
        equipmentType: equipmentType.trim() || undefined,
        baseId: Number(baseId),
        quantity: Number(quantity),
        unit: unit.trim() || 'Units',
        unitPrice: parsedUnitPrice,
        totalAmount: calculatedTotal,
        purchaseDate,
        supplier: supplier.trim(),
        notes: notes.trim() || undefined,
      };

      await purchaseApi.create(input);
      setIsAddModalOpen(false);
      resetForm();
      await fetchPurchases();
      await fetchAssetsForSelection();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Failed to record purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRefNumber('');
    setSelectedAssetId('');
    setAssetName('');
    setCategory('VEHICLE');
    setEquipmentType('');
    setBaseId(user?.base?.id || (bases[0]?.id || 4));
    setQuantity(1);
    setUnit('Units');
    setUnitPrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setSupplier('');
    setNotes('');
    setFormError(null);
  };

  const formatCurrency = (amt?: number) => {
    if (!amt) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amt);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Row matching ui-reference.png */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchases</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage equipment procurement, purchase orders, and inventory balance receipts
          </p>
        </div>

        {/* Action Button: + Add Purchase */}
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow px-4 py-2 rounded-lg"
        >
          Add Purchase
        </Button>
      </div>

      {/* Filter Bar matching ui-reference.png table styling */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          <option value="VEHICLE">Vehicles</option>
          <option value="WEAPON">Weapons</option>
          <option value="AMMUNITION">Ammunition</option>
          <option value="COMMUNICATION">Communication</option>
          <option value="IT_EQUIPMENT">IT Equipment</option>
          <option value="OTHER">Others</option>
        </select>

        {/* Base Filter */}
        {user?.role !== 'BASE_COMMANDER' && bases.length > 0 && (
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-0 p-0 text-xs text-slate-700 focus:ring-0"
            title="Start Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-0 p-0 text-xs text-slate-700 focus:ring-0"
            title="End Date"
          />
        </div>

        {/* Search Input on Right */}
        <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search reference, asset, vendor..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={fetchPurchases}
          title="Refresh List"
          className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Purchases Data Table */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-4">Asset / Equipment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Destination</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading procurement records...</span>
                    </div>
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No purchase records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Log a new procurement order to record incoming inventory receipts
                    </p>
                  </td>
                </tr>
              ) : (
                purchases.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setViewPurchase(po)}
                  >
                    {/* PO Reference */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {po.referenceNumber}
                    </td>

                    {/* Asset Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {po.assetName}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {po.category}
                    </td>

                    {/* Base */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {po.baseName}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      +{po.quantity} {po.unit}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(po.totalAmount)}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                      {po.supplier}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {po.purchaseDate}
                    </td>

                    {/* Details Action */}
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setViewPurchase(po)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Purchase Information"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {purchases.length} procurement orders</span>
          <span className="font-mono text-[11px] text-slate-400">AUDITABLE PURCHASE LOG</span>
        </div>
      </div>

      {/* Add Purchase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Purchase Order"
        subtitle="Receipt increases equipment inventory balance at destination base"
        maxWidth="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleCreatePurchase}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Purchase Receipt
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreatePurchase} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Quick link existing asset */}
          {assets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Link to Existing Asset (Optional)
              </label>
              <select
                value={selectedAssetId}
                onChange={handleAssetSelect}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">-- New / Unlisted Equipment --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.assetCode}] {a.name} ({a.baseName} - Current Qty: {a.quantity})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecting an existing asset automatically increases its inventory balance upon receipt.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                PO / Reference Number
              </label>
              <input
                type="text"
                placeholder="Auto-generated if left blank"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Asset / Equipment Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. T-90 Tank, Tactical Radio"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="VEHICLE">Vehicle</option>
                <option value="WEAPON">Weapon</option>
                <option value="AMMUNITION">Ammunition</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="IT_EQUIPMENT">IT Equipment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Equipment Type
              </label>
              <input
                type="text"
                placeholder="e.g. Main Battle Tank, Assault Rifle"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Destination Base *
              </label>
              <select
                value={baseId}
                disabled={user?.role === 'BASE_COMMANDER'}
                onChange={(e) => setBaseId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="Units, Rifles, Sets"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1200.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Supplier / Vendor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ordnance Factory, Heavy Vehicles Factory"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Procurement Notes / Justification
            </label>
            <textarea
              rows={2}
              placeholder="Contract details, supply requisition reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal
        isOpen={!!viewPurchase}
        onClose={() => setViewPurchase(null)}
        title="Purchase Order Information"
        subtitle={`Ref: ${viewPurchase?.referenceNumber}`}
        footer={
          <Button variant="primary" size="sm" onClick={() => setViewPurchase(null)}>
            Close
          </Button>
        }
      >
        {viewPurchase && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Equipment Name</span>
                <span className="font-bold text-slate-900">{viewPurchase.assetName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="text-slate-800 font-medium">{viewPurchase.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Assigned Destination Base</span>
                <span className="font-semibold text-blue-700">{viewPurchase.baseName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Quantity Added</span>
                <span className="font-mono font-bold text-emerald-700">
                  +{viewPurchase.quantity} {viewPurchase.unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(viewPurchase.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Supplier</span>
                <span className="text-slate-800">{viewPurchase.supplier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Purchase Date</span>
                <span className="font-mono text-slate-700">{viewPurchase.purchaseDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Recorded By</span>
                <span className="text-slate-700 font-medium">{viewPurchase.createdBy}</span>
              </div>
            </div>

            {viewPurchase.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Procurement Notes</p>
                <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs">
                  {viewPurchase.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
