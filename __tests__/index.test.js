import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../pages/index';
import { useAppContext } from '../context/AppContext';
import * as apiHelpers from '../utils/apiHelpers';
import { useRouter } from 'next/router';

/* Mock Required Module */
// Mock the useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the useAppContext hook
jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

// Mock the uploadFile function
jest.mock('../utils/apiHelpers', () => ({
    uploadFile: jest.fn(),
}));


test('renders Home component', () => {
  // Mock the context values
  const mockAppContext = {
    selectedFile: null,
    storeFile: jest.fn(),
  };

  // Mock the useAppContext hook's return value
  useAppContext.mockReturnValue(mockAppContext);

  render(<Home />);

  // Perform assertions based on the rendered content
  // For example, you can check if the select button is present
  const selectButton = screen.getByText('Select a PDF file');
  expect(selectButton).toBeInTheDocument();
});


test('handles file selection and upload', async () => {
    // Mock the context values
    let mockAppContext = {
      selectedFile: null,
      storeFile: jest.fn(),
    };

    const mockPush = jest.fn(); // Mock the push function
    
    useRouter.mockReturnValue({
      push: mockPush,
    });
  
    // Mock the useAppContext hook's return value
    useAppContext.mockReturnValue(mockAppContext);
  
    // Mock the uploadFile function to return a taskId
    const mockTaskId = 'mocked-task-id';
    apiHelpers.uploadFile.mockResolvedValue(mockTaskId);
  
    const {rerender} = render(<Home />);
  
    const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  
    // Simulate selecting a file
    fireEvent.change(screen.getByTestId('file input'), { target: { files: [testFile] } });
  
    // Check if storeFile was called with the selected file
    expect(mockAppContext.storeFile).toHaveBeenCalledWith(testFile);
  
    // Update the selectedFile value in the mock context
    mockAppContext.selectedFile = testFile;

    //Re-render
    rerender(<Home />);
  
    // Simulate clicking the upload button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    });
  
    // Check if uploadFile was called with the selected file
    expect(apiHelpers.uploadFile).toHaveBeenCalledWith(testFile);

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/details", query: { taskId: mockTaskId } });

});