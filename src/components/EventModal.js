import { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";
import ValidationPopUp from "./ValidationPopUp";

const labelsClasses = ["indigo", "gray", "green", "blue", "red", "purple"];

export default function EventModal(props) {
  const {
    setShowEventModal,
    daySelected,
    selectedEvent,
    patientData,
    showValidationPopUp,
    setShowValidationPopUp,
    currEventId,
    setCurrEventId,
  } = useContext(GlobalContext);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        "http://127.0.0.1:7101/PROMISCalendarApp-RESTWebService-context-root/rest/1/CalendarEvents?orderBy=EventId:desc&limit=1"
      );
      const data = await response.json();
      setCurrEventId(data.items[0].EventId + 1);
    };
    fetchData().catch(console.error);
  }, []);

  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.EventTitle : ""
  );
  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.EventDescription : ""
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent
      ? labelsClasses.find((lbl) => lbl === selectedEvent.EventLabel)
      : labelsClasses[0]
  );

  const [errorMessage, setErrorMessage] = useState([]);

  useEffect(() => {
    if (!showValidationPopUp) {
      setErrorMessage([]);
    }
  }, [showValidationPopUp]);

  const [location, setLocation] = useState(
    selectedEvent ? selectedEvent.Location : ""
  );

  function convertIsAllDayEvent() {
    if (selectedEvent["IsAllDayEvent"] == "T") {
      return true;
    } else {
      return false;
    }
  }

  const [isAllDayEvent, setIsAllDayEvent] = useState(
    selectedEvent ? convertIsAllDayEvent() : false
  );

  function convertTime(dateTime) {
    //e.g 2:00 PM convert to 14:00 so will work with input time type
    return dayjs(selectedEvent[dateTime]).format("HH:mm");
  }

  function convertTimeBack(time) {
    let dateAndTime = daySelected.format("MM/DD/YYYY") + " " + time;
    return dayjs(dateAndTime).format("YYYY-MM-DDTHH:mm:ssZ");
  }

  const [startTime, setStartTime] = useState(
    selectedEvent ? convertTime("StartDateTime") : ""
  );
  const [endTime, setEndTime] = useState(
    selectedEvent ? convertTime("EndDateTime") : ""
  );

  const [selectedPatient, setSelectedPatient] = useState(
    findPatientViaEvent() != null ? findPatientViaEvent() : null
  );

  function findPatientViaEvent() {
    if (selectedEvent == null) {
      return null;
    }
    const selectedPatient = patientData.find(
      (patient) => patient.Id == selectedEvent.PatientId
    );
    return selectedPatient;
  }

  function checkValidations() {
    //Mandatory fields are isAllDayEvent (if start and end times are 1200am and isAllDayEvent isnt checked then error)
    // patientId, eventTitle
    let validated = true;
    const genericErrorMessage = " field is required. Please enter a value";

    if (!selectedPatient || selectedPatient == "default") {
      setErrorMessage((oldArray) => [
        ...oldArray,
        "Patient" + genericErrorMessage,
      ]);
      validated = false;
    }

    if (!isAllDayEvent && startTime == "" && endTime == "") {
      setErrorMessage((oldArray) => [
        ...oldArray,
        "All day event" +
          genericErrorMessage +
          " or select a start and end time",
      ]);
      validated = false;
    }

    if (!title) {
      setErrorMessage((oldArray) => [
        ...oldArray,
        "Event title" + genericErrorMessage,
      ]);
      validated = false;
    }
    return validated;
  }

  async function handleSubmit(e) {
    //default is that page will reload
    e.preventDefault();

    let validated = checkValidations();

    if (validated) {
      setShowEventModal(false);
      let eventObjectSubmitted = await {
        EventId: currEventId,
        StartDateTime: convertTimeBack(startTime),
        EndDateTime: convertTimeBack(endTime),
        IsAllDayEvent: isAllDayEvent ? "T" : "F",
        Location: location,
        PatientId: selectedPatient,
        EventLabel: selectedLabel,
        EventTitle: title,
        EventDescription: description,
      };
  
      console.log(
        "This is event to be submitted: " + JSON.stringify(eventObjectSubmitted)
      );
  
      try {
        let response = await fetch(
          "http://127.0.0.1:7101/PROMISCalendarApp-RESTWebService-context-root/rest/1/CalendarEvents",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/vnd.oracle.adf.resourceitem+json",
            },
            body: JSON.stringify(eventObjectSubmitted),
          }
        ).then(() => window.location.reload(false));
      } catch (error) {
        console.error(error);
      }  
    } else {
      setShowValidationPopUp(true);
    }

    
    // If everything is submitted properly, add 1 to eventId count
  }

  async function handleDelete() {
    let selectedEventNum = selectedEvent.EventId;
    let fetchUrl =
      "http://127.0.0.1:7101/PROMISCalendarApp-RESTWebService-context-root/rest/1/CalendarEvents/" +
      selectedEventNum;
    try {
      let response = await fetch(fetchUrl, {
        method: "DELETE",
      }).then(() => window.location.reload(false));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-2xl w-1/4"
      >
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <span className="material-icons-outlined text-gray-400">
            drag_handle
          </span>
          <div>
            {selectedEvent && (
              <span
                onClick={() => {
                  handleDelete();
                  setShowEventModal(false);
                }}
                className="material-icons-outlined text-gray-400 cursor-pointer"
              >
                delete
              </span>
            )}
            <button type="button" onClick={() => setShowEventModal(false)}>
              <span className="material-icons-outlined text-gray-400">
                close
              </span>
            </button>
          </div>
        </header>
        <div className="grid gap-y-7">
          <div className="grid grid-cols-7 place-items-center">
            <input
              type="text"
              name="title"
              placeholder="Add title"
              value={title}
              className=" text-center border-0 text-gray-600 text-xl font-semibold border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 col-span-7"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-7 place-items-center pt-4">
            <span className="material-icons-outlined text-gray-400 col-span-1">
              face
            </span>
            <select
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="border-0 tracking-wide text-l text-gray-500 font-bold text-right col-start-3 col-span-5 mr-4"
            >
              <option value="default">{}</option>
              {patientData.map((patient, i) => (
                <option
                  key={i}
                  value={patient.Id}
                  selected={`${
                    findPatientViaEvent() != null &&
                    findPatientViaEvent().Id == patient.Id
                      ? "selected"
                      : ""
                  }`}
                >
                  {patient.FirstName +
                    " " +
                    patient.LastName +
                    " (" +
                    patient.Id +
                    ")"}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-7 place-items-center">
            <span className="material-icons-outlined text-gray-400 col-span-1">
              push_pin
            </span>
            <input
              type="text"
              name="location"
              placeholder="Add a location"
              value={location}
              className="border-0 text-gray-600 focus:outline-none focus:ring-0 focus:border-blue-500 col-start-3 col-span-5"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-7 place-items-center">
            <span className="material-icons-outlined text-gray-400 col-span-1">
              schedule
            </span>
            <p className="col-start-2 col-span-6">
              {daySelected.format("dddd, MMMM DD")}
            </p>
          </div>
          <div>
            <div>
              <div className="grid grid-cols-7 place-items-center">
                <input
                  type="checkbox"
                  name="allDayEvent"
                  defaultChecked={isAllDayEvent}
                  className="col-start-3 col-span-2"
                  onClick={() => setIsAllDayEvent(!isAllDayEvent)}
                />
                <p className="col-start-5 col-span-3 mr-2">All day event</p>
              </div>
              <div className={`${!isAllDayEvent ? "visible" : "invisible"}`}>
                <div>
                  <div className="grid grid-cols-7 place-items-center">
                    <p className="col-start-3 col-span-2 text-center">Start</p>
                    <input
                      type="time"
                      name="startTime"
                      value={startTime}
                      className="border-0 text-gray-600 focus:outline-none focus:ring-0 focus:border-blue-500 col-start-6 col-span-1"
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-7 place-items-center">
                    <p className="col-start-3 col-span-2 text-center">End</p>
                    <input
                      type="time"
                      name="endTime"
                      value={endTime}
                      className="border-0 text-gray-600 focus:outline-none focus:ring-0 focus:border-blue-500 col-start-6 col-span-1"
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 place-items-center">
            <span className="material-icons-outlined text-gray-400">
              segment
            </span>
            <input
              type="text"
              name="description"
              placeholder="Add a description"
              value={description}
              className="border-0 text-gray-600 focus:outline-none focus:ring-0 focus:border-blue-500 col-start-3 col-span-5"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-7 place-items-center">
            <span className="material-icons-outlined text-gray-400 col-span-1">
              bookmark_border
            </span>
            <div className="flex gap-x-4 col-start-2 col-span-6">
              {labelsClasses.map((lblclass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblclass)}
                  className={`bg-${lblclass}-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {selectedLabel === lblclass && (
                    <span className="material-icons-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t p-3 mt-5">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
      {showValidationPopUp && <ValidationPopUp errorMessage={errorMessage} />}
    </div>
  );
}
