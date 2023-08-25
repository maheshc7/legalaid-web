import {React} from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom'
import CaseDetails from '../components/CaseDetail';

describe('CaseDetails', () => {
    
    const mockUpdateCaseDetail = jest.fn();

     const defaultProps = {
        caseDetail: {
            court: 'Sample Court',
            caseNum: 'Case123',
            plaintiff: 'John Doe',
            defendant: 'Jane Doe',
            },
        updateCaseDetail: mockUpdateCaseDetail,
    };
    
    it('renders without errors', () => {
        render(<CaseDetails {...defaultProps} />);
    });

    it('displays the "Case Details" heading', () => {
        render(<CaseDetails {...defaultProps} />);
        const heading = screen.getByText('Case Details');
        expect(heading).toBeInTheDocument();
    });

    it('renders Edit button when not in editable mode', () => {
    render(<CaseDetails {...defaultProps} />);
    const editButton = screen.getByLabelText('edit');
    expect(editButton).toBeInTheDocument();
    });

    it('renders Save button when in editable mode', () => {
    render(<CaseDetails {...defaultProps} />);
    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);
    const saveButton = screen.getByLabelText('save');
    expect(saveButton).toBeInTheDocument();
    });

    it('calls updateCaseDetail when Save button is clicked', () => {
        render(<CaseDetails {...defaultProps} />);
        const editButton = screen.getByLabelText('edit');
        fireEvent.click(editButton);
        const saveButton = screen.getByLabelText('save');
        fireEvent.click(saveButton);
        expect(mockUpdateCaseDetail).toHaveBeenCalled();
    });

    it('displays input fields with correct initial values', () => {
        render(<CaseDetails {...defaultProps} />);
        const courtInput = screen.getByLabelText('Court');
        expect(courtInput).toHaveValue('Sample Court');
        
        const caseInput = screen.getByLabelText('Case Number');
        expect(caseInput).toHaveValue('Case123');

        const defendantInput = screen.getByLabelText('Defendant');
        expect(defendantInput).toHaveValue('Jane Doe');

        const plaintiffnput = screen.getByLabelText('Plaintiff');
        expect(plaintiffnput).toHaveValue('John Doe');
    });

    it('displays error for empty court field', () => {
        render(<CaseDetails {...defaultProps} />);
        const courtInput = screen.getByLabelText('Court');
        
        // Clear the input field
        fireEvent.change(courtInput, { target: { value: '' } });
        expect(courtInput).toHaveValue('');

        // Verify that the error styling is applied
        expect(courtInput.parentElement).toHaveClass('Mui-error');
    });

    it('displays error for empty case number field', () => {
        render(<CaseDetails {...defaultProps} />);
        const caseInput = screen.getByLabelText('Case Number');
        
        // Clear the input field
        fireEvent.change(caseInput, { target: { value: '' } });
        expect(caseInput).toHaveValue('');

        // Verify that the error styling is applied
        expect(caseInput.parentElement).toHaveClass('Mui-error');
    });

    it('displays error for empty plaintiff field', () => {
        render(<CaseDetails {...defaultProps} />);
        const plaintiffInput = screen.getByLabelText('Plaintiff');
        
        // Clear the input field
        fireEvent.change(plaintiffInput, { target: { value: '' } });
        expect(plaintiffInput).toHaveValue('');

        // Verify that the error styling is applied
        expect(plaintiffInput.parentElement).toHaveClass('Mui-error');
    });

    it('displays error for empty defendant field', () => {
        render(<CaseDetails {...defaultProps} />);
        const defendantInput = screen.getByLabelText('Defendant');
        
        // Clear the input field
        fireEvent.change(defendantInput, { target: { value: '' } });
        expect(defendantInput).toHaveValue('');

        // Verify that the error styling is applied
        expect(defendantInput.parentElement).toHaveClass('Mui-error');
    });

    it('updates field value on input change', () => {
        render(<CaseDetails {...defaultProps} />);
        const courtInput = screen.getByLabelText('Court');
        fireEvent.change(courtInput, { target: { value: 'New Court' } });
        expect(courtInput).toHaveValue('New Court');

        const caseInput = screen.getByLabelText('Case Number');
        fireEvent.change(caseInput, { target: { value: 'New456' } });
        expect(caseInput).toHaveValue('New456');

        const plaintiffInput = screen.getByLabelText('Plaintiff');
        fireEvent.change(plaintiffInput, { target: { value: 'John Doe 2' } });
        expect(plaintiffInput).toHaveValue('John Doe 2');

        const defendantInput = screen.getByLabelText('Defendant');
        fireEvent.change(defendantInput, { target: { value: 'Jane Doe 2' } });
        expect(defendantInput).toHaveValue('Jane Doe 2');
    });

});



