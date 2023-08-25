import {React} from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom'
import EDButton from '../components/EditDeleteButtonControl';

test('renders Edit button when not editable', () => {
    render(<EDButton isEditable={false} />);
    const editButton = screen.getByLabelText('edit');
    expect(editButton).toBeInTheDocument();
  });
  
  test('renders Save button when editable', () => {
    render(<EDButton isEditable={true} />);
    const saveButton = screen.getByLabelText('save');
    expect(saveButton).toBeInTheDocument();
  });
  
  test('renders Delete button when showDelete is true', () => {
    render(<EDButton showDelete={true} />);
    const deleteButton = screen.getByLabelText('delete');
    expect(deleteButton).toBeInTheDocument();
  });
  
  test('does not render Delete button when showDelete is false', () => {
    render(<EDButton showDelete={false} />);
    const deleteButton = screen.queryByLabelText('delete');
    expect(deleteButton).not.toBeInTheDocument();
  });
  
  test('clicking Edit button sets isEditable to true', () => {
    const setIsEditable = jest.fn();
    render(<EDButton isEditable={false} setIsEditable={setIsEditable} />);
    const editButton = screen.getByLabelText('edit');
    fireEvent.click(editButton);
    expect(setIsEditable).toHaveBeenCalledWith(true);
  });
  
  test('clicking Save button calls onSave', () => {
    const onSave = jest.fn();
    render(<EDButton isEditable={true} onSave={onSave} />);
    const saveButton = screen.getByLabelText('save');
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalled();
  });

  test('clicking Delete button calls onDelete', () => {
    const onDelete = jest.fn();
    render(<EDButton isEditable={true} onDelete={onDelete} />);
    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalled();
  });