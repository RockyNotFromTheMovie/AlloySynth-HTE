/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PERIODIC_TABLE, ALLOY_PRESETS, PeriodicElement, PeriodicBlock } from '../data/periodicTable';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  RotateCcw,
  FlaskConical,
  Grid,
  List,
} from 'lucide-react';

interface PeriodicTableSelectorProps {
  currentElements?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSynthesizeLibrary: (elements: PeriodicElement[]) => void;
  embedded?: boolean;
}

export const PeriodicTableSelector: React.FC<PeriodicTableSelectorProps> = ({
  currentElements = ['Pt', 'Pd', 'Ni', 'Co'],
  isOpen,
  onClose,
  onSynthesizeLibrary,
  embedded = false,
}) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(currentElements);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'all' | PeriodicBlock>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Map symbols to full element objects
  const elementMap = useMemo(() => {
    const map = new Map<string, PeriodicElement>();
    PERIODIC_TABLE.forEach((el) => map.set(el.symbol, el));
    return map;
  }, []);

  const selectedElements = useMemo(() => {
    return selectedSymbols.map((s) => elementMap.get(s)!).filter(Boolean);
  }, [selectedSymbols, elementMap]);

  // Guardrails
  const count = selectedSymbols.length;
  const isMinMet = count >= 2;
  const isMaxReached = count >= 5;
  const isValid = count >= 2 && count <= 5;

  const toggleElement = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else {
      if (selectedSymbols.length >= 5) {
        return; // Guardrail: Max 5
      }
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  const handleApplyPreset = (symbols: string[]) => {
    setSelectedSymbols(symbols);
  };

  const handleClearAll = () => {
    setSelectedSymbols([]);
  };

  // Filter elements
  const filteredElements = useMemo(() => {
    return PERIODIC_TABLE.filter((el) => {
      if (selectedBlock !== 'all' && el.block !== selectedBlock) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSymbol = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().startsWith(q);
        const matchName = el.name.toLowerCase().includes(q);
        const matchNumber = String(el.atomicNumber) === q;
        const matchBlock = el.block === q;
        return matchSymbol || matchName || matchNumber || matchBlock;
      }
      return true;
    });
  }, [searchQuery, selectedBlock]);

  // Category & Block colors
  const getBlockStyle = (block: PeriodicBlock, isSelected: boolean, isDisabled: boolean) => {
    if (isSelected) {
      return 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-400 z-10';
    }
    if (isDisabled) {
      return 'opacity-25 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
    }

    switch (block) {
      case 'd':
        return 'bg-blue-50/70 border-blue-200 text-blue-950 hover:bg-blue-100/80';
      case 'p':
        return 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/80';
      case 's':
        return 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100/80';
      case 'f':
        return 'bg-purple-50/70 border-purple-200 text-purple-950 hover:bg-purple-100/80';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
    }
  };

  const getSystemTypeName = (n: number) => {
    switch (n) {
      case 2:
        return 'Binary System (2 elements)';
      case 3:
        return 'Ternary Simplex System (3 elements)';
      case 4:
        return 'Quaternary High-Entropy System (4 elements)';
      case 5:
        return 'Quinary High-Entropy System (5 elements)';
      default:
        return `${n} elements selected`;
    }
  };

  if (!isOpen && !embedded) return null;

  return (
    <div
      className={
        embedded
          ? 'bg-white rounded-xl shadow-xs border border-slate-200 w-full flex flex-col overflow-hidden'
          : 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto'
      }
    >
      <div
        className={
          embedded
            ? 'w-full flex flex-col'
            : 'bg-white rounded-xl shadow-2xl border border-slate-200 max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in-50 duration-200'
        }
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-5 h-5 text-sky-700" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Standard 118-Element Periodic Table Reference Library
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select 2 to 5 elements to synthesize and test a custom combinatorial alloy library out of the box without uploading external files
              </p>
            </div>

            {embedded ? (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors flex items-center gap-1.5"
                title="Switch to active library grid"
              >
                <span>View Library Grid</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Selection Guardrails & Live Validation Status Strip */}
          <div className="mt-4 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-slate-200">
            {/* Live Counter & Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-xs uppercase font-semibold text-slate-500">Selection:</span>
                <span className="text-lg font-bold text-slate-900 tabular-nums">{count}</span>
                <span className="text-xs text-slate-400">/ 5 max</span>
              </div>

              {/* 5-step visual dots */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((step) => {
                  const filled = count >= step;
                  return (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        filled
                          ? step > 2
                            ? 'w-5 bg-sky-600'
                            : 'w-5 bg-emerald-600'
                          : 'w-2 bg-slate-300'
                      }`}
                      title={`Element slot ${step}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Validation Badge */}
            <div className="flex items-center gap-2">
              {count === 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span>Select at least 2 elements to formulate an alloy</span>
                </div>
              )}
              {count === 1 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-mono font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Needs 1 more element (minimum 2 for binary alloy)</span>
                </div>
              )}
              {isValid && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-mono font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{getSystemTypeName(count)} · Ready for Synthesis</span>
                </div>
              )}
              {isMaxReached && (
                <span className="text-[11px] text-sky-800 font-mono font-medium bg-sky-100 px-2 py-0.5 rounded">
                  Max capacity reached (5/5)
                </span>
              )}
            </div>

            {/* Reset Action */}
            {count > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-500 hover:text-slate-800 font-mono underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Quick-Load Alloy Presets */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              Quick Presets:
            </span>
            {ALLOY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset.symbols)}
                className="px-2.5 py-1 text-[11px] font-mono bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded transition-colors text-slate-700 shadow-2xs"
                title={preset.description}
              >
                {preset.symbols.join('-')}
              </button>
            ))}
          </div>

          {/* Search, Block Filter & View Mode */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. Pt, Fe, Ti), name, or Z..."
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-sky-600 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Block Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setSelectedBlock('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedBlock === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 118 Elements
              </button>
              <button
                onClick={() => setSelectedBlock('d')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedBlock === 'd' ? 'bg-white text-blue-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                d-Block (Transition)
              </button>
              <button
                onClick={() => setSelectedBlock('p')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedBlock === 'p' ? 'bg-white text-emerald-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                p-Block (Main)
              </button>
              <button
                onClick={() => setSelectedBlock('s')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedBlock === 's' ? 'bg-white text-amber-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                s-Block (Alkali/Earth)
              </button>
              <button
                onClick={() => setSelectedBlock('f')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  selectedBlock === 'f' ? 'bg-white text-purple-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                f-Block (Rare Earth)
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1 rounded ${viewMode === 'table' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                title="Mendeleev 18-Column Layout"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                title="Searchable Compact Card Grid"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Content Area: Periodic Table Layout or Compact Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50">
          {viewMode === 'table' && !searchQuery && selectedBlock === 'all' ? (
            /* Standard 18-Column Mendeleev Layout */
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[860px] space-y-3">
                {/* Periods 1 to 7 */}
                <div className="grid grid-cols-18 gap-1 text-center font-mono">
                  {PERIODIC_TABLE.slice(0, 56).concat(
                    PERIODIC_TABLE.slice(71, 88),
                    PERIODIC_TABLE.slice(103, 118)
                  ).map((el) => {
                    const isSelected = selectedSymbols.includes(el.symbol);
                    const isDisabled = isMaxReached && !isSelected;
                    const style = getBlockStyle(el.block, isSelected, isDisabled);

                    // Compute grid column and row in 18-column table
                    let col = el.group;
                    let row = el.period;

                    return (
                      <div
                        key={el.atomicNumber}
                        style={{ gridColumn: col, gridRow: row }}
                        onClick={() => !isDisabled && toggleElement(el.symbol)}
                        className={`group relative p-1 rounded border flex flex-col justify-between transition-all select-none cursor-pointer text-left min-h-[52px] ${style}`}
                      >
                        <div className="flex items-center justify-between text-[9px] leading-none font-mono">
                          <span className="opacity-70">{el.atomicNumber}</span>
                          {/* Checkbox indicator */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            readOnly
                            className="w-2.5 h-2.5 rounded text-sky-600 pointer-events-none"
                          />
                        </div>
                        <div className="text-center font-bold text-xs leading-none my-0.5">
                          {el.symbol}
                        </div>
                        <div className="text-[8px] truncate leading-none opacity-80 text-center font-sans">
                          {el.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lanthanides & Actinides (f-block rows at bottom) */}
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                    <span className="font-semibold text-purple-700">f-Block Series:</span>
                    <span>Lanthanides (57-71) & Actinides (89-103)</span>
                  </div>

                  {/* Lanthanides Row */}
                  <div className="grid grid-cols-15 gap-1">
                    {PERIODIC_TABLE.filter((e) => e.category === 'lanthanide').map((el) => {
                      const isSelected = selectedSymbols.includes(el.symbol);
                      const isDisabled = isMaxReached && !isSelected;
                      const style = getBlockStyle(el.block, isSelected, isDisabled);

                      return (
                        <div
                          key={el.atomicNumber}
                          onClick={() => !isDisabled && toggleElement(el.symbol)}
                          className={`p-1 rounded border flex flex-col justify-between transition-all select-none cursor-pointer min-h-[48px] text-left ${style}`}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                            <span className="opacity-70">{el.atomicNumber}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              readOnly
                              className="w-2.5 h-2.5 rounded text-sky-600 pointer-events-none"
                            />
                          </div>
                          <div className="text-center font-bold text-xs leading-none my-0.5">
                            {el.symbol}
                          </div>
                          <div className="text-[8px] truncate opacity-80 text-center font-sans">
                            {el.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actinides Row */}
                  <div className="grid grid-cols-15 gap-1">
                    {PERIODIC_TABLE.filter((e) => e.category === 'actinide').map((el) => {
                      const isSelected = selectedSymbols.includes(el.symbol);
                      const isDisabled = isMaxReached && !isSelected;
                      const style = getBlockStyle(el.block, isSelected, isDisabled);

                      return (
                        <div
                          key={el.atomicNumber}
                          onClick={() => !isDisabled && toggleElement(el.symbol)}
                          className={`p-1 rounded border flex flex-col justify-between transition-all select-none cursor-pointer min-h-[48px] text-left ${style}`}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                            <span className="opacity-70">{el.atomicNumber}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              readOnly
                              className="w-2.5 h-2.5 rounded text-sky-600 pointer-events-none"
                            />
                          </div>
                          <div className="text-center font-bold text-xs leading-none my-0.5">
                            {el.symbol}
                          </div>
                          <div className="text-[8px] truncate opacity-80 text-center font-sans">
                            {el.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Searchable Filtered Compact Card Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredElements.map((el) => {
                const isSelected = selectedSymbols.includes(el.symbol);
                const isDisabled = isMaxReached && !isSelected;
                const style = getBlockStyle(el.block, isSelected, isDisabled);

                return (
                  <div
                    key={el.atomicNumber}
                    onClick={() => !isDisabled && toggleElement(el.symbol)}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all select-none cursor-pointer ${style}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="opacity-70 font-semibold">#{el.atomicNumber}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        readOnly
                        className="w-3.5 h-3.5 rounded text-sky-600 pointer-events-none"
                      />
                    </div>

                    <div className="my-1.5 flex items-baseline justify-between">
                      <span className="text-lg font-bold font-mono tracking-tight">{el.symbol}</span>
                      <span className="text-[10px] uppercase font-mono opacity-60">
                        {el.block}-block
                      </span>
                    </div>

                    <div className="text-xs truncate font-medium">{el.name}</div>
                    <div className="text-[10px] opacity-70 font-mono mt-0.5 flex justify-between">
                      <span>{el.atomicMass.toFixed(1)} u</span>
                      <span>{el.densityGcm3.toFixed(1)} g/cm³</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Action Footer with Selected System Breakdown */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white shrink-0 flex flex-wrap items-center justify-between gap-4">
          {/* Selected Elements Pills Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              System ({selectedSymbols.length}):
            </span>
            {selectedElements.length === 0 ? (
              <span className="text-xs text-slate-400 font-mono italic">No elements selected yet</span>
            ) : (
              selectedElements.map((el) => (
                <div
                  key={el.symbol}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono"
                >
                  <span className="font-bold text-slate-900">{el.symbol}</span>
                  <span className="text-slate-400 text-[10px]">({el.name})</span>
                  <button
                    onClick={() => toggleElement(el.symbol)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5"
                    title={`Remove ${el.symbol}`}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                if (isValid) {
                  onSynthesizeLibrary(selectedElements);
                  onClose();
                }
              }}
              disabled={!isValid}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-2 shadow-xs ${
                isValid
                  ? 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isValid
                  ? `Synthesize ${selectedSymbols.join('-')} Library`
                  : count < 2
                  ? 'Select Min 2 Elements'
                  : 'Max 5 Elements'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
