export const multerConfigSingleFile = {
  limits: { fileSize: 1024 * 1024 * 50, fields: 1, files: 1, parts: 2, headerPairs: 20 }, // limit file size to 50 megabytes
  fileFilter: (_req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      return cb(new Error("Invalid mime type"));
    }
  },
};

export const multerConfigLargeRequest = {
  limits: { fileSize: 1024 * 1024 * 50, fields: 10, files: 10, parts: 20, headerPairs: 20 }, // limit file size to 50 megabytes
  fileFilter: (_req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      return cb(new Error("Invalid mime type"));
    }
  },
};
