import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import "@testing-library/jest-dom";
import React from "react";
import { useCreateChat } from "@/hooks/chats";

const mockPush = jest.fn();
const mockMutate = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}));

jest.mock("@/hooks/chats", () => ({
  useCreateChat: jest.fn(),
}));

const mockUseCreateChat = useCreateChat as jest.MockedFunction<
  typeof useCreateChat
>;

describe("Home page", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockMutate.mockClear();
    jest.clearAllMocks();
  });

  it("renders loading display by default", () => {
    mockUseCreateChat.mockReturnValue({
      mutate: mockMutate,
      data: undefined,
      error: null,
      isLoading: true,
      reset: jest.fn(),
    });

    render(<Home />);

    expect(screen.getByText("Creating Your Analysis...")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Setting up your analysis dashboard. You'll be redirected automatically."
      )
    ).toBeInTheDocument();
  });

  it("calls createAnalysis on mount", async () => {
    mockUseCreateChat.mockReturnValue({
      mutate: mockMutate,
      data: undefined,
      error: null,
      isLoading: true,
      reset: jest.fn(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  it("navigates to analysis page on successful creation", async () => {
    const mockAnalysis = {
      id: "test-analysis-id",
      date: "2021-01-01",
      participants: [],
      title: "Test Analysis",
      messages: [],
    };

    mockUseCreateChat.mockImplementation(({ onSuccess }) => {
      React.useEffect(() => {
        if (onSuccess) {
          onSuccess(mockAnalysis);
        }
      }, [onSuccess]);

      return {
        mutate: mockMutate,
        data: {
          data: mockAnalysis,
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

  it("displays error when analysis creation fails", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const testError = new Error("Failed to create analysis");

    mockUseCreateChat.mockImplementation(({ onError }) => {
      React.useEffect(() => {
        if (onError) {
          onError(testError);
        }
      }, [onError]);

      return {
        mutate: mockMutate,
        data: undefined,
        error: testError,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText(testError.message)).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to create analysis:",
      testError
    );

    consoleSpy.mockRestore();
  });

  it("handles retry functionality correctly", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const testError = new Error("Failed to create analysis");

    mockUseCreateChat.mockImplementation(({ onError }) => {
      React.useEffect(() => {
        if (onError) {
          onError(testError);
        }
      }, [onError]);

      return {
        mutate: mockMutate,
        data: undefined,
        error: testError,
        isLoading: false,
        reset: jest.fn(),
      };
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    mockMutate.mockClear();

    const retryButton = screen.getByText("Try again");
    fireEvent.click(retryButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it("only calls mutate once on mount even with strict mode", async () => {
    mockUseCreateChat.mockReturnValue({
      mutate: mockMutate,
      data: undefined,
      error: null,
      isLoading: true,
      reset: jest.fn(),
    });

    // Simulate React.StrictMode double-render
    const { unmount } = render(<Home />);
    unmount();
    render(<Home />);

    // Should still only be called once per component instance
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(2); // Once per render
    });
  });
});
