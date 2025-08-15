import Panel from "./Panel.jsx";
import Board from "./Board.jsx";
import Bar from "./Bar.jsx";
import { SectionContext } from "./App.jsx";
import { UserDataChangeCounterContext } from "./App.jsx";
import { useEffect, useState } from "react";
import config from "../../configuration/config.js";
import "./style/App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [section, setSection] = useState(config.panelNames.DASHBOARD);
  const [userDataChangeCounter, setUserDataChangeCounter] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {

    axios.get(config.endpoints.login.AUTH)
      .then((response) => {
        if (response.status !== 200) {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Error fetching authentication status: ", error);
        navigate("/");
      });
  }, [navigate])

  return (
    <div className="home">
      <Bar userDataChangeCounter={userDataChangeCounter}></Bar>
      <div className="body">
        <SectionContext.Provider value={{ section, setSection }}>
          <Panel></Panel>
        </SectionContext.Provider>
        <UserDataChangeCounterContext.Provider value={{ userDataChangeCounter, setUserDataChangeCounter }}>
          <Board clickedSection={section}></Board>
        </UserDataChangeCounterContext.Provider>
      </div>
    </div>
  );
}

export default Home;