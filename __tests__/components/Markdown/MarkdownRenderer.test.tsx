import React, { act } from "react";
import { render, waitFor } from "@testing-library/react";
import MarkdownRenderer from "@/components/Markdown/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches server-rendered HTML and renders it", async () => {
    const mockHtml = "<p>Hi <em>there</em></p>";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ html: mockHtml }),
    } as unknown as Response);

    render(<MarkdownRenderer markdown={"Hi _there_"} />);

    await waitFor(() => {
      const p = document.querySelector("p");
      expect(p).not.toBeNull();
      expect(p?.textContent).toContain("Hi there");
    });
  });

  it("calls onError and clears html on fetch failure", async () => {
    const onError = jest.fn();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    } as unknown as Response);

    render(<MarkdownRenderer markdown={"x"} onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(document.querySelector("p")).toBeNull();
    });
  });

  it("does not update state if unmounted before fetch success resolves", async () => {
    jest.useFakeTimers();

    const mockHtml = "<p>Later</p>";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { html: mockHtml };
      },
    } as unknown as Response);

    const { unmount } = render(<MarkdownRenderer markdown={"Later"} />);
    unmount();

    jest.advanceTimersByTime(20);
    jest.useRealTimers();

    await waitFor(() => {
      expect(document.querySelector("p")).toBeNull();
    });
  });

  it("does not update state (but calls onError) if unmounted before fetch error resolves", async () => {
    jest.useFakeTimers();

    const onError = jest.fn();
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        await new Promise((r) => setTimeout(r, 10));
        throw new Error("boom");
      },
    } as unknown as Response);

    const { unmount } = render(
      <MarkdownRenderer markdown={"x"} onError={onError} />
    );
    unmount();

    act(() => {
      jest.advanceTimersByTime(20);
    });
    jest.useRealTimers();

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(document.querySelector("p")).toBeNull();
    });
  });
});
