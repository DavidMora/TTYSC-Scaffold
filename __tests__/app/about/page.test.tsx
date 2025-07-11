import { render, screen, fireEvent } from "@testing-library/react";
import About from "@/app/about/page";
import "@testing-library/jest-dom";
import React from "react";

const mockPush = jest.fn();

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock @ui5/webcomponents-react components
jest.mock("@ui5/webcomponents-react", () => ({
  Page: ({ children }: any) => <div>{children}</div>,
  Title: ({ children }: any) => <h1>{children}</h1>,
  Text: ({ children }: any) => <p>{children}</p>,
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ titleText }: any) => <div>{titleText}</div>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  FlexBox: ({ children }: any) => <div>{children}</div>,
  Panel: ({ children, headerText }: any) => (
    <div>
      <h2>{headerText}</h2>
      {children}
    </div>
  ),
  Icon: ({ name }: any) => <span data-name={name} />,
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  FlexBoxDirection: { Column: "column", Row: "row" },
  FlexBoxJustifyContent: { Center: "center" },
  FlexBoxAlignItems: { Center: "center" },
}));

describe("About page", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the main title", () => {
    render(<About />);
    expect(screen.getByText("About This Project")).toBeInTheDocument();
  });

  it("navigates to home page on button click", () => {
    render(<About />);

    const homeButton = screen.getByTestId("back-to-home-button");
    fireEvent.click(homeButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
