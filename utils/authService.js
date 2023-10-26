import { Client } from "@microsoft/microsoft-graph-client";

let graphClient = undefined;
let batchSize = 20;
let singleValueExtendedProperty = {
  id: "String {66f5a359-4659-4830-9070-00050ec6ac6e} Name Source",
  value: "LegalAid",
};

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
  const workAccountPattern = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

  // Return the /me API endpoint result as a User object
  const user = await graphClient
    .api("/me")
    // Only retrieve the specific fields needed
    .select("id,displayName,userPrincipalName,mailboxSettings")
    .get();
  // const timeZone = await getUserTimeZone(authProvider);
  user.isOrg = workAccountPattern.test(user.id)
  user.timeZone = user.mailboxSettings.timeZone;
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
export async function getOrCreateCalendar(authProvider, calendarName, userEmail) {
  ensureClient(authProvider);
  // Get the calendar if it exists
  var calendar = await graphClient
    .api("/me/calendars")
    .filter(`name eq '${calendarName}'`)
    // .select("id, owner")
    .get();

  console.log("Cal:", calendar)
  if (!calendar || calendar === undefined || !calendar.value.length) {
    // If calendar doesn't exist, create a new calendar
    calendar = await graphClient.api("/me/calendars").post({
      name: calendarName,
    });

    return { id: calendar.id, isNew: true, isOwner: true };
  }

  return { id: calendar.value[0].id, isNew: false, isOwner: calendar.value[0].owner.address == userEmail };
}

export async function updateCalendar(calendarId, calendarPermission) {
  var id = 0;
  const requests = calendarPermission.map((permission) => {
      return{
        method: "POST",
        url: `/me/calendars/${calendarId}/calendarPermissions`,
        body: permission,
        id: id++,
        headers: {
          "Content-Type": "application/json",
        }
      }
    });

  const response = batchRequests(requests);
}
// </CalendarSnippet>

// <GroupSnippet>
export async function postGroup(authProvider, groupName, contactList){

  const apiUrl = 'https://graph.microsoft.com/v1.0/users/';
  var memberList = contactList.map(contact => `${apiUrl}${contact.id}`);
  
  var ownerId = await getFilteredContacts(authProvider, "legalaidbot");
  //If we have the legalaid_bot account then use that else make the user as owner. User would be the last contact added in the contactList => memberList
  ownerId = ownerId.length > 0? apiUrl+ownerId[0].id : memberList.pop();

  const groupBody = {
    description: `LegalAid Group for Case: ${groupName}`,
    displayName: groupName,
    groupTypes: [
      'Unified'
    ],
    mailEnabled: true,
    mailNickname: `${groupName}`,
    securityEnabled: false,
    visibility: "Public",
    'owners@odata.bind': [ownerId],
    'members@odata.bind': memberList
  };
  
  const group = await graphClient.api('/groups')
    .post(groupBody);

  return group.id;
}

export async function getGroup(authProvider, groupName) {
  ensureClient(authProvider);

  // Check if group if it exists
  var group = await graphClient
    .api("/groups")
    .filter(`displayName eq '${groupName}'`)
    .select("id")
    .get();

  var groupId = group.value;

  if (groupId.length) {
    groupId = groupId[0].id;
    return groupId;
  }

  //group doesn't exist.
  return null;
}

export async function getGroupMembers(authProvider, groupId){
  ensureClient(authProvider);

  const response = await graphClient
  .api(`/groups/${groupId}/members`) //microsoft.graph.user
  // .header('ConsistencyLevel','eventual')
  .select("id,displayName,mail")
  .get();

  const existingMembers = response.value.map(
    ({ id, displayName, mail}) => ({
      id: id,
      name: displayName,
      address: mail,
    })
  );

  console.log("Existing Members: ", existingMembers);
  return existingMembers;

}

export async function addGroupMembers(authProvider, groupId, contactList){
  ensureClient(authProvider);

  const existingMembers = await getGroupMembers(authProvider, groupId);
  
  const newMembers = contactList.filter(contact =>
    !existingMembers.some(existingMember =>
      existingMember.id === contact.id && existingMember.address === contact.address
    )
  );
  console.log("New Members: ", newMembers);

  
  if(newMembers.length){
    //Update member list
    const apiUrl = 'https://graph.microsoft.com/v1.0/users/';
    const memberList = newMembers.map(contact => `${apiUrl}${contact.id}`);
    const groupUpdate = {
      'members@odata.bind': memberList
    }

    graphClient.api(`/groups/${groupId}`)
      .update(groupUpdate);
  }
}

// </GroupSnippet>

// <GetContactsSnippet>
export async function getContacts(authProvider) {
  ensureClient(authProvider);

  var response = await graphClient.api("/me/people").get();
  //TODO: Add iterator.

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

  var response = await graphClient
    .api("/me/people")
    .select("id,displayName,scoredEmailAddresses")
    .search(query)
    .get();

  const filteredContacts = response.value.map(
    ({ id, displayName, scoredEmailAddresses: [{ address }] }) => ({
      id: id,
      name: displayName,
      address: address,
    })
  );

  return filteredContacts;
}
// </GetContactsSnippet>

