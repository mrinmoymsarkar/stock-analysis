/**
 * Excel → CSV conversion for the holdings importer.
 *
 * SheetJS is loaded lazily (dynamic import) so it stays out of the main bundle
 * and is only fetched when a user actually imports an Excel file. The resulting
 * CSV string is fed into `parseHoldingsCsv`, so all column-detection and
 * validation logic is shared with the plain-CSV path.
 */

const EXCEL_EXT_RE = /\.(xlsx|xls|xlsm|xlsb)$/i;

/** True when a filename looks like an Excel workbook (.xls/.xlsx/.xlsm/.xlsb). */
export function isExcelFilename(name: string): boolean {
  return EXCEL_EXT_RE.test(name.trim());
}

/**
 * Convert the first worksheet of an Excel workbook to a CSV string.
 * Accepts the ArrayBuffer from `File.arrayBuffer()` (or a Uint8Array in tests).
 * Throws if the buffer is not a readable workbook or has no sheets.
 */
export async function excelBufferToCsv(buf: ArrayBuffer | Uint8Array): Promise<string> {
  const XLSX = await import('xlsx');
  const data = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const wb = XLSX.read(data, { type: 'array' });
  const firstSheet = wb.SheetNames[0];
  if (!firstSheet) {
    throw new Error('The Excel file has no sheets.');
  }
  return XLSX.utils.sheet_to_csv(wb.Sheets[firstSheet]);
}
