import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tile from "./Tile";
import SpeechBox from "./SpeechBox";
import BoardSelector from "./BoardSelector";
import '../styles/Board.css';
import { synthesizeSpeech, getBoards, getBoardById } from "../services/api";

const Board = ({ board }) => {
  const [currentBoard, setCurrentBoard] = useState(null);
  const [allBoards, setAllBoards] = useState([]);
  const [speechWords, setSpeechWords] = useState([]);
  const navigate = useNavigate();

  // Fetch all boards when component mounts
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setAllBoards(response.boards || []);

        if (response.boards.length > 0) {
          const lastViewedBoardId = localStorage.getItem("lastViewedBoardId");

          // Fetch last viewed board or default to the first board
          const initialBoard = lastViewedBoardId
            ? await getBoardById(lastViewedBoardId)
            : await getBoardById(response.boards[0]._id);

          setCurrentBoard(initialBoard || response.boards[0]);
        }
      } catch (error) {
        console.error("Error fetching boards:", error);
      }
    };

    fetchBoards();
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

  const handleBoardChange = async (event) => {
    const boardId = event.target.value;
    try {
      const selectedBoard = await getBoardById(boardId);
      if (selectedBoard) {
        setCurrentBoard(selectedBoard);
        setSpeechWords([]);
        localStorage.setItem("lastViewedBoardId", boardId);
      }
    } catch (error) {
      console.error("Error fetching board:", error);
    }
  };

  return (
    <div className="board-container">
      <SpeechBox words={speechWords} setWords={setSpeechWords} />
      <button onClick={() => navigate("/create-board")} className="create-button">
        <i className="fa-solid fa-plus"></i> &nbsp; Create New Board
      </button>
      {currentBoard && (
        <button onClick={() => navigate(`/edit-board/${currentBoard._id}`)} className="edit-button">
          <i className="fas fa-edit"></i> &nbsp; Edit Board
        </button>
      )}

      <BoardSelector allBoards={allBoards} selectedBoard={currentBoard} onChange={handleBoardChange} />

      <div className="choices-container">
        {currentBoard?.choices?.length > 0 ? (
          currentBoard.choices.map((choice) => (
            <Tile key={choice._id || choice} choice={choice} onClick={addWord} />
          ))
        ) : (
          <p>Loading choices...</p>
        )}
      </div>
    </div>
  );
};

export default Board;
