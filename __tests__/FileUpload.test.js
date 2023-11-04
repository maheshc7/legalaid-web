import { React } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../components/FileUpload";
import { useAppContext } from "../context/AppContext"; // Import the context

// Mock the useAppContext hook
jest.mock("../context/AppContext", () => ({
  useAppContext: jest.fn(),
}));

test("renders FileUpload component", () => {
  render(<FileUpload />); // Render the component

  // Use screen queries to find elements and make assertions
  const selectButton = screen.getByText("Select a PDF file");
  expect(selectButton).toBeInTheDocument();
});

test("selects and stores a file", async () => {
  const mockOnSelect = jest.fn(); // Mock the storeFile function
  const testFile = new File(["test content"], "test.pdf", {
    type: "application/pdf",
  });

  render(<FileUpload onSelect={mockOnSelect} />); // Pass the mock function as onSelect prop

  const fileInput = screen.getByTestId("file input");
  fireEvent.change(fileInput, { target: { files: [testFile] } });

  expect(mockOnSelect).toHaveBeenCalledWith(testFile);
});

test("selects and updates selectedFile in AppContext", async () => {
  const mockStoreFile = (file) => {
    mockAppContext.selectedFile = file;
  };
  let mockAppContext = {
    selectedFile: null,
    storeFile: mockStoreFile,
  };

  useAppContext.mockReturnValue(mockAppContext);

  render(
    <FileUpload
      onSelect={mockStoreFile}
      selectedFile={mockAppContext.selectedFile}
    />
  );

  const testFile = new File(["test content"], "test.pdf", {
    type: "application/pdf",
  });
  const fileInput = screen.getByTestId("file input");

  fireEvent.change(fileInput, { target: { files: [testFile] } });

  expect(mockAppContext.selectedFile).toEqual(testFile);

  // Re-render the component with updated prop value
  render(
    <FileUpload
      onSelect={mockStoreFile}
      selectedFile={mockAppContext.selectedFile}
    />
  );

  // Make assertions with the updated prop value
  const updatedSelectedFileName = screen.getByText(testFile.name);
  expect(updatedSelectedFileName).toBeInTheDocument();
});

test("displays an error for non-PDF file selection", async () => {
  const testFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  const mockOnSelect = jest.fn();
  render(<FileUpload onSelect={mockOnSelect} />);

  const fileInput = screen.getByTestId("file input");

  fireEvent.change(fileInput, { target: { files: [testFile] } });

  const errorMessage = await screen.findByText("Please select a PDF file.");
  expect(errorMessage).toBeInTheDocument();
});

test("calls onUpload function on upload with selected file", async () => {
  const mockOnUpload = jest.fn();
  const testFile = new File(["test content"], "test.pdf", {
    type: "application/pdf",
  });

  render(<FileUpload selectedFile={testFile} onUpload={mockOnUpload} />);

  const uploadButton = screen.getByRole("button", { name: "Upload" });
  fireEvent.click(uploadButton);

  expect(mockOnUpload).toHaveBeenCalled();
});

test("display error when onUpload is called with a non-pdf", async () => {
  const mockOnUpload = jest.fn();
  const testFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  render(<FileUpload selectedFile={testFile} onUpload={mockOnUpload} />);

  const uploadButton = screen.getByTestId("upload btn");
  fireEvent.click(uploadButton);

  const errorMessage = await screen.findByText("Please select a PDF file.");
  expect(errorMessage).toBeInTheDocument();
});

describe("FileUpload component", () => {
  it("handles file drop correctly", () => {
    const mockOnSelect = jest.fn();
    render(<FileUpload onSelect={mockOnSelect} />);
    const dropZone = screen.getByTestId("drop zone");

    // Simulate dropping a PDF file
    const file = new File(["(pdf content)"], "example.pdf", {
      type: "application/pdf",
    });
    const dropEvent = new Event("drop", { bubbles: true });
    dropEvent.dataTransfer = {
      files: [file],
      setData: jest.fn(),
      getData: jest.fn(),
    };
    fireEvent(dropZone, dropEvent);

    // Add assertions to check if the file is dropped correctly
  });

  it("displays error message for invalid dropped file", () => {
    const mockOnSelect = jest.fn();
    render(<FileUpload onSelect={mockOnSelect} />);
    const dropZone = screen.getByTestId("drop zone");

    // Simulate dropping a non-PDF file
    const file = new File(["(txt content)"], "example.txt", {
      type: "text/plain",
    });
    const dropEvent = new Event("drop", { bubbles: true });
    dropEvent.dataTransfer = {
      files: [file],
      setData: jest.fn(),
      getData: jest.fn(),
    };
    fireEvent(dropZone, dropEvent);

    // Add assertions to check if the error message is displayed correctly
  });

  it("handles dragover event correctly", () => {
    const mockOnSelect = jest.fn();
    render(<FileUpload onSelect={mockOnSelect} />);
    const dropZone = screen.getByTestId("drop zone");

    // Mock preventDefault and stopPropagation methods
    const preventDefaultMock = jest.fn();
    const stopPropagationMock = jest.fn();

    // Simulate dragover event with mocked methods
    const dragOverEvent = new Event("dragover", { bubbles: true });
    Object.defineProperty(dragOverEvent, "dataTransfer", {
      value: {
        files: [],
        types: ["Files"],
        setData: jest.fn(),
        getData: jest.fn(),
      },
    });
    dragOverEvent.preventDefault = preventDefaultMock;
    dragOverEvent.stopPropagation = stopPropagationMock;

    fireEvent(dropZone, dragOverEvent);

    // Assertions
    expect(preventDefaultMock).toHaveBeenCalledTimes(1);
    expect(stopPropagationMock).toHaveBeenCalledTimes(1);
  });
});
