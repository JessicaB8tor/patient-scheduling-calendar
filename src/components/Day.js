import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext";

export default function Day({ day, rowIdx }) {
  const [dayEvents, setDayEvents] = useState([]);

  const {
    setDaySelected,
    setShowEventModal,
    filteredEvents,
    setSelectedEvent,
    setSelectedPatient,
    patientData
  } = useContext(GlobalContext);

  useEffect(() => {
    const events = filteredEvents.filter(
      (e) =>
        dayjs(e["StartDateTime"]).format("DD-MM-YY") === day.format("DD-MM-YY")
    );
    setDayEvents(events);
  }, [filteredEvents, day]);

  function getCurrentDayClass() {
    return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
      ? "bg-blue-600 text-white rounded-full w-7"
      : "";
  }

  return (
    <div className="border border-gray-200 flex flex-col">
      <header className="flex flex-col items-center">
        {rowIdx === 0 && (
          <p className="text-sm mt-1">{day.format("ddd").toUpperCase()}</p>
        )}
        <p className={`text-sm p-1 my-1 text-center ${getCurrentDayClass()}`}>
          {day.format("D")}
        </p>
      </header>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setDaySelected(day);
          setShowEventModal(true);
        }}
      >
        {dayEvents.map((evt, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedEvent(evt);
              setSelectedPatient(
                patientData.find((patient) => patient.id == evt.PatientId)
              );
            }}
            className={`bg-${evt.EventLabel}-200 p-1 mr-3 text-gray-600 text-sm rounded mb-1 truncate`}
          >
            {evt.EventTitle}
          </div>
        ))}
      </div>
    </div>
  );
}
