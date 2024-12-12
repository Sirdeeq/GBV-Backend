import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from "bcrypt";

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

// Update user details
// export const updateUser = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { userId } = req.params;
//     const updatedData = req.body;
//     let profileImageUrl = '';

//     // If a new image is provided, upload it to Cloudinary
//     if (req.file) {
//       const image = req.file;
//       const uploadResponse = await cloudinary.uploader.upload(image.path, {
//         folder: 'user_profiles', // Optionally specify a folder in Cloudinary
//       });

//       // If upload is successful, get the URL and save it
//       profileImageUrl = uploadResponse.secure_url;
//     }

//     // If password is provided in the update, hash it
//     if (updatedData.password) {
//       const salt = await bcrypt.genSalt(10);
//       updatedData.password = await bcrypt.hash(updatedData.password, salt);
//     }

//     // If profile image URL was updated, include it in the updated data
//     if (profileImageUrl) {
//       updatedData.profileImage = profileImageUrl;
//     }

//     // Update the user document with the new data
//     const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.json(updatedUser);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Error updating user' });
//   }
// };

export const updateUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updatedData = req.body;
  
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating user' });
    }
  };
  

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};
