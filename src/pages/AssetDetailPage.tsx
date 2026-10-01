import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Shield,
  Layers,
  ShoppingBag,
  ArrowRightLeft,
  UserCheck,
  TrendingDown,
  Activity,
  Calendar,
  Building2,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  Asset,
  Base,
  AssetStatus,
  CreateAssetInput,
  Purchase,
  Transfer,
  Assignment,
  Expenditure,
} from '../types';
import {
  assetApi,
  baseApi,
  purchaseApi,
  transferApi,
  assignmentApi,
  expenditureApi,
} from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AddEditAssetModal } from '../components/assets/AddEditAssetModal';
import { AssetImage } from '../components/common/AssetImage';
import { useAuth } from '../context/AuthContext';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction history state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [activeTab, setActiveTab] = useState<'purchases' | 'transfers' | 'assignments' | 'expenditures'>('purchases');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<AssetStatus>('AVAILABLE');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssetDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await assetApi.getById(Number(id));
      setAsset(data);
      setSelectedNewStatus(data.status);

      // Load related transactions for this asset
      loadAssetHistory(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load asset details or access denied under your security clearance.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadAssetHistory = async (targetAsset: Asset) => {
    setIsLoadingHistory(true);
    try {
      const [purchasesRes, transfersRes, assignmentsRes, expendituresRes] = await Promise.allSettled([
        purchaseApi.getAll({ keyword: targetAsset.assetCode }),
        transferApi.getAll({ keyword: targetAsset.assetCode }),
        assignmentApi.getAll({ keyword: targetAsset.assetCode }),
        expenditureApi.getAll({ keyword: targetAsset.assetCode }),
      ]);

      if (purchasesRes.status === 'fulfilled') setPurchases(purchasesRes.value || []);
      if (transfersRes.status === 'fulfilled') setTransfers(transfersRes.value || []);
      if (assignmentsRes.status === 'fulfilled') setAssignments(assignmentsRes.value || []);
      if (expendituresRes.status === 'fulfilled') setExpenditures(expendituresRes.value || []);
    } catch (err) {
      console.error('Failed to load asset history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
    baseApi.getAll().then(setBases).catch(console.error);
  }, [fetchAssetDetails]);

  const handleUpdateAsset = async (input: CreateAssetInput) => {
    if (!asset) return;
    await assetApi.update(asset.id, input);
    await fetchAssetDetails();
  };

  const handleStatusChange = async () => {
    if (!asset) return;
    setIsUpdatingStatus(true);
    try {
      await assetApi.changeStatus(asset.id, selectedNewStatus, statusNotes);
      setIsStatusModalOpen(false);
      setStatusNotes('');
      await fetchAssetDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update asset status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAsset = async () => {
    if (!asset) return;
    setIsDeleting(true);
    try {
      await assetApi.delete(asset.id);
      navigate('/assets');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status?: AssetStatus) => {
    switch (status) {
      case 'IN_USE':
        return <Badge variant="in-use">In Use</Badge>;
      case 'AVAILABLE':
        return <Badge variant="available">Available</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="maintenance">Maintenance</Badge>;
      case 'DEPLOYED':
        return <Badge variant="deployed">Deployed</Badge>;
      case 'DECOMMISSIONED':
        return <Badge variant="rejected">Decommissioned</Badge>;
      default:
        return <Badge variant="neutral">{status || 'UNKNOWN'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono tracking-wider">RETRIEVING ASSET INFORMATION...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-4">
        <Link to="/assets" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assets</span>
        </Link>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <p className="font-bold">Error Accessing Asset</p>
          <p className="text-xs text-rose-600 mt-1">{error || 'Asset not found.'}</p>
        </div>
      </div>
    );
  }

  // Calculated inventory figures
  const totalAssigned = assignments
    .filter((a) => a.status === 'ACTIVE')
    .reduce((sum, a) => sum + (a.quantity || 0), 0);
  const totalExpended = expenditures.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const totalTransferredIn = transfers
    .filter((t) => t.destinationBase?.id === asset.baseId && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalTransferredOut = transfers
    .filter((t) => t.sourceBase?.id === asset.baseId && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.quantity || 0), 0);
  const netMovement = totalTransferredIn - totalTransferredOut;
  const openingBalance = Math.max(0, asset.quantity - netMovement + totalExpended);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          to="/assets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assets</span>
        </Link>
      </div>

      {/* Top Header Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{asset.name}</h1>
            <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              {asset.assetCode}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {asset.equipmentType || 'Standard Military Equipment'} • Assigned to {asset.baseName}
          </p>
        </div>

        {/* Action Buttons: Status Change, Edit, Delete */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            className="text-xs border-slate-300"
          >
            Change Status
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs"
          >
            Edit Asset
          </Button>

          {(user?.role === 'ADMIN' || (user?.role === 'BASE_COMMANDER' && user?.base?.id === asset.baseId)) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================
          SECTION 8: TOP 2-COLUMN LAYOUT
          | Asset Image (REAL IMAGE) | Asset Information |
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: REAL ASSET IMAGE (No random laptop fallback) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex-1 flex flex-col">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                Asset Photo
              </span>
              {getStatusBadge(asset.status)}
            </div>

            <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
              <AssetImage
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                showPlaceholderText={true}
                fallbackIconSize={48}
              />
              <div className="absolute bottom-2.5 left-2.5">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white border border-white/20">
                  {asset.assetCode}
                </span>
              </div>
            </div>

            {asset.description && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-0.5">Tactical Remarks:</p>
                <p className="leading-relaxed">{asset.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Asset Information Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Asset Information
              </h2>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {asset.category}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm mt-1">
              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Asset ID</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">
                  {asset.assetCode}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Asset Name</span>
                <span className="col-span-2 font-semibold text-slate-900">
                  {asset.name}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Category</span>
                <span className="col-span-2 font-medium text-slate-900">
                  {asset.category}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Equipment Type</span>
                <span className="col-span-2 font-medium text-slate-900">
                  {asset.equipmentType || 'Standard Issue'}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Assigned Base</span>
                <span className="col-span-2 font-semibold text-blue-700">
                  {asset.baseName} ({asset.baseCode})
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Current Quantity</span>
                <span className="col-span-2 font-bold text-slate-900">
                  {asset.quantity} {asset.unit}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Unit of Measure</span>
                <span className="col-span-2 font-medium text-slate-900">
                  {asset.unit}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Serial / Batch Number</span>
                <span className="col-span-2 font-mono text-slate-900">
                  {asset.serialNumber || 'N/A'}
                </span>
              </div>

              <div className="py-2.5 grid grid-cols-3">
                <span className="text-slate-500 font-medium">Facility Location</span>
                <span className="col-span-2 text-slate-900">
                  {asset.location || 'Central Facility'}
                </span>
              </div>

              {asset.purchasePrice && (
                <div className="py-2.5 grid grid-cols-3">
                  <span className="text-slate-500 font-medium">Valuation / Price</span>
                  <span className="col-span-2 font-semibold text-emerald-700 font-mono">
                    ${Number(asset.purchasePrice).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          INVENTORY INFORMATION METRICS
          Opening Balance | Current Quantity | Assigned | Expended | Movement
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Inventory Balance Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
              Opening Balance
            </span>
            <p className="text-xl font-bold text-slate-900">
              {openingBalance} <span className="text-xs font-normal text-slate-500">{asset.unit}</span>
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-700 uppercase block mb-1">
              Current Quantity
            </span>
            <p className="text-xl font-bold text-blue-900">
              {asset.quantity} <span className="text-xs font-normal text-blue-600">{asset.unit}</span>
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-700 uppercase block mb-1">
              Assigned Active
            </span>
            <p className="text-xl font-bold text-amber-900">
              {totalAssigned} <span className="text-xs font-normal text-amber-600">{asset.unit}</span>
            </p>
          </div>

          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200">
            <span className="text-[11px] font-semibold text-rose-700 uppercase block mb-1">
              Expended
            </span>
            <p className="text-xl font-bold text-rose-900">
              {totalExpended} <span className="text-xs font-normal text-rose-600">{asset.unit}</span>
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase block mb-1">
              Net Movement
            </span>
            <p className="text-xl font-bold text-emerald-900">
              {netMovement >= 0 ? `+${netMovement}` : netMovement}{' '}
              <span className="text-xs font-normal text-emerald-600">{asset.unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          TRANSACTION HISTORY TABS
          Purchases | Transfers | Assignments | Expenditures
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/60 px-5 pt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Purchases ({purchases.length})
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'transfers'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfers ({transfers.length})
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assignments ({assignments.length})
          </button>

          <button
            onClick={() => setActiveTab('expenditures')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'expenditures'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Expenditures ({expenditures.length})
          </button>
        </div>

        <div className="p-0">
          {isLoadingHistory ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading transaction records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* TAB 1: PURCHASES */}
              {activeTab === 'purchases' && (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Order #</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Supplier</th>
                      <th className="py-3 px-5">Quantity</th>
                      <th className="py-3 px-5 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No direct purchase orders logged for this asset code.
                        </td>
                      </tr>
                    ) : (
                      purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 font-mono font-medium text-slate-900">{p.referenceNumber}</td>
                          <td className="py-3 px-5 text-slate-600">{p.purchaseDate}</td>
                          <td className="py-3 px-5 text-slate-700">{p.supplier}</td>
                          <td className="py-3 px-5 font-bold text-slate-900">{p.quantity} {p.unit}</td>
                          <td className="py-3 px-5 text-right font-mono text-emerald-700 font-semibold">
                            ${Number(p.totalAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 2: TRANSFERS */}
              {activeTab === 'transfers' && (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Transfer #</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Source $\rightarrow$ Destination</th>
                      <th className="py-3 px-5">Quantity</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transfers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No inter-base transfers recorded for this asset.
                        </td>
                      </tr>
                    ) : (
                      transfers.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 font-mono font-medium text-slate-900">{t.referenceNumber}</td>
                          <td className="py-3 px-5 text-slate-600">{t.transferDate}</td>
                          <td className="py-3 px-5 text-slate-700">
                            {t.sourceBase?.name} $\rightarrow$ <span className="font-semibold">{t.destinationBase?.name}</span>
                          </td>
                          <td className="py-3 px-5 font-bold text-slate-900">{t.quantity} {t.unit}</td>
                          <td className="py-3 px-5 text-right">
                            <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 3: ASSIGNMENTS */}
              {activeTab === 'assignments' && (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Assignment #</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Personnel / Unit</th>
                      <th className="py-3 px-5">Quantity</th>
                      <th className="py-3 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No personnel assignments logged for this asset.
                        </td>
                      </tr>
                    ) : (
                      assignments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 font-mono font-medium text-slate-900">{a.referenceNumber}</td>
                          <td className="py-3 px-5 text-slate-600">{a.assignmentDate}</td>
                          <td className="py-3 px-5 text-slate-700 font-medium">
                            {a.personnelRank} {a.personnelName} ({a.personnelId})
                          </td>
                          <td className="py-3 px-5 font-bold text-slate-900">{a.quantity}</td>
                          <td className="py-3 px-5 text-right">
                            <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* TAB 4: EXPENDITURES */}
              {activeTab === 'expenditures' && (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Record #</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Reason / Operation</th>
                      <th className="py-3 px-5">Expended Qty</th>
                      <th className="py-3 px-5 text-right">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenditures.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No ammunition or equipment expenditures recorded.
                        </td>
                      </tr>
                    ) : (
                      expenditures.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-5 font-mono font-medium text-slate-900">{e.referenceNumber}</td>
                          <td className="py-3 px-5 text-slate-600">{e.expenditureDate}</td>
                          <td className="py-3 px-5 text-slate-700">{e.reason}</td>
                          <td className="py-3 px-5 font-bold text-rose-700">-{e.quantity} {e.unit}</td>
                          <td className="py-3 px-5 text-right text-slate-600">{e.recordedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AddEditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateAsset}
        asset={asset}
        bases={bases}
      />

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Operational Status"
        subtitle={`Asset ${asset.assetCode} - ${asset.name}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleStatusChange}
              isLoading={isUpdatingStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Status
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Operational Status
            </label>
            <select
              value={selectedNewStatus}
              onChange={(e) => setSelectedNewStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="IN_USE">In Use</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="DEPLOYED">Deployed</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Directive / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Scheduled for routine inspection at Sector 4 workshop..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deactivation"
        subtitle={`Asset ID: ${asset.assetCode}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAsset}
              isLoading={isDeleting}
            >
              Confirm Deactivation
            </Button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to deactivate <span className="font-bold text-slate-900">{asset.name}</span> ({asset.assetCode})?
          This will archive the record from active service.
        </p>
      </Modal>
    </div>
  );
};
