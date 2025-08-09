import React from "react";
import { render, screen } from "@testing-library/react";
import FeatureFlaggedDialog from "@/components/Modals/FeatureFlaggedDialog";

// Mock the hook to control flag state
jest.mock("@/hooks/useFeatureFlags", () => ({
  useFeatureFlag: jest.fn(),
}));

import { useFeatureFlag } from "@/hooks/useFeatureFlags";

describe("FeatureFlaggedDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Dialog when loading is true (no flicker)", () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({
      flag: false,
      loading: true,
      error: null,
    });

    render(
      <FeatureFlaggedDialog open header={<div>Header</div>}>
        Content
      </FeatureFlaggedDialog>
    );

    expect(document.querySelector('[data-testid="ui5-dialog"]')).toBeInTheDocument();
  });

  it("renders fallback when flag disabled and not loading", () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({
      flag: false,
      loading: false,
      error: null,
    });

    render(
      <FeatureFlaggedDialog
        open
        fallback={<div data-testid="fallback">off</div>}
      >
        Content
      </FeatureFlaggedDialog>
    );

    expect(document.querySelector('[data-testid="ui5-dialog"]')).not.toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("renders Dialog when flag enabled", () => {
    (useFeatureFlag as jest.Mock).mockReturnValue({
      flag: true,
      loading: false,
      error: null,
    });

    render(<FeatureFlaggedDialog open>Content</FeatureFlaggedDialog>);

    expect(document.querySelector('[data-testid="ui5-dialog"]')).toBeInTheDocument();
  });
});
