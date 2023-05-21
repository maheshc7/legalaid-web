import axios from 'axios';

const BASE_URL = 'https://virtserver.swaggerhub.com/maheshc7/legalAid/1.0.0';

// Function to upload a file
export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201) {
      return response.data.taskID;
    } else {
      throw new Error('Failed to upload file');
    }
  } catch (error) {
    // Handle error
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Function to get list of events for given task id
export async function getEvents(id) {
  try {
    const response = await axios.get(`${BASE_URL}/events/${id}`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to get events');
    }
  } catch (error) {
    // Handle error
    console.error('Error getting events:', error);
    throw error;
  }
}

// Function to get case details for given task id
export async function getCaseDetails(id) {
    try {
      const response = await axios.get(`${BASE_URL}/case/${id}`);
  
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to get case details');
      }
    } catch (error) {
      // Handle error
      console.error('Error getting case details:', error);
      throw error;
    }
  }