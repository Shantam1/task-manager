import React, { useState } from "react";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [project, setProject] = useState(null);

  return (
    <div>

      {!loggedIn && <Login setLoggedIn={setLoggedIn} />}

      {loggedIn && !project && <Projects setProject={setProject} />}

      {loggedIn && project && <Tasks project={project} />}

      {/* Toast container must always exist */}
      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
}

export default App;