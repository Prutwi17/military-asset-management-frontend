import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Shield, RefreshCw } from 'lucide-react';
import { Asset, Base, AssetCategory, AssetStatus, CreateAssetInput } from '../types';
import { assetApi, baseApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AddEditAssetModal } from '../components/assets/AddEditAssetModal';
import { useAuth } from '../context/AuthContext';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters matching ui-reference.png Screen 3
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBases = async () => {
    try {
      const data = await baseApi.getAll();
      setBases(data);
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assetApi.getAll({
        category: (selectedCategory as AssetCategory) || undefined,
        status: (selectedStatus as AssetStatus) || undefined,
        baseId: selectedBase ? Number(selectedBase) : undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setAssets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load military asset inventory.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, selectedBase, searchKeyword]);

  useEffect(() => {
    fetchBases();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSaveAsset = async (input: CreateAssetInput) => {
    if (editingAsset) {
      await assetApi.update(editingAsset.id, input);
    } else {
      await assetApi.create(input);
    }
    await fetchAssets();
  };

  const handleDeleteAsset = async () => {
    if (!deleteConfirmAsset) return;
    setIsDeleting(true);
    try {
      await assetApi.delete(deleteConfirmAsset.id);
      setDeleteConfirmAsset(null);
      await fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
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
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatCategoryName = (cat: string) => {
    switch (cat) {
      case 'VEHICLE':
        return 'Vehicle';
      case 'WEAPON':
        return 'Weapon';
      case 'AMMUNITION':
        return 'Ammunition';
      case 'COMMUNICATION':
        return 'Communication';
      case 'IT_EQUIPMENT':
        return 'IT Equipment';
      case 'OTHER':
        return 'Others';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Row matching ui-reference.png Screen 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assets</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage all military assets</p>
        </div>

        {/* Action Button: + Add Asset */}
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingAsset(null);
            setIsAddEditModalOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow px-4 py-2 rounded-lg"
        >
          Add Asset
        </Button>
      </div>

      {/* Filter Bar matching ui-reference.png Screen 3 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        >
          <option value="">All Categories</option>
          <option value="VEHICLE">Vehicles</option>
          <option value="WEAPON">Weapons</option>
          <option value="AMMUNITION">Ammunition</option>
          <option value="COMMUNICATION">Communication</option>
          <option value="IT_EQUIPMENT">IT Equipment</option>
          <option value="OTHER">Others</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="DEPLOYED">Deployed</option>
          <option value="DECOMMISSIONED">Decommissioned</option>
        </select>

        {/* Base Filter (for Admin / Logistics) */}
        {user?.role !== 'BASE_COMMANDER' && bases.length > 0 && (
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="">All Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {/* Search Input on the right matching ui-reference */}
        <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search assets..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchAssets}
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

      {/* Professional Data Table matching ui-reference.png Screen 3 */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading defense asset records...</span>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No assets match your search parameters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters or registering a new asset</p>
                  </td>
                </tr>
              ) : (
                assets.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/assets/${item.id}`)}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {item.assetCode}
                    </td>

                    {/* Asset Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatCategoryName(item.category)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.location || item.baseName}
                    </td>

                    {/* Actions Column matching ui-reference icons */}
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* View Button */}
                        <button
                          onClick={() => navigate(`/assets/${item.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Asset Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingAsset(item);
                            setIsAddEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Asset"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmAsset(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Deactivate Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {assets.length} military asset entries</span>
          <span className="font-mono text-[11px] text-slate-400">AUTHORIZED INVENTORY</span>
        </div>
      </div>

      {/* Add / Edit Asset Modal */}
      <AddEditAssetModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        asset={editingAsset}
        bases={bases}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmAsset}
        onClose={() => setDeleteConfirmAsset(null)}
        title="Confirm Deactivation"
        subtitle={`Asset ID: ${deleteConfirmAsset?.assetCode}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmAsset(null)}
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
          Are you sure you want to deactivate <span className="font-bold text-slate-900">{deleteConfirmAsset?.name}</span> ({deleteConfirmAsset?.assetCode})?
          This will archive the asset from operational frontline inventory.
        </p>
      </Modal>
    </div>
  );
};
