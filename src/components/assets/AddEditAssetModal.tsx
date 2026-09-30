import React, { useState, useEffect } from 'react';
import { Asset, Base, AssetCategory, AssetStatus, CreateAssetInput } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

interface AddEditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAssetInput) => Promise<void>;
  asset?: Asset | null;
  bases: Base[];
}

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
  bases,
}) => {
  const { user } = useAuth();
  const isEdit = !!asset;

  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('VEHICLE');
  const [equipmentType, setEquipmentType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Units');
  const [status, setStatus] = useState<AssetStatus>('AVAILABLE');
  const [baseId, setBaseId] = useState<number>(user?.base?.id || (bases[0]?.id || 4));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setAssetCode(asset.assetCode || '');
      setName(asset.name || '');
      setCategory(asset.category || 'VEHICLE');
      setEquipmentType(asset.equipmentType || '');
      setSerialNumber(asset.serialNumber || '');
      setQuantity(asset.quantity || 1);
      setUnit(asset.unit || 'Units');
      setStatus(asset.status || 'AVAILABLE');
      setBaseId(asset.baseId || user?.base?.id || bases[0]?.id);
      setLocation(asset.location || '');
      setDescription(asset.description || '');
      setPurchaseDate(asset.purchaseDate || '');
      setPurchasePrice(asset.purchasePrice ? String(asset.purchasePrice) : '');
      setImageUrl(asset.imageUrl || '');
    } else {
      setAssetCode('');
      setName('');
      setCategory('VEHICLE');
      setEquipmentType('');
      setSerialNumber('');
      setQuantity(1);
      setUnit('Units');
      setStatus('AVAILABLE');
      setBaseId(user?.base?.id || (bases[0]?.id || 4));
      setLocation('');
      setDescription('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setPurchasePrice('');
      setImageUrl('');
    }
    setErrorMessage(null);
  }, [asset, isOpen, user, bases]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Asset Name is required.');
      return;
    }
    if (!baseId) {
      setErrorMessage('Military Base assignment is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreateAssetInput = {
        assetCode: assetCode.trim() || undefined,
        name: name.trim(),
        category,
        equipmentType: equipmentType.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        quantity: Number(quantity) || 1,
        unit: unit.trim() || 'Units',
        status,
        baseId: Number(baseId),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        purchaseDate: purchaseDate || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.response?.data?.error || 'Failed to save asset. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Asset' : 'Add New Asset'}
      subtitle={isEdit ? `Modifying inventory record ${asset?.assetCode}` : 'Register a new defense asset in the command registry'}
      maxWidth="lg"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEdit ? 'Update Asset' : 'Register Asset'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Asset Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. T-90 Tank, INSAS Rifle"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Asset Code (Optional)
            </label>
            <input
              type="text"
              placeholder="Auto-generated if left blank"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
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
              Serial Number
            </label>
            <input
              type="text"
              placeholder="e.g. TK-2024-001"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
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
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
              Military Base *
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
            {user?.role === 'BASE_COMMANDER' && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Locked to your assigned command post.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Location / Facility
            </label>
            <input
              type="text"
              placeholder="e.g. Armory 1, Motor Pool, Workshop"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Purchase Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 2400000.00"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Description / Specifications
          </label>
          <textarea
            rows={2}
            placeholder="Operational specifications, tactical remarks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};
