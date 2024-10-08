import axios from "axios";
import config from "../Config";

const BASE_URL = config.backend_url;

// Function to upload a file
export async function uploadFileGetEvents(filename, doEnhance = false) {
  try {
    const response = await axios.get(
      `${BASE_URL}/order-details?filename=${filename}`,
      { headers: { "Is-Authorized": String(doEnhance) } }
    );

    if (response.status === 200) {
      return [response.data.case, response.data.events];
    } else {
      throw new Error("Failed to upload file" + response.data);
    }
  } catch (error) {
    // Handle error
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Function to upload a file
export async function uploadFile(file) {
  try {
    const response = await axios.put(`${BASE_URL}/order/${file.name}`, file, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (response.status === 200) {
      return file.name;
    } else {
      throw new Error("Failed to upload file");
    }
  } catch (error) {
    // Handle error
    console.error("Error uploading file:", error);
    throw error;
  }
}

export const generateICSContent = (app, events, caseDetail) => {
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${caseDetail.caseNum}`;

  //If user has logged in, then we can add the timezone
  if (app.user && app.user.timeZone) {
    icsContent += `
X-WR-TIMEZONE:${app.user.timezone}`;
  }

  events.forEach((eventDetails) => {
    const dateOnly = eventDetails.date.format("YYYY-MM-DD") + " 00:00:00";
    var startDate = new Date(dateOnly);
    var endDate = new Date(dateOnly);
    endDate.setDate(endDate.getDate() + 1);
    const newDescription =
      eventDetails.description +
      `\n\n ${caseDetail.plaintiff} \nvs\n ${caseDetail.defendant}` +
      "\n\n\n\n {Event created by: LegalAid}";

    icsContent += `
BEGIN:VEVENT
UID:${eventDetails.id}
DTSTART:${startDate.toISOString().substring(0, 10).replaceAll("-", "")}
DTEND:${endDate.toISOString().substring(0, 10).replaceAll("-", "")}
SUMMARY:${caseDetail.client + ": " + eventDetails.subject}
DESCRIPTION:${newDescription}
END:VEVENT`;
  });

  icsContent += "\nEND:VCALENDAR";
  return icsContent;
};

export const downloadICSFile = (icsContent, fileName) => {
  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
/*
// Function to get list of events for given task id
export async function getEvents(id) {
  try {
    const response = await axios.get(`${BASE_URL}/events/${id}`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to get events'+ error);
    }
  } catch (error) {
    // Handle error
    console.error('Error getting events:'+ error);
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
  */
