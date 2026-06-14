import * as XLSX from 'xlsx';
import { excelBufferToCsv, isExcelFilename } from '@/lib/excelImport';
import { parseHoldingsCsv } from '@/lib/csvImport';

// Build an .xlsx workbook in-memory and return its bytes (Uint8Array).
function buildWorkbook(rows: string[][]): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}

describe('isExcelFilename', () => {
  it('detects Excel extensions case-insensitively', () => {
    expect(isExcelFilename('holdings.xlsx')).toBe(true);
    expect(isExcelFilename('holdings.xls')).toBe(true);
    expect(isExcelFilename('HOLDINGS.XLSX')).toBe(true);
    expect(isExcelFilename('report.xlsm')).toBe(true);
  });

  it('rejects non-Excel files', () => {
    expect(isExcelFilename('holdings.csv')).toBe(false);
    expect(isExcelFilename('holdings.txt')).toBe(false);
    expect(isExcelFilename('holdings')).toBe(false);
  });
});

describe('excelBufferToCsv', () => {
  it('converts the first worksheet to a CSV string', async () => {
    const buf = buildWorkbook([
      ['symbol', 'quantity', 'buy_price', 'buy_date'],
      ['RELIANCE.NS', '10', '2450.5', '2024-06-15'],
    ]);
    const csv = await excelBufferToCsv(buf);
    expect(csv).toContain('symbol');
    expect(csv).toContain('RELIANCE.NS');
    expect(csv).toContain('2450.5');
  });

  it('produces CSV that flows through parseHoldingsCsv into valid rows', async () => {
    const buf = buildWorkbook([
      ['symbol', 'quantity', 'buy_price', 'buy_date'],
      ['TCS.NS', '5', '3500', '2024-01-10'],
      ['INFY.NS', '20', '1600', '2023-12-01'],
    ]);
    const csv = await excelBufferToCsv(buf);
    const { valid, skipped } = parseHoldingsCsv(csv);
    expect(skipped).toHaveLength(0);
    expect(valid).toHaveLength(2);
    expect(valid[0].symbol).toBe('TCS.NS');
    expect(valid[0].quantity).toBe(5);
  });

  it('never yields valid holdings from garbage input (throws or returns empty)', async () => {
    const garbage = new Uint8Array([1, 2, 3, 4, 5]);
    let csv = '';
    try {
      csv = await excelBufferToCsv(garbage);
    } catch {
      csv = ''; // throwing is acceptable; the dialog catches it
    }
    const { valid } = parseHoldingsCsv(csv);
    expect(valid).toHaveLength(0);
  });
});
