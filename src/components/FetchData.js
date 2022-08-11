import { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext";

export default function FetchPatient() {
  const {
    setPatientData,
    calendarEvents,
    setCalendarEvents,
    currEventId,
    setCurrEventId,
  } = useContext(GlobalContext);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://127.0.0.1:7101/PROMISCalendarApp-RESTWebService-context-root/rest/1/Users"
      );
      const data = await response.json();
      setPatientData(data.items);
    };
    fetchData().catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://127.0.0.1:7101/PROMISCalendarApp-RESTWebService-context-root/rest/1/CalendarEvents"
      );
      const data = await response.json();
      setCalendarEvents(data.items);
    };
    fetchData().catch(console.error);
  }, []);
}
