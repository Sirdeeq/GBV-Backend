import express from 'express';
import { body } from 'express-validator';
import { signup, login, logout, deleteAccount, resetPassword, forgotPassword,  } from '../controllers/authController';

const router = express.Router();

router.post(
  '/signup',
  [
    body('full_name').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('organization').notEmpty(),
    body('phone').notEmpty(),
    body('address').notEmpty(),
    body('age').isInt({ min: 0 }),
  ],
  signup
);

router.post('/login', login);
router.post('/logout', logout);
router.post('/delete', deleteAccount);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
// router.post('/google', googleSignIn);

export default router;