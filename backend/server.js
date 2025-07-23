import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectDB } from './config/db.js';
import Board from './models/board.model.js';
import User from './models/user.model.js';
import BoardChoice from './models/boardChoice.model.js';
import AWS from "aws-sdk";
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'https://aac-app-1.onrender.com'],
  credentials: true,
}));


app.use(express.static('public'));
app.use("/images", express.static(path.join(__dirname, "frontend", "public", "images")));

const JWT_SECRET = process.env.JWT_SECRET;
globalThis.global = globalThis;


// S3 Setup
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_S3_REGION,
});

// Set up multer to handle image upload
const storage = multer.memoryStorage(); // Using memoryStorage to store files in memory
const upload = multer({ storage: storage });

async function getSignedImageUrl(fileName) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
}


// Polly Setup
const polly = new AWS.Polly({
  accessKeyId: process.env.AWS_POLLY_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_POLLY_SECRET_ACCESS_KEY,
  region: process.env.AWS_POLLY_REGION,
});

  app.post("/api/polly/synthesize", async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
  
    const params = {
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Joanna",
    };
  
    try {
      const data = await polly.synthesizeSpeech(params).promise();
      res.setHeader("Content-Type", "audio/mpeg");
      res.send(data.AudioStream);
    } catch (error) {
      console.error("Polly Error:", error);
      res.status(500).json({ error: "Failed to synthesize speech" });
    }
  });

// Ensure images directory exists
const uploadPath = path.join(__dirname, "frontend", "public", "images");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Middleware for handling errors
app.use((req, res, next) => {
    res.jsonResponse = (status, message, data = null) => {
      res.status(status).json({
        message,
        data,
      });
    };
    next();
  });

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    // Try to get the token from cookies first
    const token = req.cookies.jwt || req.headers["authorization"];

    // If no token is found
    if (!token) {
        return res.status(401).json({ message: "No token provided. Please log in." });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }

        // If the token is valid, store the decoded user ID in the request object
        req.userId = decoded.userId;
        next();  // Proceed to the next middleware or route handler
    });
};

app.get("/api/boards/first/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid User ID." });
      }

      const board = await Board.findOne({ user: userId })
          .populate("choices")  
          .sort({ createdAt: 1 });

      if (!board) {
          return res.status(404).json({ message: "Board not found." });
      }

      // Generate signed URLs for choices
      const signedChoices = await Promise.all(board.choices.map(async (choice) => {
          if (choice.image) {
              choice.image = await getSignedImageUrl(choice.image); // Generate signed URL
          }
          return choice;
      }));

      res.json({ board: { ...board.toObject(), choices: signedChoices } });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving the board." });
  }
});

  
  
// create user / user sign up
app.post("/api/users", async (req, res) => {
    console.log('Received registration request:', req.body);  // Log request body
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({
            message: 'User created successfully!',
            user: {
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user. Please try again.', error: error.message });
    }
});

// Get logged-in user details
app.get("/api/current-user", async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password"); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });  // Ensure this returns the correct data
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user" });
    }
});



// Login route - Storing JWT in cookies
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Authenticate user
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '180d' });

    // Set the JWT token in the cookie
    res.cookie('jwt', token, {
        httpOnly: true, // Make the cookie inaccessible from JS
        secure: true, // Set to true in production if using HTTPS
        sameSite: 'None', // Helps prevent attacks
        maxAge: 3600000*24*30*6 // 6 months
    });

    res.status(200).json({ message: "Logged in successfully" });
});


// Middleware to verify the JWT token from cookies
app.get("/api/me", (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        User.findById(decoded.userId).then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ email: user.email });
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
});



// Logout route
app.post('/api/logout', (req, res) => {
  res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
  });
  res.status(200).json({ message: "Logged out successfully" });
});


