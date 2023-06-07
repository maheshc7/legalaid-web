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

// <CalendarSnippet>
export async function getCalendars(authProvider, calendarName){
  ensureClient(authProvider);

  // Get the calendar if it exists
  var calendar = await graphClient.api('/me/calendars')
    .filter(`name eq '${calendarName}'`)
    .select('id')
    .get();
  console.log(calendar, calendar.value, calendar.value.length)
  console.log(!calendar,calendar === undefined, !calendar.value.length);
  if(!calendar || calendar === undefined || !calendar.value.length){
    // If calendar doesn't exist, create a new calendar 
    console.log(calendar);
    calendar = await graphClient.api('/me/calendars')
      .post({
        name: calendarName
      });

    console.log(calendar);

    return calendar.id;
  }

  return calendar.value[0].id;
}

export async function shareCalendar(calendarId, calendarPermission){
  var id = 0;
  const batchRequest = {
    requests: calendarPermission.map((permission) => ({
      method: 'POST',
      url: `/me/calendars/${calendarId}/calendarPermissions`,
      body: permission,
      id: id++,
      headers: {
        "Content-Type": "application/json"
      }
    })),
  };

  const batchRequestString = JSON.stringify(batchRequest);

  await graphClient.api('/$batch').post(batchRequestString);
  // const response = await graphClient.api(`/me/calendars/${calendarId}/calendarPermissions`)
	//   .post(calendarPermission);

}

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
export async function postEvent(authProvider, requests){
  ensureClient(authProvider);

  const batchSize = 20;
  const totalRequests = requests.length;
  const totalBatches = Math.ceil(totalRequests / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalRequests);
    const batchRequests = {requests: requests.slice(startIndex, endIndex)};
    
    console.log(batchRequests);

    await graphClient.api('/$batch').post(batchRequests);
  }
  
}
// </CreateEventSnippet>
