/**
 * Utility functions for exporting data to CSV and Excel formats
 */

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: any[], headers?: string[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.join(',');

  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders
      .map(header => {
        const value = item[header];

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }

        // Convert value to string
        let stringValue = String(value);

        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
        }

        return stringValue;
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]): void => {
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
};

/**
 * Format data for export (flatten nested objects, format dates, etc.)
 */
export const formatDataForExport = (
  data: any[],
  fieldMapping?: Record<string, string | ((item: any) => any)>
): any[] => {
  if (!fieldMapping) {
    return data;
  }

  return data.map(item => {
    const formatted: any = {};

    Object.entries(fieldMapping).forEach(([exportKey, sourceKey]) => {
      if (typeof sourceKey === 'function') {
        // Custom formatter function
        formatted[exportKey] = sourceKey(item);
      } else {
        // Direct mapping or nested path
        if (sourceKey.includes('.')) {
          // Handle nested paths like 'user.email'
          const parts = sourceKey.split('.');
          let value = item;
          for (const part of parts) {
            value = value?.[part];
            if (value === undefined) break;
          }
          formatted[exportKey] = value;
        } else {
          formatted[exportKey] = item[sourceKey];
        }
      }
    });

    return formatted;
  });
};

/**
 * Create Excel-compatible CSV (with proper formatting for Excel)
 */
export const exportToExcelCSV = (data: any[], filename: string, fieldMapping?: Record<string, string | ((item: any) => any)>): void => {
  // Format data if mapping provided
  const formattedData = fieldMapping ? formatDataForExport(data, fieldMapping) : data;

  // Ensure filename has .csv extension
  const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  exportToCSV(formattedData, csvFilename);
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);

    // Format as YYYY-MM-DD HH:mm:ss
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return String(date);
  }
};

/**
 * Format boolean for export
 */
export const formatBooleanForExport = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value ? 'Yes' : 'No';
};

/**
 * Clean text for export (remove HTML tags, extra whitespace, etc.)
 */
export const cleanTextForExport = (text: string | null | undefined): string => {
  if (!text) return '';

  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};
