import { synthesizeSpeech } from "../services/api"; 
import '../styles/SpeechBox.css';

function SpeechBox({ words = [], setWords }) {
  const speakWithPolly = async (word) => {
    try {
      const audioUrl = await synthesizeSpeech(word);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Speech error:", error);
    }
  };

  const readAll = () => {
    if (words.length === 0) return;
    const sentence = words.map(word => word.text).join(" ");
    speakWithPolly(sentence);
  };

  const clearText = () => {
    setWords([]);
  };

  const deleteLast = () => {
    if (words.length > 0) {
      setWords(words.slice(0, -1)); // Removes the last tile
    }
  };

  return (
    <div className="speech-box-container">
      <div className="speech-box">
        {words.length > 0 ? (
          words.map((word, index) => (
            <div key={index} className="speech-box-word">
              {word.image && <img src={word.image} alt={word.text} className="speech-box-image" />} <br/>
              <span>{word.text}</span>
            </div>
          ))
        ) : (
          "Tap a tile to add words!"
        )}
      </div>
      <div className="speech-box-buttons">
        <button onClick={readAll}>
          <i className="fa-solid fa-volume-up"></i> 
        </button>
        <button onClick={deleteLast}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button onClick={clearText}>
          <i class="fa-solid fa-rectangle-xmark"></i>
        </button>
      </div>
    </div>
  );
}

export default SpeechBox;
