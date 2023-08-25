import {React} from 'react';
import dayjs from 'dayjs';
import { render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom'
import EventDetail from '../components/EventDetail';

describe('EventDetail component', () => {
    const mockEntry = {
        id: 1,
        subject: 'Meeting',
        date: '07/20/2023',
        description: 'Discuss project updates',
    };

    const mockOnChange = jest.fn();
    const mockOnDelete = jest.fn();

    test('renders EventDetail component', () => {
        render(<EventDetail entry={mockEntry} onChange={mockOnChange}/>);
        
        // Check if the subject input field is rendered
        const subjectField = screen.getByLabelText('Subject');
        expect(subjectField).toBeInTheDocument();
      
        // Check if the date picker is rendered
        const dateField = screen.getByLabelText('Start');
        expect(dateField).toBeInTheDocument();
      
        // Check if the description input field is rendered
        const descriptionField = screen.getByLabelText('Description');
        expect(descriptionField).toBeInTheDocument();

        expect(subjectField).toHaveValue(mockEntry.subject);
        expect(descriptionField).toHaveValue(mockEntry.description);
        expect(dateField).toHaveValue(mockEntry.date);
    });

    test('can edit and update subject field', async() => {

        let mockEntryUpdate = mockEntry
        mockEntryUpdate.subject = 'Updated Subject'
        mockEntryUpdate.isEditable = true
        mockEntryUpdate.date = dayjs(mockEntry.date)
      
        render(<EventDetail entry={mockEntry} onChange={mockOnChange} />);
      
        const subjectField = screen.getByLabelText('Subject');
        
        fireEvent.click(screen.getByLabelText('edit'));
        
        await act( async()=> {
            fireEvent.change(subjectField, { target: { value: mockEntryUpdate.subject } });
        });

        expect(subjectField).toHaveValue('Updated Subject');
        expect(mockOnChange).toHaveBeenLastCalledWith(mockEntryUpdate);
    });

    describe('EventDetails on invalid input', () => {

        test('displays error for empty subject field', () => {
            render(<EventDetail entry={mockEntry} onChange={mockOnChange}/>);

            const subjectField = screen.getByLabelText('Subject');
            // Clear the input field
            fireEvent.change(subjectField, { target: { value: '' } });
            expect(subjectField).toHaveValue('');

            // Verify that the error styling is applied
            expect(subjectField.parentElement).toHaveClass('Mui-error');
        });

        test('displays error for empty date field', () => {
            render(<EventDetail entry={mockEntry} onChange={mockOnChange}/>);

            const dateField = screen.getByLabelText('Start');
            // Clear the input field
            fireEvent.change(dateField, { target: { value: '' } });
            expect(dateField).toHaveValue('MM/DD/YYYY');

            // Verify that the error styling is applied
            expect(dateField.parentElement).toHaveClass('Mui-error');
        });

        test('displays error for empty description field', () => {
            render(<EventDetail entry={mockEntry} onChange={mockOnChange}/>);

            const descriptionField = screen.getByLabelText('Description');
            // Clear the input field
            fireEvent.change(descriptionField, { target: { value: '' } });
            expect(descriptionField).toHaveValue('');

            // Verify that the error styling is applied
            expect(descriptionField.parentElement).toHaveClass('Mui-error');
        });

    });
});
