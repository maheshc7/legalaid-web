import { React } from "react";
import dayjs from "dayjs";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import EventDetail from "../components/EventDetail";

describe("EventDetail component", () => {
  const mockEntry = {
    id: 1,
    subject: "Meeting",
    date: "07/20/2023",
    description: "Discuss project updates",
  };

  const mockOnChange = jest.fn();
  const mockOnDelete = jest.fn();

  test("renders EventDetail component", () => {
    render(<EventDetail entry={mockEntry} onChange={mockOnChange} />);

    // Check if the subject input field is rendered
    const subjectField = screen.getByLabelText("Subject");
    expect(subjectField).toBeInTheDocument();

    // Check if the date picker is rendered
    const dateField = screen.getByLabelText("Start");
    expect(dateField).toBeInTheDocument();

    // Check if the description input field is rendered
    const descriptionField = screen.getByLabelText("Description");
    expect(descriptionField).toBeInTheDocument();

    expect(subjectField).toHaveValue(mockEntry.subject);
    expect(descriptionField).toHaveValue(mockEntry.description);
    expect(dateField).toHaveValue(mockEntry.date);
  });

  test("can edit and update subject field", async () => {
    let mockEntryUpdate = mockEntry;
    mockEntryUpdate.subject = "Updated Subject";
    mockEntryUpdate.isEditable = true;
    mockEntryUpdate.date = dayjs(mockEntry.date);

    render(<EventDetail entry={mockEntry} onChange={mockOnChange} />);

    const subjectField = screen.getByLabelText("Subject");

    fireEvent.click(screen.getByLabelText("edit"));

    await act(async () => {
      fireEvent.change(subjectField, {
        target: { value: mockEntryUpdate.subject },
      });
    });

    expect(subjectField).toHaveValue("Updated Subject");
    expect(mockOnChange).toHaveBeenLastCalledWith(mockEntryUpdate);
  });

  describe("EventDetails on invalid input", () => {
    test("displays error for empty subject field", () => {
      render(<EventDetail entry={mockEntry} onChange={mockOnChange} />);

      const subjectField = screen.getByLabelText("Subject");
      // Clear the input field
      fireEvent.change(subjectField, { target: { value: "" } });
      expect(subjectField).toHaveValue("");

      // Verify that the error styling is applied
      expect(subjectField.parentElement).toHaveClass("Mui-error");
    });

    test("displays error for empty date field", () => {
      render(<EventDetail entry={mockEntry} onChange={mockOnChange} />);

      const dateField = screen.getByLabelText("Start");
      // Clear the input field
      fireEvent.change(dateField, { target: { value: "" } });
      expect(dateField).toHaveValue("MM/DD/YYYY");

      // Verify that the error styling is applied
      expect(dateField.parentElement).toHaveClass("Mui-error");
    });
  });
});

describe("EventDetail component", () => {
  it("should call handleSave when subject and description are provided", () => {
    const entry = {
      id: 1,
      subject: "Sample Subject",
      date: "2023-11-02",
      description: "Sample Description",
    };

    const { getByLabelText } = render(
      <EventDetail
        entry={entry}
        onChange={() => {}}
        onDelete={() => {}}
        scrollToRef={() => {}}
      />
    );

    // Enable editing
    fireEvent.click(getByLabelText("edit"));

    // Update subject and description
    fireEvent.change(getByLabelText("Subject"), {
      target: { value: "Updated Subject" },
    });
    fireEvent.change(getByLabelText("Description"), {
      target: { value: "Updated Description" },
    });

    // Click the Save button
    fireEvent.click(getByLabelText("save"));

    // Check if the component state is updated correctly
    expect(getByLabelText("Subject")).toHaveValue("Updated Subject");
    expect(getByLabelText("Description")).toHaveValue("Updated Description");
  });

  it("should not call handleSave when subject or description is missing", () => {
    const entry = {
      id: 1,
      subject: "",
      date: "2023-11-02",
      description: "",
    };

    const { getByLabelText, getByText } = render(
      <EventDetail
        entry={entry}
        onChange={() => {}}
        onDelete={() => {}}
        scrollToRef={() => {}}
      />
    );

    // Enable editing
    fireEvent.click(getByLabelText("edit"));

    // Click the Save button
    fireEvent.click(getByLabelText("save"));

    // Check if error messages are displayed
    expect(getByText("Subject is required")).toBeInTheDocument();
    expect(getByText("Description is required")).toBeInTheDocument();
  });
});
