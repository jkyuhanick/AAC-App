// components/DefaultBoard.js
import SpeechBox from "./SpeechBox";
import { useEffect, useState } from "react";
import { getDefaultBoard } from "../services/api";

const DefaultBoard = () => {
  const [defaultBoard, setDefaultBoard] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      const board = await getDefaultBoard(); 
      setDefaultBoard(board);
    };

    fetchBoard();
  }, []);

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