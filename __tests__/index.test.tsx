/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the Next.js logo", () => {
    render(<Home />);

    const logo = screen.getByRole("img", {
      name: /next\.js logo/i,
    });

    expect(logo).toBeInTheDocument();
  });
});
