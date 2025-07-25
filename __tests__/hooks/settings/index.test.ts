import { useSettings } from "@/hooks/settings";
import { getSettings } from "@/lib/services/settings.service";
import { dataFetcher } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  dataFetcher: {
    fetchData: jest.fn(),
  },
}));
jest.mock("@/lib/services/settings.service", () => ({
  getSettings: jest.fn(),
}));

describe("useSettings hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns correct data and calls fetchData with SETTINGS_KEY and getSettings", () => {
    const mockFetcher = { data: { data: { theme: "dark" } }, isLoading: false };
    (dataFetcher.fetchData as jest.Mock).mockReturnValue(mockFetcher);
    const result = useSettings();
    expect(dataFetcher.fetchData).toHaveBeenCalledWith("settings", getSettings);
    expect(result.data).toEqual({ theme: "dark" });
    expect(result.isLoading).toBe(false);
  });
});
