import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AutosaveUIProvider, useAutosaveUI } from "@/contexts/AutosaveUIProvider";

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

  describe("Initial State", () => {
    it("should initialize with showAutoSaved as false", () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );
    });
  });

  describe("activateAutosaveUI", () => {
    it("should set showAutoSaved to true when activated", () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const activateButton = screen.getByTestId("activate-button");
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );
    });

    it("should automatically hide showAutoSaved after 2 seconds", async () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const activateButton = screen.getByTestId("activate-button");
      
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Wait for the timeout to complete
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );
    });

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
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAutosaveUI must be used within an AutosaveUIProvider");

      consoleSpy.mockRestore();
    });

    it("should provide correct context values", () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const statusElement = screen.getByTestId("autosave-status");
      const buttonElement = screen.getByTestId("activate-button");

      expect(statusElement).toBeInTheDocument();
      expect(buttonElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent("Not auto-saved");
    });
  });

  describe("Context Value Stability", () => {
    it("should maintain stable context value references", () => {
      let renderCount = 0;
      let lastActivateAutosaveUI: (() => void) | null = null;

      const TestComponentWithRenderCount = () => {
        renderCount++;
        const { activateAutosaveUI } = useAutosaveUI();
        
        if (lastActivateAutosaveUI && lastActivateAutosaveUI !== activateAutosaveUI) {
          throw new Error("Context value reference changed");
        }
        
        lastActivateAutosaveUI = activateAutosaveUI;
        
        return (
          <button data-testid="activate-button" onClick={activateAutosaveUI}>
            Activate
          </button>
        );
      };

      const { rerender } = render(
        <AutosaveUIProvider>
          <TestComponentWithRenderCount />
        </AutosaveUIProvider>
      );

      const initialRenderCount = renderCount;

      // Trigger a re-render
      rerender(
        <AutosaveUIProvider>
          <TestComponentWithRenderCount />
        </AutosaveUIProvider>
      );

      // Context value should be stable (memoized)
      expect(renderCount).toBe(initialRenderCount + 1);
    });
  });

  describe("Cleanup", () => {
    it("should clear timeout on unmount", () => {
      const { unmount } = render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const activateButton = screen.getByTestId("activate-button");
      
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      unmount();

      // Should not cause any issues after unmount
      act(() => {
        jest.advanceTimersByTime(2000);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid activations", () => {
      render(
        <AutosaveUIProvider>
          <TestComponent />
        </AutosaveUIProvider>
      );

      const activateButton = screen.getByTestId("activate-button");
      
      // Rapid activations
      act(() => {
        activateButton.click();
        activateButton.click();
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Should still hide after 2 seconds from last activation
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );
    });

    it("should handle activation after timeout has already fired", () => {
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

      // Wait for timeout to fire
      act(() => {
        jest.runAllTimers();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );

      // Activate again
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );
    });

    it("should properly clear timeoutRef.current when timeout fires", () => {
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

      // Wait for timeout to fire and verify it clears the status
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );

      // Activate again to verify timeoutRef.current was properly cleared
      act(() => {
        activateButton.click();
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Auto-saved"
      );

      // Wait for timeout to fire again
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId("autosave-status")).toHaveTextContent(
        "Not auto-saved"
      );
    });
  });
}); 