/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SynthesisLogEntry, SampleSpot } from '../types/materials';
import {
  History,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Printer,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  UserCheck,
  FileText,
} from 'lucide-react';
import { downloadTextFile } from '../services/fairExporter';

interface SynthesisHistoryProps {
  logs: SynthesisLogEntry[];
  selectedSpot?: SampleSpot;
  onSelectSpotId?: (spotId: string) => void;
}

export const SynthesisHistory: React.FC<SynthesisHistoryProps> = ({
  logs,
  selectedSpot,
  onSelectSpotId,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'printing' | 'qc' | 'scout' | 'fair'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [spotFilterOnly, setSpotFilterOnly] = useState(false);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set([logs[0]?.id || '']));

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (filterCategory !== 'all' && log.actionCategory !== filterCategory) {
      return false;
    }

    if (spotFilterOnly && selectedSpot) {
      if (log.spotId !== selectedSpot.id && log.spotId !== 'Library-wide') {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        log.title.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.agentRole.toLowerCase().includes(q) ||
        (log.spotId && log.spotId.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    return true;
  });

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    downloadTextFile(`synthesis_history_${Date.now()}.json`, jsonStr, 'application/json');
  };

  const handleExportCSV = () => {
    const headers = ['id', 'timestamp', 'agentRole', 'actionCategory', 'actionType', 'spotId', 'title', 'detail', 'status'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.agentRole}"`,
      l.actionCategory,
      l.actionType,
      l.spotId || '',
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.detail.replace(/"/g, '""')}"`,
      l.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadTextFile(`synthesis_history_${Date.now()}.csv`, csvContent, 'text/csv');
  };

  const getRoleIcon = (role: SynthesisLogEntry['agentRole']) => {
    switch (role) {
      case 'Print Planner':
        return <Printer className="w-3.5 h-3.5 text-sky-700" />;
      case 'Metrology QC':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />;
      case 'Candidate Scout':
        return <Sparkles className="w-3.5 h-3.5 text-purple-700" />;
      case 'Human Scientist':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-700" />;
      case 'FAIR Curator':
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  const getStatusIndicator = (status: SynthesisLogEntry['status']) => {
    switch (status) {
      case 'optimal':
        return <span className="text-emerald-700 font-mono text-[11px] font-semibold">● Nominal</span>;
      case 'warning':
        return <span className="text-amber-700 font-mono text-[11px] font-semibold">▲ Warning</span>;
      case 'alert':
        return <span className="text-rose-700 font-mono text-[11px] font-semibold">✖ Flagged</span>;
      case 'info':
      default:
        return <span className="text-slate-600 font-mono text-[11px]">● Log</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-700" />
            <h4 className="text-sm font-bold text-slate-900">Synthesis History</h4>
            <span className="text-xs text-slate-400 font-mono" aria-hidden="true">·</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredLogs.length} of {logs.length} events logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit trail of agent-initiated deposition, sintering, characterization, and quality gates
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
            title="Export chronological log as CSV"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
            title="Export chronological log as JSON"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterCategory('printing')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterCategory === 'printing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Printing & Sintering
          </button>
          <button
            onClick={() => setFilterCategory('qc')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterCategory === 'qc'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QC & Metrology
          </button>
          <button
            onClick={() => setFilterCategory('scout')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterCategory === 'scout'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scout & Proposal
          </button>
          <button
            onClick={() => setFilterCategory('fair')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filterCategory === 'fair'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            FAIR Provenance
          </button>
        </div>

        {/* Spot Filter Checkbox & Search Input */}
        <div className="flex items-center gap-3">
          {selectedSpot && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-mono select-none">
              <input
                type="checkbox"
                checked={spotFilterOnly}
                onChange={(e) => setSpotFilterOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span>Focus {selectedSpot.id}</span>
            </label>
          )}

          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions or spots..."
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-sky-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No synthesis history entries match the active filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogIds.has(log.id);
            const dateObj = new Date(log.timestamp);
            const formattedTime = dateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const formattedDate = dateObj.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={log.id}
                className="border border-slate-200 rounded-lg p-3 bg-white hover:border-slate-300 transition-colors"
              >
                {/* Header row: Expand chevron, Timestamp, Role, Spot, Status */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Metadata Line: Zero-pill unboxed text with typographic dot separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="font-semibold text-slate-800">{log.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {formattedDate} {formattedTime}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-slate-700 font-sans font-medium">
                          {getRoleIcon(log.agentRole)}
                          <span>{log.agentRole}</span>
                        </span>
                        {log.spotId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectSpotId && log.spotId && log.spotId !== 'Library-wide') {
                                  onSelectSpotId(log.spotId);
                                }
                              }}
                              className={`font-semibold ${
                                log.spotId !== 'Library-wide'
                                  ? 'text-sky-700 hover:underline cursor-pointer'
                                  : 'text-slate-500'
                              }`}
                            >
                              {log.spotId}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div className="text-xs font-semibold text-slate-900 mt-1">
                        {log.title}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator (Text-first, non-hue-only) */}
                  <div className="shrink-0 text-right pt-0.5">
                    {getStatusIndicator(log.status)}
                  </div>
                </div>

                {/* Body / Detail (Expandable) */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 pl-6 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {log.detail}
                    </p>

                    {/* Metric Tags Dictionary */}
                    {log.metrics && Object.keys(log.metrics).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {Object.entries(log.metrics).map(([key, val]) => (
                          <div
                            key={key}
                            className="bg-slate-50 border border-slate-100 rounded px-2.5 py-1 text-[11px] font-mono"
                          >
                            <span className="text-slate-400 block text-[10px] uppercase">
                              {key}
                            </span>
                            <span className="font-semibold text-slate-800 tabular-nums">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
