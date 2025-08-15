import React, { createContext } from "react";

import "./style/App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "../Login/Login.jsx";
import Home from "./Home.jsx";
import axios from "axios";
import config from "../../configuration/config.js";

export const SectionContext = createContext();
export const UserDataChangeCounterContext = createContext();

axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.BASE_URL;


axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401 && (sessionStorage.getItem("isLoginPage") === null || sessionStorage.getItem("isLoginPage") === "false")) {
      try {
        const res = await axios.post(config.endpoints.login.REFRESH_TOKEN);

        if (res.status === "200" && res.data.accessToken) {
          error.config.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
          return axios(error.config); // Retry failed request
        }
        else
          window.location.href = "/";
      } catch (error) {
        console.error("Session expired. Redirecting to login page.", error);
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App;
