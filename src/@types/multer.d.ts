import { Request } from 'express';

// Extend the Request interface to include 'file' for multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
