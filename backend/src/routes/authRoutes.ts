import { Router } from "express";
import { register, login, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Route for POST /api/auth/register
router.post("/register", register);
router.post('/login', login);


router.get('/profile', authMiddleware, getProfile);

export default router;
