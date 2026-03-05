import React, { useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function Login({ setLoggedIn }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const res = await API.post("/login/", {
        username,
        password
      });

      localStorage.setItem("token", res.data.access);

      toast.success("Login successful");

      setLoggedIn(true);

    } catch (err) {

      const message =
        err.response?.data?.detail || "Invalid username or password";

      toast.error(message);

    }

  };

  return (
    <div style={{textAlign:"center", marginTop:"200px"}}>
      <h2>Monsoon Task Login</h2>

      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;