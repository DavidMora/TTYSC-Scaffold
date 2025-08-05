import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import SignIn from "@/app/(main)/auth/signin/page";
import "@testing-library/jest-dom";

// Mock the dependencies
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock update function
const mockUpdate = jest.fn();

describe("SignIn Page", () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    mockUseSearchParams.mockReturnValue(mockSearchParams as any);
    // Default return values
    mockSearchParams.get.mockReturnValue(null);
  });

  it("renders loading state correctly", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: mockUpdate,
    });

    render(<SignIn />);

    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
  });

  it("redirects authenticated user with valid session", async () => {
    const mockSession = {
      user: { id: "1", name: "Test User", email: "test@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockSearchParams.get.mockImplementation((key) =>
      key === "callbackUrl" ? "/dashboard" : null
    );

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("handles refresh token error by forcing re-authentication", async () => {
    const mockSession = {
      user: { id: "1", name: "Test User", email: "test@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      error: "RefreshAccessTokenError",
    };

    mockSearchParams.get.mockImplementation((key) =>
      key === "callbackUrl" ? "/dashboard" : null
    );

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("nvlogin", {
        callbackUrl: "/dashboard",
      });
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("initiates sign in for unauthenticated user", async () => {
    mockSearchParams.get.mockImplementation((key) =>
      key === "callbackUrl" ? "/dashboard" : null
    );

    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("nvlogin", {
        callbackUrl: "/dashboard",
      });
    });
  });

  it("uses default callback URL when none provided", async () => {
    mockSearchParams.get.mockReturnValue(null);

    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("nvlogin", { callbackUrl: "/" });
    });
  });

  it("displays user name when session exists", () => {
    const mockSession = {
      user: { id: "1", name: "John Doe", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    expect(screen.getByText(/Signing in as ,?\s*John Doe/)).toBeInTheDocument();
  });

  it("displays session expired error message", () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "error") return "SessionExpired";
      if (key === "callbackUrl") return "/dashboard";
      return null;
    });

    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: mockUpdate,
    });

    render(<SignIn />);

    expect(screen.getByText(/Your session has expired/)).toBeInTheDocument();
    expect(
      screen.getByText(/Attempting to re-authenticate/)
    ).toBeInTheDocument();
  });

  it("handles complex callback URL", async () => {
    mockSearchParams.get.mockImplementation((key) =>
      key === "callbackUrl" ? "/admin/users?tab=active&sort=name" : null
    );

    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("nvlogin", {
        callbackUrl: "/admin/users?tab=active&sort=name",
      });
    });
  });

  it("does not redirect when session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading",
      update: mockUpdate,
    });

    render(<SignIn />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("handles session without user name gracefully", () => {
    const mockSession = {
      user: { id: "1", email: "test@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: "authenticated",
      update: mockUpdate,
    });

    render(<SignIn />);

    expect(screen.queryByText(/Signing in as/)).not.toBeInTheDocument();
  });
});
