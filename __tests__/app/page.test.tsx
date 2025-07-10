import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";
import "@testing-library/jest-dom";
import React from "react";

const mockPush = jest.fn();

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/", // Add this if any component needs it
}));

// Mock @ui5/webcomponents-react components
jest.mock("@ui5/webcomponents-react", () => ({
  Page: ({ children, style }: any) => <div style={style}>{children}</div>,
  Title: ({ children, style }: any) => <h1 style={style}>{children}</h1>,
  Text: ({ children, style }: any) => <p style={style}>{children}</p>,
  Card: ({ children, style }: any) => <div style={style}>{children}</div>,
  CardHeader: ({ titleText }: any) => <div>{titleText}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  FlexBox: ({ children, style }: any) => <div style={style}>{children}</div>,
  MessageStrip: ({ children }: any) => <div>{children}</div>,
  Icon: ({ name, slot }: any) => <span data-name={name} data-slot={slot} />,
  FlexBoxDirection: { Column: "column", Row: "row" },
  FlexBoxJustifyContent: { SpaceAround: "space-around", Center: "center" },
  FlexBoxAlignItems: { Center: "center" },
}));

describe("Home page", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the main title", () => {
    render(<Home />);
    expect(screen.getByText("Welcome to SAPUI5 Next.js")).toBeInTheDocument();
  });

  it("navigates to about page on button click", () => {
    render(<Home />);

    const aboutButton = screen.getByText("Learn About This Project");
    fireEvent.click(aboutButton);

    expect(mockPush).toHaveBeenCalledWith("/about");
  });
});
