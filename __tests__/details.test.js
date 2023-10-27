import {React} from 'react';
import { render, screen, fireEvent, act, within} from '@testing-library/react';
import '@testing-library/jest-dom'
import Main from '../pages/details';
import { useAppContext } from '../context/AppContext';
import * as authService from '../utils/authService';
import * as apiHelpers from '../utils/apiHelpers';
import { useRouter } from 'next/router';
import { useIsAuthenticated } from '@azure/msal-react';

/* Mock Required Module */
// Mock the useIsAuthenticated
jest.mock('@azure/msal-react', () => ({
    useIsAuthenticated: jest.fn(),
}));

// Mock the useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

useRouter.mockReturnValue({
    query: {taskId: "mock-task-id"},
  });
  
// Mock the useAppContext hook
jest.mock('../context/AppContext', () => ({
    useAppContext: jest.fn(),
}));
  
// Mock the apiHelper
jest.mock('../utils/apiHelpers', () => ({
      uploadFile: jest.fn(),
      uploadFileGetEvents: jest.fn(),
      downloadICSFile: jest.fn(),
      generateICSContent: jest.fn()
}));

// Mock the MSGraph APIs
jest.mock('../utils/authService', () => ({
    ensureClient: jest.fn(),
    getUser: jest.fn(),
    getUserTimeZone: jest.fn(),
    getOrCreateCalendar: jest.fn(),
    updateCalendar: jest.fn(),
    getContacts: jest.fn(),
    getFilteredContacts: jest.fn(),
    getAppEvents: jest.fn(),
    deleteEvents: jest.fn(),
    postEvents: jest.fn(),
    updateEvents: jest.fn(),
}));

const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
// Mock the context values
let mockAppContext = {
    selectedFile: null,
    storeFile: jest.fn(),
    displayError: jest.fn(),
    user: {id: "id", isOrg: false, timeZone: "Pacific Standard Time"},
    providerAuth: "auth"
};

//Mock Response
let mockResponse = {
    "case": {
        "caseNum": "V1300CV202180084",
        "court": "Arizona Superior Maricopa County",
        "client": "",
        "defendant": "Harvey Specter",
        "plaintiff": "Saul Goodman"
    },
    "events": [
        {
            "date": "2023-02-10",
            "description": "Event #1 description",
            "id": "unique-event-id-1",
            "subject": "Event #1"
        },
        {
            "date": "2023-10-20",
            "description": "Event #2 description",
            "id": "unique-event-id-2",
            "subject": "Event #2"
        }
    ]
};

// Mock the useAppContext hook's return value
useAppContext.mockReturnValue(mockAppContext);
useIsAuthenticated.mockReturnValue(false);
apiHelpers.uploadFileGetEvents.mockResolvedValue([mockResponse.case, mockResponse.events]);

describe('Main Component', () => {

    it('should render without crashing', () => {
        render(<Main />);
    });
  
    it('should display loading indicators for case details and events', async() => {
        apiHelpers.uploadFileGetEvents.mockResolvedValueOnce([null,null]);
        await act(async () => {
            render(<Main />);
          });

        const cirularProgress = screen.getAllByRole('progressbar')
        cirularProgress.forEach(progress =>
            expect(progress).toBeInTheDocument());
    });

    it('should disable split button and email input field', async() => {
        await act(async () => {
            render(<Main />);
          });

        const splitBtnChildren = screen.getByLabelText("split button").childNodes;
        splitBtnChildren.forEach(btn =>
            expect(btn).toBeDisabled());

        const autoCompleteInput = screen.queryByLabelText('Attorney Emails');
        expect(autoCompleteInput).toBeNull();
    });

    it('should enable split button and email input field', async() => {
        useIsAuthenticated.mockReturnValue(true);

        await act(async () => {
            render(<Main />);
          });

        // Toggle case edit button
        const caseDetailContainer = screen.getByTestId('case-detail');
        const editButton = within(caseDetailContainer).getByLabelText('edit');
        fireEvent.click(editButton); //Edit Case Detail

        // Set the client value
        const clientInput = screen.getByLabelText('Client');
        fireEvent.change(clientInput, { target: { value: 'Sample Client' } });

        fireEvent.click(editButton); //Save Case Detail

        const splitBtnChildren = screen.getByLabelText("split button").childNodes;
        splitBtnChildren.forEach(btn =>
            expect(btn).toBeEnabled());

        const autoCompleteInput = screen.queryByLabelText('Attorney Emails');
        expect(autoCompleteInput).toBeInTheDocument();
    });
  
    // Add more tests for other initial rendering elements and loading states
});

