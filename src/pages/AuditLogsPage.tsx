import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { AuditLog } from '../types';
import { auditApi } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditApi.getAll({
        entityName: selectedEntity || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedEntity, selectedAction, startDate, endDate, searchKeyword]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionBadgeVariant = (action: string): import('../components/common/Badge').BadgeVariant => {
    if (action.includes('CREATE') || action.includes('COMPLETE')) return 'approved';
    if (action.includes('APPROVE')) return 'blue';
    if (action.includes('REJECT') || action.includes('DEACTIVATE') || action.includes('CANCEL')) return 'rejected';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security &amp; Operational Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Tamper-evident logs of all asset transfers, assignments, purchases, and terminal operations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAuditLogs}
          isLoading={isLoading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search details, user, action..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="">All Entities</option>
            <option value="Transfer">Transfer</option>
            <option value="Assignment">Assignment</option>
            <option value="Expenditure">Expenditure</option>
            <option value="Purchase">Purchase</option>
            <option value="Asset">Asset</option>
            <option value="System">System</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
          >
            <option value="">All Actions</option>
            <option value="CREATE_TRANSFER">CREATE_TRANSFER</option>
            <option value="APPROVE_TRANSFER">APPROVE_TRANSFER</option>
            <option value="COMPLETE_TRANSFER">COMPLETE_TRANSFER</option>
            <option value="REJECT_TRANSFER">REJECT_TRANSFER</option>
            <option value="CREATE_ASSIGNMENT">CREATE_ASSIGNMENT</option>
            <option value="RETURN_ASSIGNMENT">RETURN_ASSIGNMENT</option>
            <option value="RECORD_EXPENDITURE">RECORD_EXPENDITURE</option>
            <option value="CREATE_PURCHASE">CREATE_PURCHASE</option>
            <option value="CREATE_ASSET">CREATE_ASSET</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-2 text-xs rounded border border-slate-300 bg-white text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-xs">Loading audit events...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No audit events match criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User &amp; Rank</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Operational Details</th>
                  <th className="py-3 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 19) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.userFullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{item.username}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-semibold text-slate-700">{item.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getActionBadgeVariant(item.action)}>{item.action}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.entityName} {item.entityId ? `#${item.entityId}` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      <p className="truncate hover:whitespace-normal">{item.details}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>SUCCESS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{item.status}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
