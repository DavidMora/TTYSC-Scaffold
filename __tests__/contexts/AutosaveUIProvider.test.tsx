import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  AutosaveUIProvider,
  useAutosaveUI,
} from "@/contexts/AutosaveUIProvider";

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

// Test component to use the context
const TestComponent = () => {
  const { showAutoSaved, activateAutosaveUI } = useAutosaveUI();
  return (
    <div>
      <div data-testid="autosave-status">
        {showAutoSaved ? "Auto-saved" : "Not auto-saved"}
      </div>
      <button data-testid="activate-button" onClick={activateAutosaveUI}>
        Activate
      </button>
    </div>
  );
};

describe("AutosaveUIProvider", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Provider Rendering", () => {
    it("should render children correctly", () => {
      render(
        <AutosaveUIProvider>
          <div data-testid="test-child">Test Child</div>
        </AutosaveUIProvider>
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Child")).toBeInTheDocument();
    });

    it("should provide context value to children", () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      expect(screen.getByTestId("autosave-status")).toBeInTheDocument();
      expect(screen.getByTestId("activate-button")).toBeInTheDocument();
    });
  });

  describe("activateAutosaveUI", () => {
    it("should reset timer when activated multiple times", async () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const activateButton = screen.getByTestId("activate-button");

      // First activation
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Wait 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second activation (should reset timer)
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Wait 1 second (should still be showing)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Wait another second (should hide now)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );
    });
  });

  describe("useAutosaveUI Hook", () => {
    it("should throw error when used outside provider", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAutosaveUI must be used within an AutosaveUIProvider");

      consoleSpy.mockRestore();
    });
  });
});
