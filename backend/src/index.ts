import express from "express";
import authRoutes from "./routes/authRoutes.js"; // Import the auth routes
import cookieParser from 'cookie-parser';
const app = express();
app.use(cookieParser())
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Use the auth routes for any request to /api/auth
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
