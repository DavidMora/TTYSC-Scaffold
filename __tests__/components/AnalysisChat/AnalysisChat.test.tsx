import React from "react";
import { render } from "@testing-library/react";
import AnalysisChat from "@/components/AnalysisChat/AnalysisChat";

describe("AnalysisChat", () => {
  it("renders the chat", () => {
    render(<AnalysisChat />);
  });
});
