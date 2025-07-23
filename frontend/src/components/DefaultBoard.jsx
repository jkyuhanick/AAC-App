import { useState, useEffect } from "react";
import Tile from "./Tile";
import SpeechBox from "./SpeechBox";
import '../styles/Board.css';
import { synthesizeSpeech, getDefaultBoard } from "../services/api";

const DefaultBoard = () => {
  const [defaultBoard, setDefaultBoard] = useState(null);
  const [speechWords, setSpeechWords] = useState([]);

  useEffect(() => {
    const fetchBoard = async () => {
      const board = await getDefaultBoard(); 
      setDefaultBoard(board);
    };

    fetchBoard();
  }, []);

  const addWord = (choice) => {
    let word = typeof choice === "string" ? choice : choice?.text;
    if (!word) return;

    setSpeechWords((prev) => [...prev, { text: word, image: choice.image || "" }]);
    speakWithPolly(word);
  };

  const speakWithPolly = async (word) => {
    try {
      const audioUrl = await synthesizeSpeech(word);
      new Audio(audioUrl).play();
    } catch (error) {
      console.error("Speech error:", error);
    }
  };


  return (
    <div>
      <h3 className="user-alert" style={{ textAlign: "center" }}>
        Log in to create custom boards.
      </h3>
      <SpeechBox words={speechWords} setWords={setSpeechWords} />
      <div className="choices-container">
        {defaultBoard?.choices?.length > 0 ? (
          defaultBoard.choices.map((choice) => (
            <Tile key={choice._id || choice} choice={choice} onClick={addWord} />
          ))
        ) : (
          <p>Loading choices...</p>
        )}
      </div>
    </div>
  );
};

export default DefaultBoard;