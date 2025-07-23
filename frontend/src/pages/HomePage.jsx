import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board";
import { getBoardById, getBoardChoices } from "../services/api";
import "../styles/styles.css";
import "../styles/HomePage.css";

const HomePage = ({ user, allBoards }) => {
  const [currentBoard, setCurrentBoard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if(!user){
      const fetchDefaultChoices = async () => {
        try {
          const data = await getBoardChoices();
          const defaultBoard = {
            _id: "guest", // dummy ID
            name: "Guest Board",
            choices: data.map(choice => ({
              _id: choice._id,
              phrase: choice.phrase,
              image: choice.image
            }))
          };
        console.log(defaultBoard);
         setCurrentBoard(defaultBoard);
        } catch (error) {
          console.error("Error fetching default choices:", error);
        }
      };

      fetchDefaultChoices();
    } else {
      const fetchInitialBoard = async () => {
        const lastViewedBoardId = localStorage.getItem("lastViewedBoardId");

        if (lastViewedBoardId) {
          const savedBoard = await getBoardById(lastViewedBoardId);
          if (savedBoard) {
            setCurrentBoard(savedBoard);
            return;
          }
        }

        if (allBoards.length > 0) {
          setCurrentBoard(allBoards[0]); // Default board
        }
      };

      fetchInitialBoard();
    }
  }, [allBoards]);

  if (!user) {
    return (
      <div>
      {!user && (
        <h3 className="user-alert" style={{ textAlign: "center" }}>
          Log in to create custom boards.
        </h3>
      )}
      <Board board={currentBoard} />
    </div>
    );
  }

  if (allBoards.length === 0) {
    return (
      <div className="homePagediv">
        <h3>No boards available. Create a new one!</h3>
        <button onClick={() => navigate("/create-board")} className="create-button">
          <i className="fa-solid fa-plus"></i> &nbsp; Create New Board
        </button>
      </div>
    );
  }

  return (
    <div>
      {currentBoard && <Board board={currentBoard} />}
    </div>
  );
};

export default HomePage;
