import { downloadFile } from "@/lib/utils/exportFile";
import { ExportTableResponse } from "@/lib/types/export";
import { EXPORT_CONFIG } from "@/lib/constants/UI/export";

// Mock DOM APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock document methods
Object.defineProperty(document, "createElement", {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document.body, "appendChild", {
  value: mockAppendChild,
  writable: true,
});

Object.defineProperty(document.body, "removeChild", {
  value: mockRemoveChild,
  writable: true,
});

describe("downloadFile", () => {
  const mockBlob = new Blob(["test data"], { type: "text/csv" });
  const mockResponse: ExportTableResponse = {
    blob: mockBlob,
    filename: "test-file.csv",
    contentType: "text/csv",
  };

  const mockLink = {
    href: "",
    download: "",
    style: { display: "" },
    click: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    mockCreateElement.mockReturnValue(mockLink);
  });

  it("should download file successfully", () => {
    downloadFile(mockResponse);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    expect(mockLink.href).toBe("blob:mock-url");
    expect(mockLink.download).toBe("test-file.csv");
    expect(mockLink.style.display).toBe("none");
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("should throw error when file size exceeds maximum", () => {
    const largeBlob = new Blob(["x".repeat(EXPORT_CONFIG.maxFileSize! + 1)]);
    const largeResponse: ExportTableResponse = {
      blob: largeBlob,
      filename: "large-file.csv",
      contentType: "text/csv",
    };

    expect(() => downloadFile(largeResponse)).toThrow("Download error");

    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockCreateElement).not.toHaveBeenCalled();
  });
});
