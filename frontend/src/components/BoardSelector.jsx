import React from "react";
import "../styles/BoardSelector.css";

const BoardSelector = ({ allBoards, selectedBoard, onChange }) => {
  return (
    <div className="board-selector">
      <label htmlFor="board-dropdown" className="board-selector__label">
        Board:
      </label>
      <select
        id="board-dropdown"
        value={selectedBoard?._id || ""}
        onChange={onChange}
        className="board-selector__dropdown"
      >
        <option value="" disabled>Select a board</option>
        {allBoards.map((board) => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BoardSelector;
