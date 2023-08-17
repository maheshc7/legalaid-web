import { Client } from "@microsoft/microsoft-graph-client";

let graphClient = undefined;
let batchSize = 20;

function ensureClient(authProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });
  }

  return graphClient;
}

// <GetUserSnippet>
export async function getUser(authProvider) {
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  const user = await graphClient
    .api("/me")
    // Only retrieve the specific fields needed
    .select("displayName,userPrincipalName")
    .get();
  const timeZone = await getUserTimeZone(authProvider);
  user.timeZone = timeZone;
  return user;
}

export async function getUserTimeZone(authProvider) {
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  const timeZone = await graphClient.api("/me/mailboxSettings/timeZone").get();
  return timeZone.value;
}
// </GetUserSnippet>

// <CalendarSnippet>
export async function getCalendar(authProvider, calendarName) {
  ensureClient(authProvider);
  // Get the calendar if it exists
  var calendar = await graphClient
    .api("/me/calendars")
    .filter(`name eq '${calendarName}'`)
    .select("id")
    .get();

  if (!calendar || calendar === undefined || !calendar.value.length) {
    // If calendar doesn't exist, create a new calendar
    calendar = await graphClient.api("/me/calendars").post({
      name: calendarName,
    });

    return {id: calendar.id, isNew: true};
  }

  return {id: calendar.value[0].id, isNew: false};
}

export async function shareCalendar(calendarId, calendarPermission) {
  var id = 0;
  const batchRequest = {
    requests: calendarPermission.map((permission) => ({
      method: "POST",
      url: `/me/calendars/${calendarId}/calendarPermissions`,
      body: permission,
      id: id++,
      headers: {
        "Content-Type": "application/json",
      },
    })),
  };

  const batchRequestString = JSON.stringify(batchRequest);

  await graphClient.api("/$batch").post(batchRequestString);
  // const response = await graphClient.api(`/me/calendars/${calendarId}/calendarPermissions`)
  //   .post(calendarPermission);
}

// <GetContactsSnippet>
export async function getContacts(authProvider) {
  ensureClient(authProvider);

  // GET /me/people
  // JSON representation of the new event is sent in the
  // request body
  var response = await graphClient.api("/me/people").get();
  //TO DO: Add iterator.

  const contactList = response.value.map(
    ({ displayName, scoredEmailAddresses: [{ address }] }) => ({
      name: displayName,
      address: address,
    })
  );

  return contactList;
}

export async function getFilteredContacts(authProvider, query) {
  // Make an API call to fetch filtered contacts based on the query
  ensureClient(authProvider);

  // GET /me/people
  // JSON representation of the new event is sent in the
  // request body
  var response = await graphClient
    .api("/me/people")
    .select("displayName,scoredEmailAddresses")
    .search(query)
    .get();

  const filteredContacts = response.value.map(
    ({ displayName, scoredEmailAddresses: [{ address }] }) => ({
      name: displayName,
      address: address,
    })
  );

  return filteredContacts;
}
// </GetContactsSnippet>

// <CreateEventSnippet>
export async function postEventsBatch(authProvider, requests) {
  ensureClient(authProvider);
  const totalRequests = requests.length;
  const totalBatches = Math.ceil(totalRequests / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalRequests);
    const batchRequests = { requests: requests.slice(startIndex, endIndex) };

    const response = await graphClient.api("/$batch").post(batchRequests);

    const hasErrors = response.responses.some(batchResponse => batchResponse.status >= 400);
    if (hasErrors) {
      const errorResponses = response.responses.filter(batchResponse => batchResponse.status >= 400);
      const errorMessages = errorResponses.map(errorResponse => errorResponse.body);
      console.error(`Batch request failed with errors: ${errorMessages.join(", ")}`);
    }
  }
}
// </CreateEventSnippet>

// <GetEventSnippet>
export async function getAppEvents(authProvider, calendarId, singleValueExtendedProperty) {
  ensureClient(authProvider);

  let allEvents = [];
  let nextPageLink = null;
  let query = graphClient
      .api(`/me/calendars/${calendarId}/events`)
      .select("id, subject, bodyPreview")
      .filter(`singleValueExtendedProperties/any(ep:ep/id eq '${singleValueExtendedProperty.id}' AND contains(ep/value, '${singleValueExtendedProperty.value}'))`)
      .top(50);
  
  do {
    if (nextPageLink) {
      query = graphClient.api(nextPageLink);
    }
    const response = await query.get();
    allEvents = allEvents.concat(response.value);
    nextPageLink = response['@odata.nextLink']?.split("https://graph.microsoft.com/v1.0")[1];
  } while (nextPageLink);
  const filteredEventIds = allEvents
    // .filter(event => event.bodyPreview.includes(searchQuery))
    .map(event => event.id);
  
  return filteredEventIds;

}
// </GetEventSnippet>

// <DeleteEventSnippet>
export async function deleteEventsBatch(authProvider, calendarId, eventIds) {
  ensureClient(authProvider);
  const totalEvents = eventIds.length;
  const totalBatches = Math.ceil(totalEvents / batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalEvents);
    const batchEventIds = eventIds.slice(startIndex, endIndex);

    const batchRequests = batchEventIds.map(eventId => {
      return {
        id: eventId,
        method: "DELETE",
        url: `/me/calendars/${calendarId}/events/${eventId}`
      };
    });
    try {
      const response = await graphClient.api("/$batch").post({ requests: batchRequests });
      const responses = response.responses;

      responses.forEach((batchResponse, index) => {
        if (batchResponse.status === 204) {
          console.log(`Event with ID ${batchRequests[index].id} deleted successfully.`);
        } else {
          console.error(`Error deleting event with ID ${batchRequests[index].id}: ${batchResponse.body.error.message}`);
          console.error(batchResponse);
        }
      });
    } catch (error) {
      console.error(`Batch request failed: ${error.message}`);
    }
  }

}
// </DeleteEventSnippet>
