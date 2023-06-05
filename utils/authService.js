import { Client} from '@microsoft/microsoft-graph-client';

let graphClient = undefined;

function ensureClient(authProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  }

  return graphClient;
}

// <GetUserSnippet>
export async function getUser(authProvider){
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  const user = await graphClient.api('/me')
    // Only retrieve the specific fields needed
    .select('displayName,userPrincipalName')
    .get();

  return user;
}

export async function getUserTimeZone(authProvider){
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  const timeZone = await graphClient.api('/me/mailboxSettings/timeZone')
    .get();
  console.log(timeZone);
  return timeZone.value;
}
// </GetUserSnippet>

// <GetContactsSnippet>
export async function getContacts(authProvider){
  ensureClient(authProvider);

  // GET /me/people
  // JSON representation of the new event is sent in the
  // request body
  var response = await graphClient
    .api('/me/people')
    .get();
  //TO DO: Add iterator.
  
  const contactList = response.value.map(({displayName, scoredEmailAddresses: [{address}]}) => ({name: displayName, address: address}))
  
  return contactList;
}

export async function getFilteredContacts(authProvider, query) {
  // Make an API call to fetch filtered contacts based on the query
  ensureClient(authProvider);

  // GET /me/people
  // JSON representation of the new event is sent in the
  // request body
  var response = await graphClient
    .api('/me/people')
    .select('displayName,scoredEmailAddresses')
    .search(query)
    .get();
  
  const filteredContacts = response.value.map(({displayName, scoredEmailAddresses: [{address}]}) => ({name: displayName, address: address}))

  return filteredContacts;
};
// </GetContactsSnippet>

// <CreateEventSnippet>
export async function postEvent(authProvider, user, eventDetails, attendees){
  ensureClient(authProvider);

  // POST /me/events
  // JSON representation of the new event is sent in the
  // request body
  var endDate = new Date(eventDetails.date)
  endDate.setDate(endDate.getDate()+1)
  console.log(endDate, user.timeZone.value)
  const eventPayload = {
    subject: eventDetails.subject,
    body: {
      contentType: 'HTML',
      content: eventDetails.description,
    },
    start: {
      dateTime: eventDetails.date,
      timeZone:user.timeZone.value,
    },
    end: {
      dateTime: endDate,
      timeZone:user.timeZone.value,
    },
    attendees: attendees,
    // other event details
  };
  return await graphClient
    .api('/me/events')
    .post(eventPayload);
}
// </CreateEventSnippet>
