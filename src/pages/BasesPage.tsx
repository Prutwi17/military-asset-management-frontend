import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2, Edit2, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Base } from '../types';
import { baseApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const BasesPage: React.FC = () => {
  const { user } = useAuth();

  const [bases, setBases] = useState<Base[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<Base | null>(null);

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await baseApi.getAll();
      setBases(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve bases.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBases();
  }, [fetchBases]);

  const handleOpenAdd = () => {
    setEditingBase(null);
    setName('');
    setCode('');
    setLocation('');
    setDescription('');
    setStatus('ACTIVE');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Base) => {
    setEditingBase(b);
    setName(b.name);
    setCode(b.code);
    setLocation(b.location || '');
    setDescription(b.description || '');
    setStatus(b.status || 'ACTIVE');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setFormError('Base Name and Code are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingBase) {
        await baseApi.update(editingBase.id, {
          name: name.trim(),
          code: code.trim(),
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          status,
        });
      } else {
        await baseApi.create({
          name: name.trim(),
          code: code.trim(),
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          status,
        });
      }
      setIsModalOpen(false);
      await fetchBases();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save base command facility.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Military Bases</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Command stations, garrisons, and strategic logistics depots
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow px-4 py-2 rounded-lg"
          >
            Add Base Facility
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Bases Table matching ui-reference style */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Base Code</th>
                <th className="py-3 px-4">Base Name</th>
                <th className="py-3 px-4">Strategic Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Description</th>
                {user?.role === 'ADMIN' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading base directory...</span>
                    </div>
                  </td>
                </tr>
              ) : bases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No bases found</p>
                  </td>
                </tr>
              ) : (
                bases.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{b.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{b.location || 'Undisclosed'}</td>
                    <td className="py-3.5 px-4">
                      {b.status === 'ACTIVE' ? (
                        <Badge variant="operational">Operational</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{b.description}</td>
                    {user?.role === 'ADMIN' && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Base"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBase ? 'Edit Base Facility' : 'Register New Base Facility'}
        subtitle="Strategic Command & Control Installation"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
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
              {editingBase ? 'Update Base' : 'Register Base'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Base Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Base Alpha"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Base Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BASE-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Strategic Location
              </label>
              <input
                type="text"
                placeholder="e.g. Northern Command, Sector 4"
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
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Description / Command Role
            </label>
            <textarea
              rows={3}
              placeholder="Operational tactical role..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
