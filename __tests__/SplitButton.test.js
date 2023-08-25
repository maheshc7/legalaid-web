import {React} from 'react';
import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom'
import SplitButton from '../components/SplitButton';

const mockOptions = ['Option 1', 'Option 2', 'Option 3'];

test('renders primary button with initial selected option', () => {
  render(<SplitButton options={mockOptions} />);
  const primaryButton = screen.getByRole('button', { name: 'Option 1' });
  expect(primaryButton).toBeInTheDocument();
});

test('renders dropdown button', async() => {
  render(<SplitButton options={mockOptions} />);
  const dropdownButton = screen.getByRole('button', { name: 'select create event option' });
  expect(dropdownButton).toBeInTheDocument();
});

test('opens dropdown menu when dropdown button is clicked', async () => {
    render(<SplitButton options={mockOptions} />);
    const dropdownButton = screen.getByRole('button', { name: 'select create event option' });
    fireEvent.click(dropdownButton);
  
    await waitFor(() => {
      const dropdownMenu = screen.getByRole('menu');
      expect(dropdownMenu).toBeInTheDocument();
    });
});
  
test('calls onClick when an option is selected', async () => {
    const mockClickHandler = jest.fn();
    render(<SplitButton options={mockOptions} onClick={mockClickHandler} />);
    const dropdownButton = screen.getByRole('button', { name: 'select create event option' });
    fireEvent.click(dropdownButton);
    
    await waitFor(() => {
        const option2 = screen.getByText('Option 2');
        fireEvent.click(option2);
    });
    const option2Btn = screen.getByRole('button', {name: 'Option 2'});
    fireEvent.click(option2Btn);
    expect(mockClickHandler).toHaveBeenCalledWith(1);
});
