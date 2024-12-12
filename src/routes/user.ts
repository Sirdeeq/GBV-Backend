import express, { Request, Response } from "express";
import multer, { MulterError } from "multer";
import {
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "uploads/"); // The destination directory
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: MulterError | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Apply the multer middleware before calling the updateUser function
router.put("/users/:userId", upload.single("profileImage"), updateUser);

router.get("/users", getAllUsers); // Get all users
router.get("/users/:userId", getUserById); // Get user by ID
router.delete("/users/:userId", deleteUser);

export default router;