// <CRUDEventsSnippet>
export async function postEvents(
  authProvider,
  timeZone,
  eventDetails,
  selectedContacts,
  url,
  caseDetail
) {
  ensureClient(authProvider);
  try{
    singleValueExtendedProperty.value = caseDetail.caseNum;

    const attendees = selectedContacts.map((contact) => ({
      emailAddress: {
        address: contact.address,
        name: contact.name,
      },
      type: "required",
    }));

    var requests = eventDetails.map((newEvent) => {
      const startDate = newEvent.date.format("YYYY-MM-DD") + " 00:00:00";
      var endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const newDescription =
        newEvent.description + `\n\n ${caseDetail.plaintiff} \nvs\n ${caseDetail.defendant}` + "\n\n\n\n {Event created by: LegalAid}";
      const eventPayload = {
        subject: caseDetail.client + ": " + newEvent.subject,
        body: {
          contentType: "Text",
          content: newDescription,
        },
        start: {
          dateTime: startDate,
          timeZone: timeZone,
        },
        end: {
          dateTime: endDate.toISOString().split("T")[0] + " 00:00:00",
          timeZone: timeZone,
        },
        isAllDay: true,
        showAs: "free",
        responseRequested: false,
        //unique identifier for events created by the LegalAid app.
        singleValueExtendedProperties: [singleValueExtendedProperty],
        attendees: attendees,
        // add other event details
      };

      return {
        // Unique identifier for the request
        id: newEvent.id,
        method: "POST",
        url: `${url}/events`,
        body: eventPayload,
        headers: {
          "Content-Type": "application/json",
          // "Prefer": `IdType="ImmutableId"`,
        },
        transactionId: caseDetail.caseNum,
      };
    });

    const response = await batchRequests(requests);
    console.log(response)
    return response;
  }catch(err){
    console.error("Error creating events in Outlook Calendar ",err)
  }
}

export async function updateEvents(authProvider, calendarId, eventIds) {
  ensureClient(authProvider);

  //Usage 
  // eventsResponse = eventsResponse.responses.filter(event => event.status == 201);
  // const eventIds = eventsResponse.map(event => event.body.id)
  // updateEvents(app.authProvider, calendarId, eventIds)
  var requests = eventIds.map((eventId) => {
    const eventPayload = {
      isReminderOn: false,
    };
    return {
      id: eventId,
      method: "PATCH",
      url: `/me/calendars/${calendarId}/events/${eventId}`,
      body: eventPayload,
      headers: {
        "Content-Type": "application/json",
      },
    };
  });

  const response = batchRequests(requests);
}

export async function getAppEvents(
  authProvider,
  url,
  appUniqueId
) {
  ensureClient(authProvider);

  singleValueExtendedProperty.value = appUniqueId;

  let allEvents = [];
  let nextPageLink = null;
  let query = graphClient
    .api(`${url}/events`)
    .select("id, subject, bodyPreview")
    // .filter(
    //   `singleValueExtendedProperties/any(ep:ep/id eq '${singleValueExtendedProperty.id}' AND contains(ep/value, '${singleValueExtendedProperty.value}'))`
    // )
    .top(50);

  do {
    if (nextPageLink) {
      query = graphClient.api(nextPageLink);
    }
    const response = await query.get();
    allEvents = allEvents.concat(response.value);
    nextPageLink = response["@odata.nextLink"]?.split(
      "https://graph.microsoft.com/v1.0"
    )[1];
  } while (nextPageLink);
  const filteredEventIds = allEvents
    // .filter(event => event.bodyPreview.includes(searchQuery))
    .map((event) => event.id);

  return filteredEventIds;
}

export async function deleteEvents(authProvider, url, eventIds) {
  ensureClient(authProvider);

  const requests = eventIds.map((eventId) => {
    return {
      id: eventId,
      method: "DELETE",
      url: `${url}/events/${eventId}`,
    };
  });

  const response = await batchRequests(requests);
  if(response && response.responses){
      response.responses.forEach((batchResponse, index) => {
      if (batchResponse.status === 204) {
        console.log(
          `Event with ID ${requests[index].id} deleted successfully.`
        );
      } else {
        console.error(
          `Error deleting event with ID ${requests[index].id}: ${batchResponse.body.error.message}`
        );
      }
    });
  }
}
// </CRUDEventsSnippet>

// <BatchRequestSnippet>
export async function batchRequests(requests) {
  const totalRequests = requests.length;
  const totalBatches = Math.ceil(totalRequests / batchSize);

  try{
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * batchSize;
      const endIndex = Math.min(startIndex + batchSize, totalRequests);
      const batchRequests = { requests: requests.slice(startIndex, endIndex) };

      const response = await graphClient.api("/$batch").post(batchRequests);
      const hasErrors = response.responses.some(
        (batchResponse) => batchResponse.status >= 400
      );
      if (hasErrors) {
        const errorResponses = response.responses.filter(
          (batchResponse) => batchResponse.status >= 400
        );
        const errorMessages = errorResponses.map(
          (errorResponse) => errorResponse.body.error.message
        );
        console.error(
          `Batch request failed with errors: ${errorMessages.join(", ")}`
        );
      }
      return response;
    }
  }catch(err){
    console.log("Error creating batch requests ",err);
    return null;
  }
}
// </BatchRequestSnippet>