// Create board
app.post("/api/boards", verifyToken, async (req, res) => {
    try {
        const { userId, name, choices } = req.body;

        // Check if the user ID is valid
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Convert userId to ObjectId and check if the user exists
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(userObjectId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the new board
        const newBoard = new Board({
            user: userObjectId,
            name: name,
            choices: choices,
        });

        // Save the board and send the response
        await newBoard.save();
        const populatedBoard = await Board.findById(newBoard._id).populate("choices");

        res.status(201).json({
            message: "Board created successfully!",
            board: populatedBoard,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during board creation." });
    }
});

// Get board
app.get("/api/boards/:boardId", verifyToken, async (req, res) => {
    const { boardId } = req.params;  // Get the boardId from the URL
  
    try {
      // Validate the provided boardId is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(boardId)) {
        return res.status(400).json({ message: "Invalid Board ID." });
      }
  
      // Find the board by boardId
      const board = await Board.findById(boardId).populate("choices").populate("customChoices");
      if (!board) {
        return res.status(404).json({ message: "Board not found." });
      }
  
      const signedChoices = await Promise.all(board.choices.map(async (choice) => {
        if (choice.image) {
            choice.image = await getSignedImageUrl(choice.image);
        }
        return choice;
    }));
    
    const signedCustomChoices = await Promise.all(board.customChoices.map(async (choice) => {
        if (choice.image) {
            choice.image = await getSignedImageUrl(choice.image);
        }
        return choice;
    }));
    
    res.status(200).json({
        message: "Board retrieved successfully!",
        board: { 
            ...board.toObject(), 
            choices: signedChoices,
            customChoices: signedCustomChoices
        },
    });
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving the board." });
    }
  });
  

// Add entry to existing board
app.post("/api/boards/:boardId/choices", verifyToken, async (req, res) => {
    try {
        const { boardId } = req.params;
        const { choiceId } = req.body;  // The ID of the BoardChoice to be added

        // Check if the provided choiceId is valid
        if (!mongoose.Types.ObjectId.isValid(choiceId)) {
            return res.status(400).json({ message: "Invalid BoardChoice ID." });
        }

        // Find the board by ID
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found." });
        }

        // Ensure the board belongs to the logged-in user
        if (board.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to modify this board." });
        }

        // Find the BoardChoice by ID
        const boardChoice = await BoardChoice.findById(choiceId);
        if (!boardChoice) {
            return res.status(404).json({ message: "BoardChoice not found." });
        }

        // Add the BoardChoice to the board's choices
        board.choices.push(boardChoice._id);

        // Save the updated board
        await board.save();

        // Respond with the updated board
        res.status(200).json({
            message: "BoardChoice added to board successfully!",
            board,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding BoardChoice to the board." });
    }
});

// Route to handle the image upload and save the custom entry
app.post("/api/choices/custom", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { phrase, category } = req.body;
    
    // Check if the image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed." });
    }

    // Generate a unique filename for the image
    const imageName = `${Date.now()}-${req.file.originalname}`;

    // Upload the file buffer to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imageName, // Unique file name
      Body: req.file.buffer, // File buffer
      ContentType: req.file.mimetype, // MIME type
    };
    
    const s3UploadResponse = await s3.send(new PutObjectCommand(uploadParams));

    // Construct the S3 URL for the uploaded image
    const imageUrl = imageName;

    // Create a new BoardChoice object
    const newChoice = new BoardChoice({
      phrase,
      image: imageUrl, // Save the image URL from S3
      category: category || "default", // Default category if not provided
      user: req.userId,
    });

    // Save the new custom tile to the database
    await newChoice.save();

    // Respond with the new custom choice
    res.status(201).json(newChoice);
  } catch (error) {
    console.error("Error adding custom tile:", error);
    res.status(500).json({ message: "Server error while adding custom tile." });
  }
});


