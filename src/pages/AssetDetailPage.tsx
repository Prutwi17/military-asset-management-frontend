import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Shield,
  Calendar,
  Building2,
  Clock,
  FileText,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Asset, Base, AssetStatus, CreateAssetInput } from '../types';
import { assetApi, baseApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AddEditAssetModal } from '../components/assets/AddEditAssetModal';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';

export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load asset details or access denied under your security clearance.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

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
        <p className="text-xs text-slate-500 font-mono">RETRIEVING TACTICAL ASSET FILE...</p>
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

  // Fallback military tactical preview illustration matching ui-reference.png Screen 4
  const assetImage =
    asset.imageUrl ||
    'https://images.unsplash.com/photo-1544476915-ed1370594142?auto=format&fit=crop&w=800&q=80';

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

      {/* Top Header Row matching ui-reference.png Screen 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Details</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View complete asset information
          </p>
        </div>

        {/* Action Buttons matching ui-reference: Edit and Delete */}
        <div className="flex items-center gap-2.5">
          {/* Quick status change button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStatusModalOpen(true)}
            className="text-xs border-slate-300"
          >
            Change Status
          </Button>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs"
          >
            Edit
          </Button>

          {/* Delete Button matching Screen 4 red delete button */}
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main 2-Column Layout matching Screen 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Asset Media Preview matching Screen 4 */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-sm relative group aspect-[4/3] flex items-center justify-center">
            <img
              src={assetImage}
              alt={asset.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <span className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white border border-white/20">
                {asset.assetCode}
              </span>
            </div>
          </div>

          {/* Gallery Thumbnails matching Screen 4 */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="rounded-lg border-2 border-blue-600 overflow-hidden aspect-[4/3] bg-slate-100">
              <img src={assetImage} alt="Thumb 1" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden aspect-[4/3] bg-slate-100 opacity-70 hover:opacity-100 cursor-pointer">
              <img src={assetImage} alt="Thumb 2" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden aspect-[4/3] bg-slate-100 opacity-70 hover:opacity-100 cursor-pointer">
              <img src={assetImage} alt="Thumb 3" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden aspect-[4/3] bg-slate-900/80 text-white flex items-center justify-center font-bold text-xs">
              +3
            </div>
          </div>
        </div>

        {/* Right Column: Asset Details Table matching Screen 4 */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* Asset Title with Status Badge */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{asset.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{asset.equipmentType || 'Standard Issue'}</p>
            </div>
            {getStatusBadge(asset.status)}
          </div>

          {/* Key-Value Details Grid matching Screen 4 */}
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Asset ID</span>
              <span className="col-span-2 font-mono font-semibold text-slate-900">
                {asset.assetCode}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="col-span-2 font-medium text-slate-900">
                {asset.category}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Serial Number</span>
              <span className="col-span-2 font-mono text-slate-900">
                {asset.serialNumber || 'N/A'}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="col-span-2 font-medium text-slate-900">
                {asset.status}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Location</span>
              <span className="col-span-2 font-medium text-slate-900">
                {asset.location || asset.baseName}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Military Base</span>
              <span className="col-span-2 font-semibold text-blue-700">
                {asset.baseName} ({asset.baseCode})
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Inventory Balance</span>
              <span className="col-span-2 font-bold text-slate-900">
                {asset.quantity} {asset.unit}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Purchase Date</span>
              <span className="col-span-2 text-slate-900">
                {asset.purchaseDate || '15-06-2024'}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Last Maintenance</span>
              <span className="col-span-2 text-slate-900">
                {asset.lastMaintenanceDate || '10-09-2026'}
              </span>
            </div>

            <div className="py-3 grid grid-cols-3">
              <span className="text-slate-500 font-medium">Description</span>
              <span className="col-span-2 text-slate-700 leading-relaxed">
                {asset.description || 'Main battle tank for combat operations.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Maintenance History matching Screen 4 */}
      <Card className="bg-white">
        <CardHeader>
          <div>
            <CardTitle>Maintenance History</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Logged inspection, service, and repair records</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">SERVICE_LOG</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Performed By</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-5 font-mono text-slate-700">10-09-2026</td>
                  <td className="py-3 px-5 font-medium text-slate-900">Routine Check</td>
                  <td className="py-3 px-5 text-slate-600">Tech Team Alpha-4</td>
                  <td className="py-3 px-5 text-right">
                    <Badge variant="operational">Completed</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-5 font-mono text-slate-700">15-06-2026</td>
                  <td className="py-3 px-5 font-medium text-slate-900">Engine Diagnostics</td>
                  <td className="py-3 px-5 text-slate-600">Chief Engineer Vance</td>
                  <td className="py-3 px-5 text-right">
                    <Badge variant="operational">Completed</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
              placeholder="e.g. Scheduled for 100-hour system overhaul at Sector 4 workshop..."
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
          This will remove it from active battlefield status.
        </p>
      </Modal>
    </div>
  );
};
