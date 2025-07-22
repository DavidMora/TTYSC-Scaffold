import { render, waitFor } from "@testing-library/react";
import Home from "@/app/page";
import "@testing-library/jest-dom";
import React from "react";
import { useCreateAnalysis } from "@/hooks/useAnalysis";

const mockPush = jest.fn();
const mockMutate = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}));

jest.mock("@/hooks/useAnalysis", () => ({
  useCreateAnalysis: jest.fn(),
}));

const mockUseCreateAnalysis = useCreateAnalysis as jest.MockedFunction<
  typeof useCreateAnalysis
>;

describe("Home page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
    jest.clearAllMocks();
  });

  it("navigates to analysis page on successful creation", async () => {
    const mockAnalysis = { id: "test-analysis-id", name: "Test Analysis" };

    mockUseCreateAnalysis.mockImplementation(({ onSuccess }) => {
      if (onSuccess) {
        onSuccess(mockAnalysis);
      }
      return {
        mutate: mockMutate,
        data: {
          data: { analysis: mockAnalysis },
          status: 200,
          statusText: "OK",
          headers: {},
        },
        error: null,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/test-analysis-id");
    });
  });

  it("logs error when analysis creation fails", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const testError = new Error("Failed to create analysis");

    mockUseCreateAnalysis.mockImplementation(({ onError }) => {
      if (onError) {
        onError(testError);
      }
      return {
        mutate: mockMutate,
        data: undefined,
        error: testError,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    render(<Home />);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to create analysis:",
      testError
    );
    consoleSpy.mockRestore();
  });
});
