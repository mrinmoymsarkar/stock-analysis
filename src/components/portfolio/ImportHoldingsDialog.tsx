'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Upload, FileDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  parseHoldingsCsv,
  holdingsCsvTemplate,
  type ParsedRow,
  type SkippedRow,
  type ColumnMapping,
} from '@/lib/csvImport';
import { isExcelFilename, excelBufferToCsv } from '@/lib/excelImport';

// Match INR formatting used elsewhere in the app
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

interface ImportHoldingsDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: ParsedRow[]) => Promise<void>;
}

type Step = 'upload' | 'preview';

export default function ImportHoldingsDialog({
  open,
  onClose,
  onImport,
}: ImportHoldingsDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [valid, setValid] = useState<ParsedRow[]>([]);
  const [skipped, setSkipped] = useState<SkippedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [detected, setDetected] = useState<ColumnMapping>({});
  const [mappingOverride, setMappingOverride] = useState<ColumnMapping>({});
  const [rawText, setRawText] = useState<string>('');
  const [skippedOpen, setSkippedOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setStep('upload');
      setDragging(false);
      setValid([]);
      setSkipped([]);
      setHeaders([]);
      setDetected({});
      setMappingOverride({});
      setRawText('');
      setSkippedOpen(false);
      setImporting(false);
      setServerError(null);
      setFileError(null);
    }
  }, [open]);

  // Focus close button on open
  useEffect(() => {
    if (open) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ─── CSV parsing ────────────────────────────────────────────────────────────

  const processText = useCallback(
    (text: string, override?: ColumnMapping) => {
      const result = parseHoldingsCsv(text, override);
      setValid(result.valid);
      setSkipped(result.skipped);
      setHeaders(result.headers);
      setDetected(result.detected);
      setStep('preview');
    },
    []
  );

  const readFile = useCallback(
    (file: File) => {
      setFileError(null);
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
      const isExcel = isExcelFilename(file.name);
      if (!isCsv && !isExcel) {
        setFileError('Only CSV and Excel (.xls, .xlsx) files are supported.');
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => setFileError('Failed to read file.');

      if (isExcel) {
        // Convert the workbook's first sheet to CSV, then reuse the CSV pipeline.
        reader.onload = async (e) => {
          try {
            const text = await excelBufferToCsv(e.target?.result as ArrayBuffer);
            setRawText(text);
            setMappingOverride({});
            processText(text, {});
          } catch {
            setFileError('Could not read the Excel file. Try re-saving it, or export as CSV.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setRawText(text);
          setMappingOverride({});
          processText(text, {});
        };
        reader.readAsText(file);
      }
    },
    [processText]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  // ─── Column mapping override ─────────────────────────────────────────────────

  const handleMappingChange = (field: keyof ColumnMapping, header: string) => {
    const next = { ...mappingOverride, [field]: header || undefined };
    if (!header) delete next[field];
    setMappingOverride(next);
    processText(rawText, next);
  };

  // ─── Template download ───────────────────────────────────────────────────────

  const downloadTemplate = () => {
    const csv = holdingsCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holdings_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Confirm import ──────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (valid.length === 0) return;
    setImporting(true);
    setServerError(null);
    try {
      await onImport(valid);
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (!open) return null;

  // ─── Column mapping fields to display ────────────────────────────────────────
  const FIELD_LABELS: Array<{ field: keyof ColumnMapping; label: string }> = [
    { field: 'symbol',   label: 'Symbol' },
    { field: 'quantity', label: 'Quantity' },
    { field: 'buyPrice', label: 'Buy Price' },
    { field: 'buyDate',  label: 'Buy Date' },
    { field: 'name',     label: 'Name (optional)' },
    { field: 'isin',     label: 'ISIN (optional)' },
    { field: 'exchange', label: 'Exchange (optional)' },
  ];

  const effectiveMapping: ColumnMapping = { ...detected, ...mappingOverride };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="import-holdings-title"
    >
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 id="import-holdings-title" className="text-base font-semibold text-foreground">
            Import Holdings
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {/* ── Upload step ─────────────────────────────────────────────────── */}
          {step === 'upload' && (
            <>
              {/* Drag-and-drop zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
                  dragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Click or drag a CSV file here to upload"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Click to browse or drag &amp; drop a CSV or Excel file
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  CSV and Excel (.xls, .xlsx) exports from INDmoney, Zerodha, Groww, and more
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx,.xlsm,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Select CSV or Excel file"
              />

              {fileError && (
                <p className="text-sm text-red-500">{fileError}</p>
              )}

              {/* Template download */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Need a template?</span>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                >
                  <FileDown size={14} />
                  Download template CSV
                </button>
              </div>
            </>
          )}

          {/* ── Preview step ─────────────────────────────────────────────────── */}
          {step === 'preview' && (
            <>
              {/* Summary counts */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {valid.length} ready
                </span>
                {skipped.length > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    {skipped.length} skipped
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => { setStep('upload'); }}
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  Choose different file
                </button>
              </div>

              {/* Column mapping */}
              {headers.length > 0 && (
                <details className="border border-border rounded-md">
                  <summary className="px-4 py-2 text-sm font-medium text-foreground cursor-pointer select-none">
                    Column mapping{' '}
                    <span className="text-xs text-muted-foreground font-normal">(adjust if auto-detection is wrong)</span>
                  </summary>
                  <div className="px-4 pb-3 pt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                    {FIELD_LABELS.map(({ field, label }) => (
                      <div key={field} className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground w-28 flex-shrink-0">
                          {label}
                        </label>
                        <select
                          value={effectiveMapping[field] ?? ''}
                          onChange={(e) => handleMappingChange(field, e.target.value)}
                          className="flex-1 text-xs bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          aria-label={`Map ${label} column`}
                        >
                          <option value="">(none)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Valid rows preview table */}
              {valid.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Symbol</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Buy Price</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Buy Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {valid.map((row, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="px-3 py-2 font-mono text-xs text-foreground">{row.symbol}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[120px]">
                              {row.name ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-right text-xs text-foreground">
                              {row.quantity.toLocaleString('en-IN')}
                            </td>
                            <td className="px-3 py-2 text-right text-xs text-foreground">
                              {inrFormatter.format(row.buyPrice)}
                            </td>
                            <td className="px-3 py-2 text-right text-xs text-foreground">
                              <span className={row.dateDefaulted ? 'text-amber-600 dark:text-amber-400' : ''}>
                                {row.buyDate}
                                {row.dateDefaulted && (
                                  <span className="ml-1 text-xs" title="Date was absent; defaulted to today">
                                    *
                                  </span>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {valid.some((r) => r.dateDefaulted) && (
                    <p className="px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-t border-border">
                      * Date was missing in the CSV — defaulted to today.
                    </p>
                  )}
                </div>
              )}

              {valid.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No valid rows detected. Check the column mapping or file format.
                </p>
              )}

              {/* Skipped rows (collapsible) */}
              {skipped.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => setSkippedOpen((v) => !v)}
                    aria-expanded={skippedOpen}
                  >
                    {skippedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {skipped.length} skipped row{skipped.length !== 1 ? 's' : ''}
                  </button>
                  {skippedOpen && (
                    <div className="divide-y divide-border max-h-48 overflow-y-auto" role="list" aria-label="Skipped rows">
                      {skipped.map((s) => (
                        <div key={s.row} className="px-3 py-2 text-xs" role="listitem">
                          <span className="font-medium text-foreground">Row {s.row}</span>
                          <span className="mx-1 text-muted-foreground">—</span>
                          <span className="text-red-600 dark:text-red-400">{s.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {serverError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                  {serverError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-between items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileDown size={13} />
            Template
          </button>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={importing}>
              Cancel
            </Button>
            {step === 'preview' && (
              <Button
                type="button"
                size="sm"
                onClick={handleConfirm}
                disabled={valid.length === 0 || importing}
              >
                {importing
                  ? 'Importing…'
                  : `Import ${valid.length} Holding${valid.length !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
