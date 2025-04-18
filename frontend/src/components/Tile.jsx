import "../styles/Board.css";

const Tile = ({ choice, onClick, isSelected }) => {
  return (
    <div 
      className={`tile ${isSelected ? "selected" : ""}`} 
      onClick={() => onClick({ text: choice.phrase || "Phrase", image: choice.image || "default.png" })}
    >
      {choice.image ? (
        <img src={choice.image} alt={choice.phrase || "Unknown"} className="tile-image" />
      ) : (
        <div className="tile-placeholder">No Image</div>
      )}
      <p className="tile-phrase">{choice.phrase || "Unknown"}</p>
    </div>
  );
};

export default Tile;