import { useState } from "react";
import { addCustomEntryToBoard } from "../services/api";
import "../styles/CustomTileModal.css"

const CustomTileModal = ({ boardId, onClose, onCustomTileAdded }) => {
  const [phrase, setPhrase] = useState("");
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result); // Show preview of the image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phrase || !image) {
      alert("Please provide a phrase and an image.");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("phrase", phrase);
      formData.append("image", image);
  
      const newChoice = await addCustomEntryToBoard(formData);
  
      onCustomTileAdded(newChoice); // Immediately update the board UI
      setTimeout(() => window.location.reload(), 500); // Force board refresh after 0.5s
  
      onClose();
    } catch (error) {
      console.error("Error adding custom tile:", error);
    }
  };
  
  
  
  
  

  return (
    <div className="custom-tile-modal-overlay">
      <div className="custom-tile-modal">
        <h2>Create Custom Tile</h2>
        <form onSubmit={handleSubmit}>
          <div id="phrase">
            <label>Phrase</label>
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              required
            />
          </div>
          <div id="img">
            <label>Image</label>
            <input type="file" onChange={handleImageChange} required />
            {imageURL && <img src={imageURL} alt="Preview" width="100" />}
          </div>
          <div id="sub-btns">
            <button type="submit">Add Custom Tile</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomTileModal;
