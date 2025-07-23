import axios from 'axios';

// Set the base URL for the backend
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Axios instance for setting up default headers 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  
});


// Register a new user
export const registerUser = async (email, password) => {
    try {
      const response = await api.post('/api/users', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
  
      // Capture the response message properly
      if (error.response) {
        throw error.response.data; 
      } else {
        throw { message: 'Network error. Please try again.' }; // Handle cases where response is undefined
      }
    }
  };
  

// Log in a user and store JWT in cookies
export const loginUser = async (email, password) => {
  try {
    const response = await api.post(
      "/api/login",
      { email, password },
      { withCredentials: true } 
    );
    return response.data.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error.response?.data || { message: "Network error. Please try again." };
  }
};

// Get the currently authenticated user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/current-user", {
      withCredentials: true, 
    });
    return response.data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

 


// Log out the user and clear JWT cookie
export const logoutUser = async () => {
  try {
    const response = await api.post('/api/logout');
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error.response?.data || error;
  }
};

// Create a new board
export const createBoard = async (userId, name, choices) => {
  try {
    const response = await api.post('/api/boards', { userId, name, choices });
    return response.data;
  } catch (error) {
    console.error('Error creating board:', error);
    throw error.response?.data || error;
  }
};

// Get all the boards for a specific user
export const getBoards = async () => {
  try {
    const response = await api.get('/api/boards');
    return response.data;
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error.response?.data || error;
  }
};

// Get a specific board by ID
export const getBoardById = async (boardId) => {
  console.log("Fetching board details for ID:", boardId);
  try {
    const response = await api.get(`/api/boards/${boardId}`);
    
    const data = response.data;

    if (data.board) {
      console.log("Board data fetched successfully:", data.board);
      return data.board;
    } else {
      console.error("No board found in the response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching board details:", error);
    return null;
  }
};



// Add a choice to an existing board
export const addChoiceToBoard = async (boardId, choiceId) => {
  try {
    const response = await api.post(`/api/boards/${boardId}/choices`, { choiceId });
    return response.data;
  } catch (error) {
    console.error('Error adding choice to board:', error);
    throw error.response?.data || error;
  }
};

// Add a custom entry to the BoardChoices collection
export const addCustomEntryToBoard = async (formData) => {
  try {
    const response = await api.post(`/api/choices/custom`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding custom entry:", error);
    throw error.response?.data || error;
  }
};





// Update an existing board (e.g., name or choices)
export const updateBoard = async (boardId, name, addChoices, removeChoices) => {
  try {
    const response = await api.put(`/api/boards/${boardId}`, { name, addChoices, removeChoices });
    return response.data;
  } catch (error) {
    console.error('Error updating board:', error);
    throw error.response?.data || error;
  }
};

// Delete a board
export const deleteBoard = async (boardId) => {
  try {
    const response = await api.delete(`/api/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error.response?.data || error;
  }
};

// Delete a choice from a board
export const deleteChoiceFromBoard = async (boardId, choiceId) => {
  try {
    const response = await api.delete(`/api/boards/${boardId}/choices/${choiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting choice from board:', error);
    throw error.response?.data || error;
  }
};

// Delete a custom entry from a board
export const deleteCustomEntryFromBoard = async (boardId, customId) => {
  try {
    const response = await api.delete(`/api/boards/${boardId}/custom/${customId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting custom entry from board:', error);
    throw error.response?.data || error;
  }
};

export const fetchFirstBoard = async (userId) => {
  console.log("Fetching first board for user:", userId);
  try {
    const response = await api.get(`/api/boards/first/${userId}`);
    
    const data = response.data;  

    // Check the structure of the response and log it
    if (data.board) {
      console.log("Board found in response:", data.board);  // Log the board data
      return data.board;
    } else {
      console.error("No board found in the response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching board:", error);
    return null;
  }
};


// Fetch all available board choices
export const getBoardChoices = async () => {
  try {
    const response = await api.get("/api/board-choices");  // Fetch filtered choices from the server
    return response.data;
  } catch (error) {
    console.error("Error fetching board choices:", error);
    throw error.response?.data || error;
  }
};

// Get default board
export const getDefaultBoard = async () => {
  try {
    const response = await api.get("/api/boards/default");
    return response.data;
  } catch (error){
    console.error("Error fetching default board", error);
    throw error.response?.data || error;
  }
};


export const synthesizeSpeech = async (text) => {
  try {
    const response = await api.post("/api/polly/synthesize", { text }, { responseType: "blob" });

    const audioBlob = response.data;
    return URL.createObjectURL(audioBlob); // Convert blob to a URL for playback
  } catch (error) {
    console.error("Error synthesizing speech:", error);
    throw error.response?.data || error;
  }
};


