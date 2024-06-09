import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useAppContext } from "../context/AppContext";
import { useIsAuthenticated } from "@azure/msal-react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

useRouter.mockReturnValue({
  push: jest.fn(),
});

jest.mock("../context/AppContext", () => ({
  useAppContext: jest.fn(),
}));

jest.mock("@azure/msal-react", () => ({
  useIsAuthenticated: jest.fn(),
}));

const mockAppContext = {
  user: { displayName: "John Doe" },
  signIn: jest.fn(),
  signOut: jest.fn(),
};
useAppContext.mockReturnValue(mockAppContext);

describe("Layout component", () => {
  it("renders properly when authenticated", () => {
    useRouter.mockReturnValue({
      push: jest.fn(),
    });

    useIsAuthenticated.mockReturnValue(true);

    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(container).toMatchSnapshot();

    // Test user menu
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders properly when not authenticated and not home", () => {
    useIsAuthenticated.mockReturnValue(false);

    const { container } = render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(container).toMatchSnapshot();

    // Test "Connect Outlook" button
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Connect Outlook")).toBeInTheDocument();
  });

  it("renders properly on home page", () => {
    useIsAuthenticated.mockReturnValue(false);

    const { container } = render(
      <Layout home>
        <div>Content</div>
      </Layout>
    );

    expect(container).toMatchSnapshot();

    // Check that "Connect Outlook" button is not present on home page
    expect(screen.queryByText("Connect Outlook")).not.toBeInTheDocument();
  });

  test("renders Home component", () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Find the image element by its alt text
    const logoImage = screen.getByAltText("LegalAid");

    // Simulate a click event on the image
    fireEvent.click(logoImage);

    // Assert that the router.push function was called with the expected argument ("/")
    expect(useRouter().push).toHaveBeenCalledWith("/");
  });

  test("handle logout button", () => {
    useIsAuthenticated.mockReturnValue(true);

    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );

    // Find the menu item by its text content
    const logoutMenuItem = screen.getByText("Logout");

    // Simulate a click event on the logout menu item
    fireEvent.click(logoutMenuItem);

    // Assert that signOut function is called when Logout is clicked
    expect(mockAppContext.signOut).toHaveBeenCalled();
  });
});
