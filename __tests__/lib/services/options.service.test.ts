import { getTableOptions } from '@/lib/services/options.service';
import { httpClient } from '@/lib/api';
import { BFF_TABLES } from '@/lib/constants/api/bff-routes';

// Mock the httpClient
jest.mock('@/lib/api', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

// Mock the constants
jest.mock('@/lib/constants/api/bff-routes', () => ({
  BFF_TABLES: '/api/options/tables',
}));

const mockHttpClient = httpClient as jest.Mocked<typeof httpClient>;

const mockResponse = (data: unknown, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  ok: true,
});

describe('options.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTableOptions', () => {
    it('should call httpClient.get with correct endpoint and return the promise', () => {
      const mockData = ['table1', 'table2'];
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      const result = getTableOptions();

      expect(mockHttpClient.get).toHaveBeenCalledWith(BFF_TABLES);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/options/tables');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return the resolved data when awaited', async () => {
      const mockData = ['table1', 'table2', 'table3'];
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await getTableOptions();

      expect(result).toEqual(response);
    });

    it('should handle errors from httpClient.get', async () => {
      const mockError = new Error('Network error');
      mockHttpClient.get.mockRejectedValue(mockError);

      await expect(getTableOptions()).rejects.toThrow('Network error');
    });

    it('should call httpClient.get with TABLES constant', () => {
      const mockData = ['table1'];
      const response = mockResponse(mockData);
      mockHttpClient.get.mockResolvedValue(response);

      getTableOptions();

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/options/tables');
    });
  });
});
