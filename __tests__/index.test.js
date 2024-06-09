import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../pages/index";
import { useAppContext } from "../context/AppContext";
import * as apiHelpers from "../utils/apiHelpers";
import { useRouter } from "next/router";

/* Mock Required Module */
// Mock the useRouter
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock the useAppContext hook
jest.mock("../context/AppContext", () => ({
  useAppContext: jest.fn(),
}));

// Mock the uploadFile function
jest.mock("../utils/apiHelpers", () => ({
  uploadFile: jest.fn(),
}));

// Mock the context values
const mockAppContext = {
  selectedFile: null,
  storeFile: jest.fn(),
  displayError: jest.fn(),
  clearError: jest.fn(),
};

// Mock the useAppContext hook's return value
useAppContext.mockReturnValue(mockAppContext);

test("renders Home component", () => {
  render(<Home />);

  // Perform assertions based on the rendered content
  // For example, you can check if the select button is present
  const selectButton = screen.getByText("Select a PDF file");
  expect(selectButton).toBeInTheDocument();
});

test("handles file selection and upload", async () => {
  const mockPush = jest.fn(); // Mock the push function

  useRouter.mockReturnValue({
    push: mockPush,
  });

  // Mock the uploadFile function to return a taskId
  const mockFileName = "mocked-filename";
  apiHelpers.uploadFile.mockResolvedValue(mockFileName);

  const { rerender } = render(<Home />);

  const testFile = new File(["test content"], "test.pdf", {
    type: "application/pdf",
  });

  // Simulate selecting a file
  fireEvent.change(screen.getByTestId("file input"), {
    target: { files: [testFile] },
  });

  // Check if storeFile was called with the selected file
  expect(mockAppContext.storeFile).toHaveBeenCalledWith(testFile);

  // Update the selectedFile value in the mock context
  mockAppContext.selectedFile = testFile;

  //Re-render
  rerender(<Home />);

  // Simulate clicking the upload button
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
  });

  // Check if uploadFile was called with the selected file
  expect(apiHelpers.uploadFile).toHaveBeenCalledWith(testFile);

  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/details",
    query: { filename: mockFileName },
  });
});
