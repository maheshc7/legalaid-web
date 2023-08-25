import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { useIsAuthenticated } from '@azure/msal-react';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('@azure/msal-react', () => ({
  useIsAuthenticated: jest.fn(),
}));

describe('Layout component', () => {
  it('renders properly when authenticated', () => {
    useRouter.mockReturnValue({
      push: jest.fn(),
    });

    useAppContext.mockReturnValue({
      user: { displayName: 'John Doe' },
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    useIsAuthenticated.mockReturnValue(true);

    const { container } = render(<Layout children={<div>Content</div>} />);
    expect(container).toMatchSnapshot();

    // Test user menu
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders properly when not authenticated and not home', () => {
    useRouter.mockReturnValue({
      push: jest.fn(),
    });

    useAppContext.mockReturnValue({
      signIn: jest.fn(),
    });

    useIsAuthenticated.mockReturnValue(false);

    const { container } = render(<Layout children={<div>Content</div>} />);
    expect(container).toMatchSnapshot();

    // Test "Connect Outlook" button
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Connect Outlook')).toBeInTheDocument();
  });

  it('renders properly on home page', () => {
    useRouter.mockReturnValue({
      push: jest.fn(),
      pathname: '/',
    });

    useAppContext.mockReturnValue({
      signIn: jest.fn(),
    });

    useIsAuthenticated.mockReturnValue(false);

    const { container } = render(<Layout children={<div>Content</div>} home />);
    expect(container).toMatchSnapshot();

    // Check that "Connect Outlook" button is not present on home page
    expect(screen.queryByText('Connect Outlook')).not.toBeInTheDocument();
  });
});
