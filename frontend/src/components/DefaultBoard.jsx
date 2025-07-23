// components/DefaultBoard.js
import Board from "./Board";
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
      {defaultBoard && <Board board={defaultBoard} />}
    </div>
  );
};

export default DefaultBoard;