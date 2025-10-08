import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createBoard, getBoards } from '../controllers/boardController.js';

const router = Router();

// IMPORTANT: Use the authMiddleware for all routes in this file
// This will protect all our board-related endpoints
router.use(authMiddleware);

// Routes for /api/boards
router.post('/', createBoard); // POST /api/boards
router.get('/', getBoards);   // GET /api/boards

export default router;