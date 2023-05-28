import axios from 'axios';
import { getAccessToken } from './authService';

const MSGRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';

export async function getContacts (){
    try {
      const accessToken = await getAccessToken();

      const response = await axios.get(`${MSGRAPH_BASE_URL}/me/people?$top=1000&$Select=displayName,scoredEmailAddresses`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const contactList = response.data.value.map(({displayName, scoredEmailAddresses: [{address}]}) => ({name: displayName, email: address}))
      console.log(contactList);
      return contactList;
      
    } catch (error) {
      console.error("Error retrieving contacts:", error);
    }
  };

  export async function  createEvent() {
    try {
      const accessToken = await getAccessToken();
      const eventDetails = events[0];
      const eventPayload = {
        subject: eventDetails.subject,
        body: {
          contentType: 'HTML',
          content: eventDetails.description,
        },
        start: {
          dateTime: eventDetails.date,
          timeZone: "Pacific Standard Time",
        },
        // other event details
      };

      await axios.post(`${MSGRAPH_BASE_URL}/me/events`, eventPayload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Event created successfully");
      //capture response and return it
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };