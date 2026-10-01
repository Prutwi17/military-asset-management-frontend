import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Flame,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Eye,
  AlertTriangle,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import {
  Assignment,
  Expenditure,
  Base,
  Asset,
  AssignmentStatus,
  AssetCategory,
  CreateAssignmentInput,
  ReturnAssignmentInput,
  CreateExpenditureInput,
} from '../types';
import { assignmentApi, expenditureApi, baseApi, assetApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AssetImage } from '../components/common/AssetImage';
import { useAuth } from '../context/AuthContext';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab: 'assignments' | 'expenditures'
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');

  // Shared Data
  const [bases, setBases] = useState<Base[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAssignLoading, setIsAssignLoading] = useState(true);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Expenditures State
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [isExpLoading, setIsExpLoading] = useState(true);
  const [expError, setExpError] = useState<string | null>(null);

  // Filters
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] = useState<Assignment | null>(null);
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [viewExpenditure, setViewExpenditure] = useState<Expenditure | null>(null);

  // Form State - Assignment
  const [assignBaseId, setAssignBaseId] = useState<number>(user?.base?.id || 1);
  const [assignAssetId, setAssignAssetId] = useState<number | ''>('');
  const [personnelName, setPersonnelName] = useState('');
  const [personnelRank, setPersonnelRank] = useState('Captain');
  const [personnelId, setPersonnelId] = useState('');
  const [unitDivision, setUnitDivision] = useState('');
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);
  const [assignFormError, setAssignFormError] = useState<string | null>(null);

  // Form State - Return Assignment
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnCondition, setReturnCondition] = useState('GOOD');
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturnSubmitting, setIsReturnSubmitting] = useState(false);

  // Form State - Expenditure
  const [expBaseId, setExpBaseId] = useState<number>(user?.base?.id || 1);
  const [expAssetId, setExpAssetId] = useState<number | ''>('');
  const [expQuantity, setExpQuantity] = useState<number>(100);
  const [expUnit, setExpUnit] = useState('Rounds');
  const [personnelOrUnit, setPersonnelOrUnit] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expReason, setExpReason] = useState('');
  const [expReference, setExpReference] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [isExpSubmitting, setIsExpSubmitting] = useState(false);
  const [expFormError, setExpFormError] = useState<string | null>(null);

  const fetchBases = async () => {
    try {
      const data = await baseApi.getAll();
      setBases(data);
      if (data.length > 0 && !user?.base?.id) {
        setAssignBaseId(data[0].id);
        setExpBaseId(data[0].id);
      } else if (user?.base?.id) {
        setAssignBaseId(user.base.id);
        setExpBaseId(user.base.id);
      }
    } catch (err) {
      console.error('Failed to load bases:', err);
    }
  };

  const fetchAssetsForBase = async (baseId: number) => {
    try {
      const data = await assetApi.getAll({ baseId });
      setAssets(data);
      if (data.length > 0) {
        setAssignAssetId(data[0].id);
        setExpAssetId(data[0].id);
      } else {
        setAssignAssetId('');
        setExpAssetId('');
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const fetchAssignments = useCallback(async () => {
    setIsAssignLoading(true);
    setAssignError(null);
    try {
      const data = await assignmentApi.getAll({
        baseId: selectedBase ? Number(selectedBase) : undefined,
        status: selectedStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setAssignments(data);
    } catch (err: any) {
      setAssignError(err.response?.data?.message || 'Failed to load assignments.');
    } finally {
      setIsAssignLoading(false);
    }
  }, [selectedBase, selectedStatus, startDate, endDate, searchKeyword]);

  const fetchExpenditures = useCallback(async () => {
    setIsExpLoading(true);
    setExpError(null);
    try {
      const data = await expenditureApi.getAll({
        baseId: selectedBase ? Number(selectedBase) : undefined,
        category: (selectedCategory as AssetCategory) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setExpenditures(data);
    } catch (err: any) {
      setExpError(err.response?.data?.message || 'Failed to load expenditures.');
    } finally {
      setIsExpLoading(false);
    }
  }, [selectedBase, selectedCategory, startDate, endDate, searchKeyword]);

  useEffect(() => {
    fetchBases();
  }, []);

  useEffect(() => {
    const targetBase = activeTab === 'assignments' ? assignBaseId : expBaseId;
    if (targetBase) {
      fetchAssetsForBase(targetBase);
    }
  }, [assignBaseId, expBaseId, activeTab]);

  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    } else {
      fetchExpenditures();
    }
  }, [activeTab, fetchAssignments, fetchExpenditures]);

  // Selected asset metadata for validation
  const selectedAssignAsset = assets.find((a) => a.id === assignAssetId);
  const selectedExpAsset = assets.find((a) => a.id === expAssetId);

  // Submit Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAssetId) {
      setAssignFormError('Please select an asset to assign.');
      return;
    }
    if (!personnelName.trim() || !personnelId.trim()) {
      setAssignFormError('Personnel name and military ID are required.');
      return;
    }
    if (selectedAssignAsset && assignQuantity > selectedAssignAsset.quantity) {
      setAssignFormError(`Insufficient inventory available. Max: ${selectedAssignAsset.quantity}`);
      return;
    }

    setIsAssignSubmitting(true);
    setAssignFormError(null);

    try {
      const payload: CreateAssignmentInput = {
        assetId: Number(assignAssetId),
        baseId: Number(assignBaseId),
        personnelName: personnelName.trim(),
        personnelRank,
        personnelId: personnelId.trim(),
        unitDivision: unitDivision.trim() || undefined,
        quantity: assignQuantity,
        assignmentDate,
        expectedReturnDate: expectedReturnDate || undefined,
        notes: assignNotes.trim() || undefined,
      };

      await assignmentApi.create(payload);
      setIsAssignModalOpen(false);
      fetchAssignments();
      fetchAssetsForBase(assignBaseId);
    } catch (err: any) {
      setAssignFormError(err.response?.data?.message || 'Failed to assign asset.');
    } finally {
      setIsAssignSubmitting(false);
    }
  };

  // Return Assignment
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningAssignment) return;

    setIsReturnSubmitting(true);
    try {
      const payload: ReturnAssignmentInput = {
        returnDate,
        returnCondition,
        notes: returnNotes.trim() || undefined,
      };

      await assignmentApi.returnAssignment(returningAssignment.id, payload);
      setReturningAssignment(null);
      setReturnNotes('');
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process return.');
    } finally {
      setIsReturnSubmitting(false);
    }
  };

  // Submit Expenditure
  const handleRecordExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAssetId) {
      setExpFormError('Please select an asset to expend.');
      return;
    }
    if (!personnelOrUnit.trim()) {
      setExpFormError('Operating unit or division is required.');
      return;
    }
    if (!expReason.trim()) {
      setExpFormError('Expenditure reason is required.');
      return;
    }
    if (selectedExpAsset && expQuantity > selectedExpAsset.quantity) {
      setExpFormError(`Cannot record expenditure: requested quantity exceeds available stock (${selectedExpAsset.quantity}).`);
      return;
    }

    setIsExpSubmitting(true);
    setExpFormError(null);

    try {
      const payload: CreateExpenditureInput = {
        assetId: Number(expAssetId),
        baseId: Number(expBaseId),
        quantity: expQuantity,
        unit: expUnit,
        personnelOrUnit: personnelOrUnit.trim(),
        expenditureDate: expDate,
        reason: expReason.trim(),
        reference: expReference.trim() || undefined,
        notes: expNotes.trim() || undefined,
      };

      await expenditureApi.create(payload);
      setIsExpModalOpen(false);
      fetchExpenditures();
      fetchAssetsForBase(expBaseId);
    } catch (err: any) {
      setExpFormError(err.response?.data?.message || 'Failed to record expenditure.');
    } finally {
      setIsExpSubmitting(false);
    }
  };

  const getAssignmentBadge = (status: AssignmentStatus): import('../components/common/Badge').BadgeVariant => {
    switch (status) {
      case 'ACTIVE':
        return 'blue';
      case 'RETURNED':
        return 'approved';
      case 'OVERDUE':
        return 'rejected';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personnel Assignments &amp; Expenditures</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tactical gear issue to personnel, operational munition depletions, and consumable tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'assignments' ? fetchAssignments : fetchExpenditures}
            isLoading={isAssignLoading || isExpLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          {activeTab === 'assignments' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setAssignFormError(null);
                setPersonnelName('');
                setPersonnelId('');
                setUnitDivision('');
                setAssignNotes('');
                setIsAssignModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Asset</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setExpFormError(null);
                setPersonnelOrUnit('');
                setExpReason('');
                setExpReference('');
                setExpNotes('');
                setIsExpModalOpen(true);
              }}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expenditure</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personnel Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenditures')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'expenditures'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Munition &amp; Consumable Expenditures ({expenditures.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Assignments</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{assignments.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Active In-Service</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {assignments.filter((a) => a.status === 'ACTIVE').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Returned to Armory</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {assignments.filter((a) => a.status === 'RETURNED').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Overdue Items</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {assignments.filter((a) => a.status === 'OVERDUE').length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search personnel, badge ID, asset..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="">All Assignment Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="RETURNED">RETURNED</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>

              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="">All Military Posts</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {isAssignLoading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-xs">Loading personnel assignments...</p>
              </div>
            ) : assignError ? (
              <div className="p-8 text-center text-rose-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                <p className="text-sm font-semibold">{assignError}</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No personnel assignments found</p>
                <p className="text-xs text-slate-400 mt-1">Issue tactical gear to personnel or clear active filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Assignment Ref</th>
                      <th className="py-3 px-4">Assigned Personnel</th>
                      <th className="py-3 px-4">Tactical Asset</th>
                      <th className="py-3 px-4">Military Base</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Assigned / Return Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                          {item.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {item.personnelRank ? `${item.personnelRank} ` : ''}
                            {item.personnelName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ID: {item.personnelId} {item.unitDivision ? `• ${item.unitDivision}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.assetName}</div>
                          <div className="text-[11px] text-slate-400">{item.category}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{item.base.name}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {item.quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700">{item.assignmentDate}</div>
                          {item.expectedReturnDate && (
                            <div className="text-[11px] text-slate-400">
                              Exp: {item.expectedReturnDate}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getAssignmentBadge(item.status)}>{item.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'ACTIVE' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReturningAssignment(item)}
                                className="flex items-center gap-1 text-[11px] py-1 px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Return Asset</span>
                              </Button>
                            )}
                            <button
                              onClick={() => setViewAssignment(item)}
                              title="View Details"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPENDITURES */}
      {activeTab === 'expenditures' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Expenditures</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{expenditures.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Munitions Fired</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {expenditures
                    .filter((e) => e.category === 'AMMUNITION')
                    .reduce((acc, curr) => acc + curr.quantity, 0)}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Field Operations</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {new Set(expenditures.map((e) => e.reference).filter(Boolean)).size || expenditures.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Operating Units</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {new Set(expenditures.map((e) => e.personnelOrUnit)).size}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Expenditures Filter Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reason, unit, reference, asset..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="">All Consumable Categories</option>
                <option value="AMMUNITION">Ammunition</option>
                <option value="WEAPON">Weapons</option>
                <option value="VEHICLE">Vehicles</option>
                <option value="OTHER">Other Consumables</option>
              </select>

              <select
                value={selectedBase}
                onChange={(e) => setSelectedBase(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
              >
                <option value="">All Military Posts</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Expenditures Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {isExpLoading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-xs">Loading operational expenditures...</p>
              </div>
            ) : expError ? (
              <div className="p-8 text-center text-rose-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                <p className="text-sm font-semibold">{expError}</p>
              </div>
            ) : expenditures.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Flame className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No expenditure records found</p>
                <p className="text-xs text-slate-400 mt-1">Log consumed ammunition or field write-offs.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Expenditure Ref</th>
                      <th className="py-3 px-4">Asset / Item Expended</th>
                      <th className="py-3 px-4">Military Base</th>
                      <th className="py-3 px-4">Quantity Consumed</th>
                      <th className="py-3 px-4">Operating Unit / Personnel</th>
                      <th className="py-3 px-4">Reason &amp; Directive</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenditures.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-amber-700">
                          {item.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{item.assetName}</div>
                          <div className="text-[11px] text-slate-400">{item.category}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{item.base.name}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">
                          -{item.quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {item.personnelOrUnit}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{item.reason}</div>
                          {item.reference && (
                            <div className="text-[11px] text-slate-400 font-mono">Ref: {item.reference}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.expenditureDate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setViewExpenditure(item)}
                            title="View Expenditure Details"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Asset Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Asset to Military Personnel"
        subtitle="Individual Tactical Issue Authorization"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAssignment} isLoading={isAssignSubmitting}>
              Authorize Issue
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          {assignFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {assignFormError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stationed Base *</label>
              <select
                value={assignBaseId}
                onChange={(e) => setAssignBaseId(Number(e.target.value))}
                disabled={user?.role === 'BASE_COMMANDER'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:bg-slate-100"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset from Armory *</label>
              <select
                value={assignAssetId}
                onChange={(e) => setAssignAssetId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                required
              >
                <option value="">Select Asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetCode} - {a.name} (Stock: {a.quantity} {a.unit})
                  </option>
                ))}
              </select>
              {selectedAssignAsset && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                    <AssetImage src={selectedAssignAsset.imageUrl} alt={selectedAssignAsset.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedAssignAsset.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedAssignAsset.assetCode} • Available: {selectedAssignAsset.quantity} {selectedAssignAsset.unit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Military Rank</label>
              <select
                value={personnelRank}
                onChange={(e) => setPersonnelRank(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                <option value="Captain">Captain</option>
                <option value="Major">Major</option>
                <option value="Colonel">Colonel</option>
                <option value="Lieutenant">Lieutenant</option>
                <option value="Subedar">Subedar</option>
                <option value="Sergeant">Sergeant</option>
                <option value="Specialist">Specialist</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Personnel Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Vikram Batra"
                value={personnelName}
                onChange={(e) => setPersonnelName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service / Badge ID *</label>
              <input
                type="text"
                placeholder="e.g. MIL-84920"
                value={personnelId}
                onChange={(e) => setPersonnelId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit / Division</label>
              <input
                type="text"
                placeholder="e.g. 13th JAK Rifles / Delta Coy"
                value={unitDivision}
                onChange={(e) => setUnitDivision(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                max={selectedAssignAsset ? selectedAssignAsset.quantity : 9999}
                value={assignQuantity}
                onChange={(e) => setAssignQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Date *</label>
              <input
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Return Date</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes / Mission Order</label>
              <input
                type="text"
                placeholder="Duty assignment details, combat deployment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Return Asset Modal */}
      <Modal
        isOpen={returningAssignment !== null}
        onClose={() => setReturningAssignment(null)}
        title="Check-In / Return Asset into Armory"
        subtitle={returningAssignment ? `Assignment Ref: ${returningAssignment.referenceNumber}` : 'Return Gear'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReturningAssignment(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReturnSubmit} isLoading={isReturnSubmitting}>
              Confirm Return &amp; Restock
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          {returningAssignment && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="font-semibold text-slate-900">
                Returning {returningAssignment.quantity}x {returningAssignment.assetName}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Assigned to: {returningAssignment.personnelRank} {returningAssignment.personnelName} (ID: {returningAssignment.personnelId})
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Actual Return Date *</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Condition *</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              >
                <option value="GOOD">Good / Mission Ready</option>
                <option value="NORMAL_WEAR">Normal Field Wear</option>
                <option value="DAMAGED">Damaged / Requires Repair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Armorer Inspection Notes</label>
            <textarea
              rows={2}
              placeholder="Inspection results, cleaning verification, maintenance needs..."
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
        </form>
      </Modal>

      {/* Record Expenditure Modal */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Record Munition &amp; Consumable Expenditure"
        subtitle="Live Fire, Combat, or Training Depletion Record"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsExpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRecordExpenditure}
              isLoading={isExpSubmitting}
              className="bg-amber-600 hover:bg-amber-500"
            >
              Log Expenditure &amp; Deduct Stock
            </Button>
          </div>
        }
      >
        <form onSubmit={handleRecordExpenditure} className="space-y-4 text-xs">
          {expFormError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {expFormError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stationed Base *</label>
              <select
                value={expBaseId}
                onChange={(e) => setExpBaseId(Number(e.target.value))}
                disabled={user?.role === 'BASE_COMMANDER'}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 disabled:bg-slate-100"
              >
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset / Munition *</label>
              <select
                value={expAssetId}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setExpAssetId(val);
                  const matched = assets.find((a) => a.id === val);
                  if (matched) setExpUnit(matched.unit);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                required
              >
                <option value="">Select Asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetCode} - {a.name} (Stock: {a.quantity} {a.unit})
                  </option>
                ))}
              </select>
              {selectedExpAsset && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg mt-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                    <AssetImage src={selectedExpAsset.imageUrl} alt={selectedExpAsset.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedExpAsset.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedExpAsset.assetCode} • Stock: {selectedExpAsset.quantity} {selectedExpAsset.unit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Expended *</label>
              <input
                type="number"
                min="1"
                max={selectedExpAsset ? selectedExpAsset.quantity : 99999}
                value={expQuantity}
                onChange={(e) => setExpQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <input
                type="text"
                value={expUnit}
                onChange={(e) => setExpUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expenditure Date *</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operating Personnel / Unit *</label>
              <input
                type="text"
                placeholder="e.g. 2nd Armoured Division / Bravo Troop"
                value={personnelOrUnit}
                onChange={(e) => setPersonnelOrUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operation Reference #</label>
              <input
                type="text"
                placeholder="e.g. OP-ORDER-2026-99"
                value={expReference}
                onChange={(e) => setExpReference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Tactical Justification *</label>
            <input
              type="text"
              placeholder="e.g. Quarterly Live Fire Battle Readiness Qualifying Drills"
              value={expReason}
              onChange={(e) => setExpReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Range &amp; Safety Officer Notes</label>
            <textarea
              rows={2}
              placeholder="Ammunition lot number, firing range sector, safety officer certification..."
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
        </form>
      </Modal>

      {/* View Assignment Modal */}
      <Modal
        isOpen={viewAssignment !== null}
        onClose={() => setViewAssignment(null)}
        title={viewAssignment ? `Assignment Ref: ${viewAssignment.referenceNumber}` : 'Assignment Details'}
        subtitle="Individual Tactical Issue Record"
        footer={
          <Button variant="secondary" onClick={() => setViewAssignment(null)}>
            Close
          </Button>
        }
      >
        {viewAssignment && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Personnel</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {viewAssignment.personnelRank} {viewAssignment.personnelName}
                </p>
                <p className="text-slate-500 font-mono">Service ID: {viewAssignment.personnelId}</p>
                {viewAssignment.unitDivision && (
                  <p className="text-slate-500 mt-0.5">{viewAssignment.unitDivision}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Asset Stationed</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewAssignment.assetName}</p>
                <p className="text-slate-500">
                  {viewAssignment.quantity} {viewAssignment.unit} ({viewAssignment.category})
                </p>
                <p className="text-blue-600 font-medium mt-0.5">{viewAssignment.base.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400">Status</span>
                <div className="mt-1">
                  <Badge variant={getAssignmentBadge(viewAssignment.status)}>{viewAssignment.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Assignment Date</span>
                <p className="font-medium text-slate-800 mt-1">{viewAssignment.assignmentDate}</p>
              </div>
              <div>
                <span className="text-slate-400">Expected Return</span>
                <p className="font-medium text-slate-800 mt-1">
                  {viewAssignment.expectedReturnDate || 'Indefinite / Permanent'}
                </p>
              </div>
            </div>

            {viewAssignment.actualReturnDate && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-emerald-700 font-semibold">Returned on {viewAssignment.actualReturnDate}</span>
                <p className="text-slate-600 mt-0.5">Condition: {viewAssignment.returnCondition || 'GOOD'}</p>
              </div>
            )}

            <div>
              <span className="text-slate-400">Authorized By</span>
              <p className="font-medium text-slate-800 mt-1">{viewAssignment.assignedBy}</p>
            </div>

            {viewAssignment.notes && (
              <div>
                <span className="text-slate-400">Operational Notes</span>
                <p className="mt-1 p-2.5 rounded-lg bg-slate-50 text-slate-600">{viewAssignment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* View Expenditure Modal */}
      <Modal
        isOpen={viewExpenditure !== null}
        onClose={() => setViewExpenditure(null)}
        title={viewExpenditure ? `Expenditure Ref: ${viewExpenditure.referenceNumber}` : 'Expenditure Details'}
        subtitle="Munition &amp; Material Depletion Record"
        footer={
          <Button variant="secondary" onClick={() => setViewExpenditure(null)}>
            Close
          </Button>
        }
      >
        {viewExpenditure && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Expended Material</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewExpenditure.assetName}</p>
                <p className="text-slate-600 font-mono">{viewExpenditure.category}</p>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Quantity Consumed</span>
                <p className="font-bold text-rose-600 text-lg mt-0.5">
                  -{viewExpenditure.quantity} {viewExpenditure.unit}
                </p>
                <p className="text-slate-600">{viewExpenditure.base.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400">Operating Unit / Personnel</span>
                <p className="font-semibold text-slate-800 mt-1">{viewExpenditure.personnelOrUnit}</p>
              </div>
              <div>
                <span className="text-slate-400">Expenditure Date</span>
                <p className="font-medium text-slate-800 mt-1">{viewExpenditure.expenditureDate}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-400">Reason &amp; Justification</span>
              <p className="mt-1 p-2.5 rounded-lg bg-slate-50 font-medium text-slate-800">
                {viewExpenditure.reason}
              </p>
            </div>

            {viewExpenditure.reference && (
              <div>
                <span className="text-slate-400">Operation Order Ref</span>
                <p className="mt-1 font-mono text-slate-700">{viewExpenditure.reference}</p>
              </div>
            )}

            <div>
              <span className="text-slate-400">Recorded By</span>
              <p className="mt-1 text-slate-800">{viewExpenditure.recordedBy}</p>
            </div>

            {viewExpenditure.notes && (
              <div>
                <span className="text-slate-400">Notes</span>
                <p className="mt-1 p-2.5 rounded-lg bg-slate-50 text-slate-600">{viewExpenditure.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