describe('Contact Handling', () => {
    it('should handle contact changes correctly', async () => {
        render(<Main />);
        const autoCompleteInput = screen.getByLabelText('Attorney Emails');
        
        fireEvent.change(autoCompleteInput, { target: { value: 'john.doe@example.com' } });
        expect(autoCompleteInput).toHaveValue('john.doe@example.com');
    });
});

describe('Event Handling and Export', () => {
    
    it('should add events correctly', async () => {
        useIsAuthenticated.mockReturnValue(false);
        await act(async () => {
            render(<Main />);
        });

        const initialEventCount = (await screen.findAllByLabelText('Description')).length;
        const addEventButton = screen.getByLabelText('Add Event');
        fireEvent.click(addEventButton);

        // Get the number of event components after clicking the button
        const updatedEventCount = (await screen.findAllByLabelText('Description')).length;

        // Assert that a new event component is added
        expect(updatedEventCount).toBe(initialEventCount + 1);
    });
  
    it('should generate and trigger ICS file download', async () => {
        // useIsAuthenticated.mockReturnValue(false);
        mockResponse.case.client = "Client";
    
        // Render the component
        await act(async () => {
            render(<Main />);
        });

        // Find and click the "Download Events" button
        const exportButton = screen.getByRole('button', { name: 'Download Events' });
        fireEvent.click(exportButton);

        // Assert the correct download behavior
        expect(apiHelpers.generateICSContent).toHaveBeenCalledTimes(1);
        expect(apiHelpers.downloadICSFile).toHaveBeenCalledTimes(1);

    });

    it('should display success message after creating events', async () => {
        useIsAuthenticated.mockReturnValue(true);
        mockResponse.case.client = "Client";
        const mockCalendar = { id: 'mock-calendar-id', isNew: false, isOwner: true}
        authService.getOrCreateCalendar.mockResolvedValue(mockCalendar);
        // Render the component
        await act(async () => {
            render(<Main />);
        });

        // Mock successful event creation
        const splitBtnArrow = screen.getByLabelText("select create event option");
        fireEvent.click(splitBtnArrow);

        const createEventOption = await screen.findByText("Add to Outlook");
        await act(async () => fireEvent.click(createEventOption));

        const createEventBtn = await screen.findByRole('button', { name: 'Add to Outlook' });
        const mockEventDetails = {
            id: 1,
            subject: 'Mock Event',
            description: 'Mock description',
            date: new Date(),
          };
        
        authService.getAppEvents.mockResolvedValue([mockEventDetails.id]);
        authService.postEvents.mockResolvedValueOnce();
        await act(async () => fireEvent.click(createEventBtn));
        

        expect(authService.getOrCreateCalendar).toHaveBeenCalled();
        expect(authService.getAppEvents).toHaveBeenCalled();
        expect(authService.deleteEvents).toHaveBeenCalledWith(useAppContext.providerAuth, `/me/calendars/${mockCalendar.id}`, [mockEventDetails.id]);
        expect(authService.postEvents).toHaveBeenCalled();

        const successMessage = await screen.findByText('Process Complete!');
        expect(successMessage).toBeInTheDocument();
    });

    it('should display error message if event creation fails', async () => {
        useIsAuthenticated.mockReturnValue(true);
        mockResponse.case.client = "Client";
        const mockCalendar = { id: 'mock-calendar-id', isNew: false, isOwner: false}
        authService.getOrCreateCalendar.mockResolvedValue(mockCalendar);

        await act(async () => {
            render(<Main />);
        });

        // Mock Add to Outlook Btn click
        const splitBtnArrow = screen.getByLabelText("select create event option");
        fireEvent.click(splitBtnArrow);

        const createEventOption = await screen.findByText("Add to Outlook");
        await act(async () => fireEvent.click(createEventOption));

        const createEventBtn = await screen.findByRole('button', { name: 'Add to Outlook' });
        const mockEventDetails = {
            id: 1,
            subject: 'Mock Event',
            description: 'Mock description',
            date: new Date(),
          };
        
        authService.getAppEvents.mockResolvedValue([mockEventDetails.id]);
         // Mock failed event creation
         authService.postEvents.mockRejectedValue(new Error('Test'));
        await act(async () => fireEvent.click(createEventBtn));
        
        expect(mockAppContext.displayError).toHaveBeenCalledWith("Error creating event", "Test");
    });    

    /* it('should redirect to the home page after successful event creation', async () => {
        render(<Main />);
        // Mock successful event creation
    
        // Simulate a delay for the redirection
        await new Promise((resolve) => setTimeout(resolve, 3000));
    
        // Assert the redirection
        // You might need to use tools like react-router-dom's MemoryRouter for this test
    }); */
    
  });