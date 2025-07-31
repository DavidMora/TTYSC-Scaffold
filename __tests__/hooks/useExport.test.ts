import { renderHook, act } from "@testing-library/react";
import { ExportFormat } from "@/lib/types/export";

// Mock dependencies
jest.mock("@/lib/services/export.service");
jest.mock("@/lib/utils/exportFile");

// Import the mocked functions
import { getExportTable } from "@/lib/services/export.service";
import { downloadFile } from "@/lib/utils/exportFile";

const mockGetExportTable = getExportTable as jest.MockedFunction<
  typeof getExportTable
>;
const mockDownloadFile = downloadFile as jest.MockedFunction<
  typeof downloadFile
>;

// Import the actual hook after mocks
jest.unmock("@/hooks/useExport");
import { useExportTable } from "@/hooks/useExport";
import { HttpClientResponse } from "@/lib/types/api/http-client";

describe("useExportTable", () => {
  const mockTableId = 123;
  const mockFormat: ExportFormat = {
    id: "csv",
    name: "CSV",
    icon: "add-document",
    mimeType: "text/csv",
    fileExtension: ".csv",
  };

  const mockBlob = new Blob(["test data"], { type: "text/csv" });
  const mockResponse = {
    data: mockBlob,
    status: 200,
    statusText: "OK",
    ok: true,
    headers: {
      "content-type": "text/csv",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetExportTable.mockResolvedValue(mockResponse);
    mockDownloadFile.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("exportToFormat", () => {
    it("should export table to CSV format successfully", async () => {
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
        filename: expect.stringMatching(/^table_\d+_\d+\/\d+\/\d+\.csv$/),
        contentType: mockFormat.mimeType,
      });
    });

    it("should call getExportTable with correct parameters", async () => {
      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(mockGetExportTable).toHaveBeenCalledTimes(1);
      expect(mockGetExportTable).toHaveBeenCalledWith({
        tableId: mockTableId,
        format: mockFormat.id,
        mimeType: mockFormat.mimeType,
      });
    });

    it("should export table to Excel format successfully", async () => {
      const excelFormat: ExportFormat = {
        id: "excel",
        name: "Excel",
        icon: "excel-attachment",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileExtension: ".xlsx",
      };

      const excelBlob = new Blob(["excel data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const excelResponse = {
        data: excelBlob,
        status: 200,
        statusText: "OK",
        ok: true,
        headers: {
          "content-type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      };

      mockGetExportTable.mockResolvedValue(excelResponse);

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(excelFormat);
      });

      expect(mockGetExportTable).toHaveBeenCalledWith({
        tableId: mockTableId,
        format: excelFormat.id,
        mimeType: excelFormat.mimeType,
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        blob: excelBlob,
        filename: expect.stringMatching(/^table_\d+_\d+\/\d+\/\d+\.xlsx$/),
        contentType: excelFormat.mimeType,
      });
    });

    it("should fallback to format mimeType when content-type header is missing", async () => {
      const responseWithoutContentType = {
        data: mockBlob,
        status: 200,
        statusText: "OK",
        ok: true,
        headers: {},
      };

      mockGetExportTable.mockResolvedValue(responseWithoutContentType);

      const { result } = renderHook(() => useExportTable(mockTableId));

      await act(async () => {
        await result.current.exportToFormat(mockFormat);
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        blob: mockBlob,
        filename: expect.stringMatching(/^table_\d+_\d+\/\d+\/\d+\.csv$/),
        contentType: mockFormat.mimeType,
      });
    });

    it("should throw error when response data is null", async () => {
      const responseWithoutData = {
        data: null,
        status: 200,
        statusText: "OK",
        ok: true,
        headers: {},
      };

      mockGetExportTable.mockResolvedValue(
        responseWithoutData as unknown as HttpClientResponse<Blob>
      );

      const { result } = renderHook(() => useExportTable(mockTableId));

      await expect(
        act(async () => {
          await result.current.exportToFormat(mockFormat);
        })
      ).rejects.toThrow("Error getting export table");

      expect(mockDownloadFile).not.toHaveBeenCalled();
    });
  });
});
