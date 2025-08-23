import { httpClient } from '@/lib/api';
import { BFF_EXPORT_TABLE } from '@/lib/constants/api/bff-routes';
import { getExportTable } from '@/lib/services/export.service';
import { ExportTableParams } from '@/lib/types/export';

jest.mock('@/lib/api', () => ({
  httpClient: { get: jest.fn() },
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

describe('exportService', () => {
  const mockBlob = new Blob(['test data'], { type: 'text/csv' });
  const mockResponse = {
    data: mockBlob,
    status: 200,
    statusText: 'OK',
    ok: true,
    headers: {
      'content-type': 'text/csv',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getExportTable', () => {
    const mockParams: ExportTableParams = {
      tableId: 123,
      format: 'csv',
      mimeType: 'text/csv',
    };

    it('should fetch export table successfully', async () => {
      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getExportTable(mockParams);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        BFF_EXPORT_TABLE(mockParams.tableId, mockParams.format),
        {
          headers: { Accept: mockParams.mimeType },
        }
      );
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should handle CSV format export', async () => {
      const csvParams: ExportTableParams = {
        tableId: 456,
        format: 'csv',
        mimeType: 'text/csv',
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await getExportTable(csvParams);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        BFF_EXPORT_TABLE(csvParams.tableId, csvParams.format),
        {
          headers: { Accept: csvParams.mimeType },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle Excel format export', async () => {
      const excelBlob = new Blob(['excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const excelResponse = {
        data: excelBlob,
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: {
          'content-type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      };

      const excelParams: ExportTableParams = {
        tableId: 789,
        format: 'excel',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      mockHttpClient.get.mockResolvedValue(excelResponse);

      const result = await getExportTable(excelParams);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        BFF_EXPORT_TABLE(excelParams.tableId, excelParams.format),
        {
          headers: { Accept: excelParams.mimeType },
        }
      );
      expect(result).toEqual(excelResponse);
    });
  });
});
