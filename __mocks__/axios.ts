// Mock for axios
const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  post: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  put: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  delete: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  patch: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
};

const axiosMock = {
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  post: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  put: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  delete: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
  patch: jest.fn().mockResolvedValue({
    data: { test: 'data' },
    status: 200,
    statusText: 'OK',
    headers: {},
  }),
};

export default axiosMock;
