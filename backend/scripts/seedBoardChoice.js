import dotenv from 'dotenv';
import BoardChoice from '../models/boardChoice.model.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

dotenv.config({ path: '../../.env' });

// Connect to MongoDB
connectDB();

// Function to populate boardChoices
const populateBoardChoices = async () => {
  const choices = [
    { phrase: "Hello", image: "noun-hello-4516636.png", category: "basic" },
    { phrase: "Goodbye", image: "noun-siblings-waving-1971039.png", category: "basic" },
    { phrase: "Please", image: "noun-please-4987006.png", category: "basic" },
    { phrase: "Thank You", image: "noun-thank-you-7102732.png", category: "basic" },
    { phrase: "I", image: "noun-me-4066327.png", category: "ordering"},
    { phrase: "want", image: "noun-want-2012632.png", category: "ordering"},
    { phrase: "water", image: "noun-water-7753260.png", category: "ordering"},
    { phrase: "soda", image: "noun-soda-4822996.png", category: "ordering"},
    { phrase: "milk", image: "noun-milk-7660401.png", category: "ordering"},
    { phrase: "chocolate milk", image: "noun-chocolate-milk-5771118.png", category: "ordering"},
    { phrase: "juice", image: "noun-juice-7666649.png", category: "ordering"},
    { phrase: "cheeseburger", image: "noun-cheeseburger-7118544.png", category: "ordering"},
    { phrase: "chicken nuggets", image: "noun-nuggets-1076956.png", category: "ordering"},
    { phrase: "spaghetti and meatballs", image: "noun-noodle-1036694.png", category: "ordering"},
    { phrase: "mac and cheese", image: "noun-macaroni-and-cheese-5637819.png", category: "ordering"},
    { phrase: "french fries", image: "noun-fries-7769414.png", category: "ordering"},
    { phrase: "fruit", image: "noun-fruit-7132056.png", category: "ordering"},
    { phrase: "pizza", image: "noun-pizza-7763509.png", category: "ordering"},
    { phrase: "Yes", image: "noun-yes-7481489.png", category: "basic" },
    { phrase: "No", image: "noun-no-2998708.png", category: "basic" }
  ];

  try {
    // delete existing boardChoices
    await BoardChoice.deleteMany({});
    await BoardChoice.insertMany(choices); // Insert multiple documents
    console.log("BoardChoices populated successfully!");
  } catch (error) {
    console.error("Error populating BoardChoices:", error);
  } finally {
    mongoose.connection.close(); // Close the DB connection when done
  }
};

// Run the script after the DB connection is established
populateBoardChoices();
