import { Request } from "express";
import multer from "multer";

// Multer function, know not what it do, but is work so no touch.
const multerConfigSingleFile = {
  limits: { fileSize: 1024 * 1024 * 50, fields: 1, files: 1, parts: 2, headerPairs: 20 }, // limit file size to 50 megabytes
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      return cb(new Error("Invalid mime type"));
    }
  },
};

const multerSingleImage = multer(multerConfigSingleFile);
const uploadSingleImage: CallableFunction = multerSingleImage.single("file");

export { uploadSingleImage };
