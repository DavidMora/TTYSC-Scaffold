import {
  sanitizeFilename,
  triggerFileDownload,
  downloadChartAsPng,
  getCurrentSlice,
  buildCsv,
} from '@/lib/utils/chartExport';

import type {
  ChartDimension,
  ChartMeasure,
  MultiDataPoint,
  SingleDataPoint,
} from '@/lib/types/charts';

// Set up DOM and URL mocks
const mockCreateObjectURL = jest.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    },
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('chartExport utils', () => {
  describe('sanitizeFilename', () => {
    it('replaces disallowed chars and truncates long names', () => {
      const input = 'a*?b:/c\\d|e<>f\n"g'.repeat(10);
      const sanitized = sanitizeFilename(input);
      expect(sanitized).not.toMatch(/[*?:/\\|<>"\n]/);
      expect(sanitized.length).toBeLessThanOrEqual(120);
    });
  });

  describe('triggerFileDownload', () => {
    it('wraps string into Blob and downloads', () => {
      const appendSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => document.body);
      const removeSpy = jest
        .spyOn(HTMLElement.prototype, 'remove')
        .mockImplementation(() => {});
      const a = document.createElement('a');
      const createElSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(a);

      triggerFileDownload('csv,data', 'file.csv', 'text/csv');
      expect(mockCreateObjectURL).toHaveBeenCalled();

      appendSpy.mockRestore();
      removeSpy.mockRestore();
      createElSpy.mockRestore();
    });
  });

  describe('getCurrentSlice', () => {
    it('guards against out-of-range selections', () => {
      const data = [1, 2, 3];
      expect(getCurrentSlice(data, { start: -1, end: 0.1 })).toEqual([1]);
      expect(getCurrentSlice(data, { start: 0.9, end: 2 })).toEqual([3]);
    });
  });

  describe('buildCsv', () => {
    const dimensions: ChartDimension[] = [
      { accessor: 'name', formatter: (v: string) => v },
    ];
    const measures: ChartMeasure[] = [
      {
        accessor: 'value',
        label: 'Value',
        formatter: (v: number) => v.toString(),
        axis: 'y',
      },
    ];

    it('builds CSV for single series', () => {
      const dataset: SingleDataPoint[] = [
        { name: 'A', value: 1 },
        { name: 'B', value: 2 },
      ];
      const csv = buildCsv(dataset, dimensions, measures);
      expect(csv.split('\n')[0]).toBe('name,Value');
      expect(csv).toContain('A,1');
      expect(csv).toContain('B,2');
    });

    it('escapes commas, quotes and preserves actual newlines inside quoted fields', () => {
      const dataset: SingleDataPoint[] = [{ name: 'A, "x"\n', value: 5 }];
      const csv = buildCsv(dataset, dimensions, measures);
      const [header, ...rest] = csv.split('\n');
      expect(header).toBe('name,Value');
      const row = rest.join('\n');
      expect(row).toBe('"A, ""x""\n",5');
    });

    it('builds CSV for multi series by projecting accessors', () => {
      const dataset: MultiDataPoint[] = [
        { name: 'A', series0: 1, series1: 10 },
        { name: 'B', series0: 2, series1: 20 },
      ];
      const msr: ChartMeasure[] = [
        {
          accessor: 'series0',
          label: 'S0',
          formatter: (v: number) => String(v),
          axis: 'y',
        },
        {
          accessor: 'series1',
          label: 'S1',
          formatter: (v: number) => String(v),
          axis: 'y',
        },
      ];
      const csv = buildCsv(dataset, dimensions, msr);
      expect(csv.split('\n')[0]).toBe('name,S0,S1');
      expect(csv).toContain('A,1,10');
      expect(csv).toContain('B,2,20');
    });

    it('outputs empty string when value is a circular object (JSON.stringify throws)', () => {
      const dimensions: ChartDimension[] = [
        { accessor: 'name', formatter: (v: string) => v },
      ];
      const measures: ChartMeasure[] = [
        {
          accessor: 'obj',
          label: 'Obj',
          formatter: (v: number) => String(v),
          axis: 'y',
        },
      ];
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular; // create circular reference
      const dataset: SingleDataPoint[] = [
        { name: 'A', value: 0, obj: circular },
      ];
      const csv = buildCsv(dataset, dimensions, measures);
      const row = csv.split('\n')[1];
      expect(row).toBe('A,');
    });

    it('outputs empty string for unsupported types (e.g., function, symbol)', () => {
      const dimensions: ChartDimension[] = [
        { accessor: 'name', formatter: (v: string) => v },
      ];
      const measures: ChartMeasure[] = [
        {
          accessor: 'weird',
          label: 'Weird',
          formatter: (v: number) => String(v),
          axis: 'y',
        },
      ];
      const dataset: SingleDataPoint[] = [
        { name: 'B', value: 0, weird: () => 42 },
      ];
      const csv = buildCsv(dataset, dimensions, measures);
      const row = csv.split('\n')[1];
      expect(row).toBe('B,');
    });
  });

  describe('downloadChartAsPng', () => {
    it('no-ops when there is no svg in container', () => {
      const container = document.createElement('div');
      expect(() => downloadChartAsPng(container, 't')).not.toThrow();
    });

    it('serializes svg to PNG and triggers download', () => {
      // Build a simple SVG and append to container
      const container = document.createElement('div');
      const svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      ) as unknown as SVGSVGElement;
      svg.setAttribute('width', '200');
      svg.setAttribute('height', '100');
      container.appendChild(svg);

      // Mock canvas and image pipeline
      const originalCreateElement = document.createElement.bind(document);
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: any) => {
          if (tagName === 'canvas') {
            return {
              width: 0,
              height: 0,
              getContext: () => ({
                fillStyle: '',
                fillRect: jest.fn(),
                drawImage: jest.fn(),
              }),
              toBlob: (cb: (b: Blob | null) => void) =>
                cb(new Blob(['png'], { type: 'image/png' })),
            };
          }
          return originalCreateElement(tagName);
        });

      const imgOnloadSpies: Array<() => void> = [];
      jest.spyOn(window, 'Image').mockImplementation(function ImageMock(
        this: any
      ) {
        this.onload = () => {};
        Object.defineProperty(this, 'src', {
          set: () => {
            imgOnloadSpies.push(this.onload);
          },
        });
      } as any);

      const anchor = document.createElement('a');
      jest.spyOn(document, 'createElement').mockReturnValue(anchor);
      const appendSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => document.body);
      const removeSpy = jest
        .spyOn(HTMLElement.prototype, 'remove')
        .mockImplementation(() => {});

      downloadChartAsPng(container, 'My Chart');

      // Fire image onload to continue pipeline
      imgOnloadSpies.forEach((fn) => fn());

      // Should eventually revoke URL and attempt to download
      expect(mockRevokeObjectURL).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });

    it('draws SVG to canvas and downloads PNG with sanitized filename', () => {
      const container = document.createElement('div');
      const svg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      ) as unknown as SVGSVGElement;
      svg.setAttribute('width', '120');
      svg.setAttribute('height', '60');
      container.appendChild(svg);

      const anchor = document.createElement('a');
      const originalCreateElement = document.createElement.bind(document);
      const createElSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: any) => {
          if (tagName === 'canvas') {
            return {
              width: 0,
              height: 0,
              getContext: () => ({
                fillStyle: '',
                fillRect: jest.fn(),
                drawImage: jest.fn(),
              }),
              toBlob: (cb: (b: Blob | null) => void) =>
                cb(new Blob(['png'], { type: 'image/png' })),
            } as unknown as HTMLCanvasElement;
          }
          if (tagName === 'a') {
            return anchor as unknown as HTMLAnchorElement;
          }
          return originalCreateElement(tagName);
        });

      const imgOnloadSpies: Array<() => void> = [];
      jest.spyOn(window, 'Image').mockImplementation(function ImageMock(
        this: any
      ) {
        this.onload = () => {};
        Object.defineProperty(this, 'src', {
          set: () => {
            imgOnloadSpies.push(this.onload);
          },
        });
      } as any);

      downloadChartAsPng(container, 'My Chart');
      imgOnloadSpies.forEach((fn) => fn());

      // URL.createObjectURL should be called twice: once for SVG, once for PNG
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      const pngBlobArg = (mockCreateObjectURL as jest.Mock).mock
        .calls[1][0] as Blob;
      expect(pngBlobArg).toBeInstanceOf(Blob);
      expect(pngBlobArg.type).toBe('image/png');

      // The anchor should receive a sanitized filename ending with .png
      expect(anchor.download).toBe('My_Chart.png');

      createElSpy.mockRestore();
    });
  });
});
