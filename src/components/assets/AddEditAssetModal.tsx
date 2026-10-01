import React, { useState, useEffect, useRef } from 'react';
import { Asset, Base, AssetCategory, AssetStatus, CreateAssetInput } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { AssetImage } from '../common/AssetImage';

interface AddEditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAssetInput) => Promise<void>;
  asset?: Asset | null;
  bases: Base[];
}

// Preset military images for quick selection
const MILITARY_PRESETS = [
  {
    name: 'T-90 Tank (Armored Vehicle)',
    url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=800&q=80',
    category: 'VEHICLE' as AssetCategory,
  },
  {
    name: 'INSAS Assault Rifle (Weapon)',
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    category: 'WEAPON' as AssetCategory,
  },
  {
    name: 'Tactical Radio Transceiver',
    url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=800&q=80',
    category: 'COMMUNICATION' as AssetCategory,
  },
  {
    name: 'Command Field Terminal',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    category: 'IT_EQUIPMENT' as AssetCategory,
  },
  {
    name: 'Night Vision Goggles (Optics)',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    category: 'OTHER' as AssetCategory,
  },
  {
    name: 'Bulletproof Armor Vest',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    category: 'OTHER' as AssetCategory,
  },
];

export const AddEditAssetModal: React.FC<AddEditAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
  bases,
}) => {
  const { user } = useAuth();
  const isEdit = !!asset;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('VEHICLE');
  const [equipmentType, setEquipmentType] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Units');
  const [status, setStatus] = useState<AssetStatus>('AVAILABLE');
  const [baseId, setBaseId] = useState<number>(user?.base?.id || (bases[0]?.id || 1));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  
  // Image handling states
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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
      setBaseId(asset.baseId || user?.base?.id || bases[0]?.id || 1);
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
      setBaseId(user?.base?.id || (bases[0]?.id || 1));
      setLocation('');
      setDescription('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setPurchasePrice('');
      setImageUrl('');
    }
    setErrorMessage(null);
    setImageError(null);
  }, [asset, isOpen, user, bases]);

  const processFile = async (file: File) => {
    setImageError(null);
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validFormats.includes(file.type)) {
      setImageError('Unsupported format. Please upload JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds 5MB limit.');
      return;
    }

    setIsProcessingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 800;
            let width = img.width;
            let height = img.height;
            if (width > height && width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/webp', 0.85));
            } else {
              resolve(e.target?.result as string);
            }
          };
          img.onerror = () => reject(new Error('Failed to load image for processing'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      setImageUrl(dataUrl);
      setImageError(null);
    } catch (err: any) {
      setImageError(err.message || 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setImageError(null);

    // Image is strictly required
    if (!imageUrl.trim()) {
      setImageError('Asset image is required.');
      setErrorMessage('Asset image is required. Please upload or select an image before submitting.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Asset Name is required.');
      return;
    }
    if (!baseId) {
      setErrorMessage('Military Base assignment is required.');
      return;
    }

    setIsSubmitting(true);

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
        imageUrl: imageUrl.trim(),
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
      title={isEdit ? 'Edit Military Asset' : 'Register New Asset'}
      subtitle={isEdit ? `Modifying inventory record ${asset?.assetCode}` : 'Induct equipment into the defense inventory registry'}
      maxWidth="xl"
      footer={
        <>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting || isProcessingImage}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
          >
            {isEdit ? 'Update Asset' : 'Create Asset'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* 1. ASSET IMAGE (Required, Prominent at top) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Asset Image <span className="text-rose-600">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Supported: JPG, PNG, WEBP (Max 5MB)
            </span>
          </div>

          {imageUrl ? (
            /* Image Preview Card */
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shrink-0">
                <AssetImage
                  src={imageUrl}
                  alt="Asset Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEdit ? 'Image Selected' : 'Image Ready for Upload'}
                </div>
                <p className="text-xs text-slate-500">
                  {isEdit ? 'Click replace to upload a different image.' : 'Image will be persisted with this asset.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  Replace Image
                </Button>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : imageError
                  ? 'border-rose-400 bg-rose-50/30'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 hover:underline">
                    Click to upload asset image
                  </span>{' '}
                  <span className="text-xs text-slate-500">or drag and drop</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  JPG, JPEG, PNG, or WEBP up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Image Validation Error */}
          {imageError && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-rose-600" />
              {imageError}
            </p>
          )}

          {/* Military Gear Presets for convenience */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Or Choose from Military Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MILITARY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setImageError(null);
                    if (!isEdit && !name) {
                      setName(preset.name.split(' (')[0]);
                      setCategory(preset.category);
                    }
                  }}
                  className={`text-left p-2 rounded-lg border text-[11px] transition-all flex items-center gap-2 ${
                    imageUrl === preset.url
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-7 h-7 rounded object-cover shrink-0 border border-slate-200"
                  />
                  <span className="truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. GENERAL ASSET DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Asset Name <span className="text-rose-600">*</span>
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
              Category <span className="text-rose-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="VEHICLE">Vehicle (Armored / Transport)</option>
              <option value="WEAPON">Weapon (Firearms / Ordnance)</option>
              <option value="AMMUNITION">Ammunition & Munitions</option>
              <option value="COMMUNICATION">Communication & Radar</option>
              <option value="IT_EQUIPMENT">IT & Cyber Terminals</option>
              <option value="OTHER">Other Equipment / Gear</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Equipment Type / Model
            </label>
            <input
              type="text"
              placeholder="e.g. Main Battle Tank, 5.56mm Assault Rifle"
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Serial Number / Batch No
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
              Initial Quantity <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              min={1}
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
              Military Base <span className="text-rose-600">*</span>
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
              Operational Status
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
            Description / Tactical Specifications
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
