import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tile from "../components/Tile";
import SpeechBox from "../components/SpeechBox";
import { getBoardChoices } from "../services/api";
import "../styles/styles.css";
import "../styles/HomePage.css";

const HomePage = () => {
  const [defaultChoices, setDefaultChoices] = useState([]);
  const [speechWords, setSpeechWords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDefaultChoices = async () => {
      try {
        const data = await getBoardChoices(); // Fetch all available choices
        setDefaultChoices(data.choices || []);
      } catch (error) {
        console.error("Error fetching default choices:", error);
      }
    };

    fetchDefaultChoices();
  }, []);

  const addWord = (choice) => {
    const word = choice?.text;
    if (!word) return;

    setSpeechWords((prev) => [...prev, { text: word, image: choice.image || "" }]);
  };

  return (
    <div className="board-container">
      <SpeechBox words={speechWords} setWords={setSpeechWords} />

      <button onClick={() => navigate("/create-board")} className="create-button">
        <i className="fa-solid fa-plus"></i> &nbsp; Create New Board
      </button>

      <div className="choices-container">
        {defaultChoices.length > 0 ? (
          defaultChoices.map((choice) => (
            <Tile key={choice._id} choice={choice} onClick={addWord} />
          ))
        ) : (
          <p>Loading default board...</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
