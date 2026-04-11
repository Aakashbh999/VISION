const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const validator = require("validator");
const createError = require("http-errors");

// Helper to sanitize filename for Cloudinary public_id
const sanitizeFilename = (filename) => {
  const name = path.parse(filename).name;
  return name
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 100); // Limit length
};

// Helper to determine if file is a raw type (non-image)
const isRawFile = (mimetype) => {
  const rawMimes = [
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
  return rawMimes.includes(mimetype);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = sanitizeFilename(file.originalname);
    const timestamp = Date.now();
    const publicId = `${originalName}_${timestamp}`;

    // Decide resource type
    let resourceType = "auto";
    // PDF and other docs should use 'auto' to allow Cloudinary to handle them better
    // specifically for 'allowed_formats' and for correct URL generation.
    // 'raw' is only strictly necessary for non-media files Cloudinary doesn't recognize.
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
    }

    // Get extension from original filename
    const extension = path.extname(file.originalname);

    return {
      folder: "vision_uploads",
      public_id: publicId + extension,
      resource_type: resourceType,
      type: "upload",
      access_mode: "public",
      use_filename: true,
      unique_filename: false, // timestamp ensures uniqueness
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "pdf",
        "doc",
        "docx",
        "txt",
        "ppt",
        "pptx",
        "xls",
        "xlsx",
        "zip",
        "rar",
      ],
    };
  },
});

// File filter for validation
const fileFilter = (req, file, cb) => {
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

  const extension = path.extname(file.originalname || "").toLowerCase();
  const isMimeAllowed =
    validator.isMimeType(file.mimetype || "") &&
    allowedMimes.includes(file.mimetype);
  const isExtensionAllowed = allowedExtensions.includes(extension);

  if (isMimeAllowed && isExtensionAllowed) {
    cb(null, true);
  } else {
    cb(
      createError(
        400,
        "Invalid file type. Allowed: images, PDF, DOC, DOCX, TXT, PPT, XLS, ZIP",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit (enforced server-side for images)
});

module.exports = upload;
