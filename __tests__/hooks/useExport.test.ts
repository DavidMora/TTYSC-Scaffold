import { renderHook, act } from '@testing-library/react';
import { useExportTable } from '@/hooks/useExport';
import { getExportTable } from '@/lib/services/export.service';
import { downloadFile } from '@/lib/utils/exportFile';
import { ExportFormat } from '@/lib/types/export';

// Mock the dependencies
jest.mock('@/lib/services/export.service');
jest.mock('@/lib/utils/exportFile');

const mockGetExportTable = getExportTable as jest.MockedFunction<
  typeof getExportTable
>;
const mockDownloadFile = downloadFile as jest.MockedFunction<
  typeof downloadFile
>;

describe('useExportTable', () => {
  const mockTableId = 'test-table-123';
  const mockFormat: ExportFormat = {
    id: 'csv',
    name: 'CSV',
    icon: 'csv-icon',
    mimeType: 'text/csv',
    fileExtension: '.csv',
  };

  const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
  const mockResponse = {
    data: mockBlob,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'text/csv' },
    ok: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetExportTable.mockResolvedValue(mockResponse);
    mockDownloadFile.mockImplementation(() => {});
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useExportTable(mockTableId));

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.exportToFormat).toBe('function');
    });
  });

  describe('exportToFormat', () => {
    it('should successfully export table to format', async () => {
      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(mockGetExportTable).toHaveBeenCalledWith({
        tableId: mockTableId,
        format: mockFormat.id,
        mimeType: mockFormat.mimeType,
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        blob: mockBlob,
        filename: expect.stringMatching(/table_test-table-123_.*\.csv$/),
        contentType: 'text/csv',
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle export service errors', async () => {
      const errorMessage = 'Network error';
      mockGetExportTable.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(mockDownloadFile).not.toHaveBeenCalled();
    });

    it('should handle missing response data', async () => {
      mockGetExportTable.mockResolvedValue({
        data: null as unknown as Blob,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe('Error getting export table');
      expect(mockDownloadFile).not.toHaveBeenCalled();
    });

    it('should handle unknown errors', async () => {
      mockGetExportTable.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe('An unknown error occurred');
      expect(mockDownloadFile).not.toHaveBeenCalled();
    });

    it('should clear previous errors when starting new export', async () => {
      // First, trigger an error
      mockGetExportTable.mockRejectedValueOnce(new Error('First error'));
      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.error).toBe('First error');

      // Then, trigger a successful export
      mockGetExportTable.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.error).toBe(null);
    });

    it('should use fallback content type when not provided in response', async () => {
      const responseWithoutContentType = {
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      };
      mockGetExportTable.mockResolvedValue(responseWithoutContentType);

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        blob: mockBlob,
        filename: expect.stringMatching(/table_test-table-123_.*\.csv$/),
        contentType: mockFormat.mimeType, // Should use format's mimeType as fallback
      });
    });

    it('should generate filename with current date', async () => {
      const mockDate = new Date('2024-01-15');
      jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate as unknown as Date);
      jest.spyOn(mockDate, 'toLocaleDateString').mockReturnValue('1/15/2024');

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        blob: mockBlob,
        filename: 'table_test-table-123_1/15/2024.csv',
        contentType: 'text/csv',
      });

      // Restore original Date implementation
      jest.restoreAllMocks();
    });
  });

  describe('Error Handling', () => {
    it('should handle download file errors', async () => {
      mockDownloadFile.mockImplementation(() => {
        throw new Error('Download failed');
      });

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(result.current.isExporting).toBe(false);
      expect(result.current.error).toBe('Download failed');
    });
  });
});
