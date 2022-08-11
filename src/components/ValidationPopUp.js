import { useContext, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";

export default function ValidationPopUp(props) {
  const { setShowValidationPopUp } = useContext(GlobalContext);

  const errorMessageList = props.errorMessage.map((message) => (
    <li>{message}</li>
  ));

  return (
    <div className="fixed flex justify-center items-center h-screen w-full bg-black bg-opacity-40">
      <form className="bg-white rounded-lg shadow-2xl w-1/4">
        <header className="bg-gray-100 flex justify-between">
          <span className="material-icons-outlined text-gray-400">
            drag_handle
          </span>
          <span
            onClick={() => setShowValidationPopUp(false)}
            className="material-icons-outlined text-gray-400"
          >
            close
          </span>
        </header>
        <div className="flex justify-center items-center gap-1 text-xl text-gray-600 font-bold pt-2">
          <span className="material-icons-outlined text-gray-400 cols-span-1">
            error
          </span>
          <h1>Incomplete Form</h1>
        </div>
        <ul className="flex flex-col text-center gap-5 m-5">
          {errorMessageList}
        </ul>
      </form>
    </div>
  );
}
