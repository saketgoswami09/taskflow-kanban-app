import { type Request, type Response, type NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Create an instance of the Prisma Client to talk to the DB
const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // 1. VALIDATE INPUT
    // Check if email and password were provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // 2. CHECK IF USER EXISTS
    // Check the database to see if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    // 3. HASH THE PASSWORD 🛡️
    // Never store plain text passwords!
    const saltRounds = 10; // A good standard for security
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. SAVE THE NEW USER
    // Create the new user in the database with the hashed password
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // 5. SEND SUCCESS RESPONSE ✅
    // Send a success message, but DON'T send the password back!
    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error); // Good for debugging
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // 2. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
    }

    // 3. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." }); // Unauthorized
    }

    // 4. Generate a JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" } // Token will expire in 1 hour
    );

    // 5. Send the JWT in an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 3600000, // 1 hour in milliseconds
    });

    // 6. Send success response
    res.status(200).json({
      message: "Logged in successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getProfile = (req: AuthRequest, res: Response) => {
  // The user info is attached by the authMiddleware
  res.status(200).json({ message: "Welcome to your profile!", user: req.user });
};
