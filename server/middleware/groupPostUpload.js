const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const validator = require("validator");
const createError = require("http-errors");

const sanitizeFilename = (filename) => {
  const name = path.parse(filename || "file").name;
  return name
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 100);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const baseName = sanitizeFilename(file.originalname);
    const extension = path.extname(file.originalname || "");
    return {
      folder: "vision_group_vault",
      public_id: `${baseName}_${Date.now()}${extension}`,
      resource_type: file.mimetype.startsWith("image/") ? "image" : "auto",
      type: "upload",
      access_mode: "public",
      use_filename: true,
      unique_filename: false,
    };
  },
});

const allowedMimes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-rar-compressed",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".zip",
  ".rar",
];

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isMimeAllowed =
    validator.isMimeType(file.mimetype || "") &&
    allowedMimes.includes(file.mimetype);
  const isExtensionAllowed = allowedExtensions.includes(extension);

  if (isMimeAllowed && isExtensionAllowed) {
    cb(null, true);
    return;
  }

  cb(
    createError(
      400,
      "Invalid file type. Allowed: images, PDF, DOC, DOCX, TXT, PPT, XLS, ZIP",
    ),
    false,
  );
};

const groupPostUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = groupPostUpload;
