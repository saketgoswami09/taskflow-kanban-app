import { type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { type AuthRequest } from '../middleware/authMiddleware.js'; // We'll need our custom request type

const prisma = new PrismaClient();

// Controller to CREATE a new board
export const createBoard = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.userId; // Getting userId from our authMiddleware!

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and user ID are required.' });
    }

    const newBoard = await prisma.board.create({
      data: {
        title,
        userId, // Connecting the board to the user
      },
    });

    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: 'Server error while creating board.' });
  }
};

// Controller to GET all boards for a user
export const getBoards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const boards = await prisma.board.findMany({
      where: {
        userId, // Finding all boards that belong to this user
      },
    });

    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching boards.' });
  }
};