// Get all boards for the logged-in user
app.get("/api/boards", verifyToken, async (req, res) => {
    try {
        // Find all boards that belong to the currently logged-in user
        const boards = await Board.find({ user: req.userId }); 

        if (boards.length === 0) {
            return res.status(404).json({ message: "No boards found for this user." });
        }

        // Respond with the list of board titles and their respective boardIds
        res.status(200).json({
            message: "Boards fetched successfully.",
            boards,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching boards." });
    }
});

// Get all entries of a specific board
app.get("/api/boards/:boardId/entries", verifyToken, async (req, res) => {
    try {
        const { boardId } = req.params;

        // Find the board by its ID
        const board = await Board.findById(boardId)
            .populate("choices") // Populate the preselected choices (BoardChoice references)
            .exec();

        if (!board) {
            return res.status(404).json({ message: "Board not found." });
        }

        // Ensure the board belongs to the logged-in user
        if (board.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to view this board." });
        }

        const signedChoices = await Promise.all(board.choices.map(async (choice) => {
          if (choice.image) {
              choice.image = await getSignedImageUrl(choice.image);
          }
          return choice;
      }));
      
      const signedCustomChoices = await Promise.all(board.customChoices.map(async (choice) => {
          if (choice.image) {
              choice.image = await getSignedImageUrl(choice.image);
          }
          return choice;
      }));
      
      res.status(200).json({
          message: "Board entries fetched successfully.",
          board: {
              name: board.name,
              choices: signedChoices,
              customChoices: signedCustomChoices,
          },
      });
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching board entries." });
    }
});

// Update existing board
app.put("/api/boards/:boardId", verifyToken, async (req, res) => {
    const { boardId } = req.params; // Get the board ID from the URL
    const { name, addChoices, removeChoices } = req.body; // Get the new name and choices to add/remove
  
    try {
      // Validate if the provided boardId is valid
      if (!mongoose.Types.ObjectId.isValid(boardId)) {
        return res.status(400).json({ message: "Invalid Board ID." });
      }
  
      // Find the board by ID
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found." });
      }
  
      // Ensure the board belongs to the logged-in user
      if (board.user.toString() !== req.userId) {
        return res.status(403).json({ message: "You are not authorized to modify this board." });
      }
  
      // If a name is provided, update the board's name
      if (name) {
        board.name = name;
      }
  
      // If choices are provided to add, update the board's choices
      if (addChoices && Array.isArray(addChoices)) {
        // Add each new choice to the choices array of the board
        board.choices.push(...addChoices);
      }
  
      // If choices are provided to remove, filter out those choices
      if (removeChoices && Array.isArray(removeChoices)) {
        // Remove choices that match the IDs in removeChoices
        board.choices = board.choices.filter(choice => !removeChoices.includes(choice.toString()));
      }
  
      // Save the updated board
      await board.save();
  
      // Respond with the updated board
      res.status(200).json({
        message: "Board updated successfully.",
        board,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating the board." });
    }
  });


// Delete board
app.delete("/api/boards/:boardId", verifyToken, async (req, res) => {
    try {
        const { boardId } = req.params;

        // Find the board by ID
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found." });
        }

        // Ensure the board belongs to the logged-in user
        if (board.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this board." });
        }

        // Delete the board
        await board.deleteOne();

        // Respond with success message
        res.status(200).json({ message: "Board deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting board." });
    }
});

// delete entry from specific board
app.delete("/api/boards/:boardId/choices/:choiceId", verifyToken, async (req, res) => {
    try {
        const { boardId, choiceId } = req.params; // Extract both boardId and choiceId from URL parameters

        // Check if the provided choiceId is valid
        if (!mongoose.Types.ObjectId.isValid(choiceId)) {
            return res.status(400).json({ message: "Invalid BoardChoice ID." });
        }

        // Find the board by ID
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: "Board not found." });
        }

        // Ensure the board belongs to the logged-in user
        if (board.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to modify this board." });
        }

        // Remove the BoardChoice from the board's choices
        board.choices = board.choices.filter(choice => choice.toString() !== choiceId);

        // Save the updated board
        await board.save();

        // Respond with the updated board
        res.status(200).json({
            message: "BoardChoice removed from board successfully!",
            board,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing BoardChoice from the board." });
    }
});

// DELETE custom entry from board
app.delete("/api/boards/:boardId/custom/:customId", verifyToken, async (req, res) => {
    const { boardId, customId } = req.params;  // Get the boardId and customId from the URL
  
    try {
      // Validate if the provided boardId and customId are valid MongoDB ObjectIds
      if (!mongoose.Types.ObjectId.isValid(boardId) || !mongoose.Types.ObjectId.isValid(customId)) {
        return res.status(400).json({ message: "Invalid Board or Custom Entry ID." });
      }
  
      // Find the board by boardId
      const board = await Board.findById(boardId);
      if (!board) {
        return res.status(404).json({ message: "Board not found." });
      }
  
      // Ensure the board belongs to the logged-in user
      if (board.user.toString() !== req.userId) {
        return res.status(403).json({ message: "You are not authorized to modify this board." });
      }
  
      // Find the index of the custom entry (image and phrase) in the customChoices array
      const customIndex = board.customChoices.findIndex(custom => custom._id.toString() === customId);
      if (customIndex === -1) {
        return res.status(404).json({ message: "Custom entry not found." });
      }
  
      // Remove the custom entry from the customChoices array
      board.customChoices.splice(customIndex, 1);
  
      // Save the updated board
      await board.save();
  
      // Respond with the updated board
      res.status(200).json({
        message: "Custom entry removed from the board successfully!",
        board,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error removing custom entry from the board." });
    }
  });  
  

// Fetch all available board choices
app.get("/api/board-choices", async (req, res) => {
  try {
    const choices = await BoardChoice.find({
      $or: [
        { user: { $exists: false } }, // Public choices
        { user: req.userId }, // User-specific choices
      ],
    });

    // Generate signed URLs for each image before sending response
    for (let choice of choices) {
      if (choice.image) {
        choice.image = await getSignedImageUrl(choice.image); 
      }
    }

    res.json(choices);
  } catch (error) {
    console.error("Error fetching board choices:", error);
    res.status(500).json({ message: "Error fetching board choices" });
  }
});


// GET /api/boards/default - get the default public board
app.get("api/boards/default", async (req, res) => {
  try {
    const defaultBoard = await BoardChoice.find();
    if (!defaultBoard) {
      return res.status(404).json({ message: "Default board not found." });
    }
    res.json(defaultBoard);
  } catch (err) {
    console.error("Error fetching default board:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 404 error for undefined routes
app.use((req, res) => {
    res.jsonResponse(404, "Route not found.");
  });
  
  // global server errors
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.jsonResponse(500, "Something went wrong.");
  });


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  connectDB()
  console.log(`Server running on port ${PORT}`)
})