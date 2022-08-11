import { useEffect, useReducer, useState, useMemo } from "react";
import GlobalContext from "./GlobalContext";
import dayjs from "dayjs";

function savedEventsReducer(state, { type, payload }) {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((e) => (e.id === payload.id ? payload : e));
    case "delete":
      return state.filter((e) => e.id !== payload.id);
    default:
      throw new Error();
  }
}

//Might need to make changes here to use webservice

function initEvents() {
  /*
  const storageEvents = localStorage.getItem("savedEvents");
  const parsedEvents = storageEvents ? JSON.parse(storageEvents) : [];
  return parsedEvents;
  */
}

export default function ContextWrapper(props) {
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [labels, setLabels] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showValidationPopUp, setShowValidationPopUp] = useState(false);
  const [currEventId, setCurrEventId] = useState(12);

  const [savedEvents, dispatchCalEvent] = useReducer(
    savedEventsReducer,
    [],
    initEvents
  );

  const [submittedEvent, setSubmittedEvent] = useState({});

  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((evt) =>
      labels
        .filter((lbl) => lbl.checked)
        .map((lbl) => lbl.label)
        .includes(evt.EventLabel)
    );
  }, [calendarEvents, labels]);
  
  useEffect(() => {
    setLabels((prevLabels) => {
      return [...new Set(calendarEvents.map((evt) => evt.EventLabel))].map(
        (label) => {
          const currentLabel = prevLabels.find((lbl) => lbl.label === label);
          return {
            label,
            checked: currentLabel ? currentLabel.checked : true,
          };
        }
      );
    });
  }, [calendarEvents]);

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  function updateLabel(label) {
    setLabels(labels.map((lbl) => (lbl.label === label.label ? label : lbl)));
  }

  return (
    <GlobalContext.Provider
      value={{
        monthIndex,
        setMonthIndex,
        smallCalendarMonth,
        setSmallCalendarMonth,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        dispatchCalEvent,
        selectedEvent,
        setSelectedEvent,
        savedEvents,
        labels,
        setLabels,
        updateLabel,
        filteredEvents,
        calendarEvents,
        setCalendarEvents,
        patientData, 
        setPatientData,
        selectedPatient,
        setSelectedPatient,
        submittedEvent,
        setSubmittedEvent,
        showValidationPopUp,
        setShowValidationPopUp,
        currEventId,
        setCurrEventId,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
