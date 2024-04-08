import multer from "multer";
import path from "path";
import { getFileExtension } from "./helper.js";
import { nanoid } from "nanoid";

export const whiteList = {
  csv: "text/csv|application/vnd.ms-excel",
  pdf: "application/pdf",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const isMimeAllowed = (type, mimeType) => {
  if (!whiteList[type]) return false;
  return whiteList[type].split("|").includes(mimeType);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filePath = path.join(path.resolve(), "uploads");
    cb(null, filePath);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${nanoid(10)}${fileExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    isMimeAllowed(getFileExtension(file.originalname), file.mimetype) && // check file type
    Object.keys(whiteList).includes(getFileExtension(file.originalname)) // check file extension
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    let msg = `Only .${Object.keys(whiteList)
      .join(", .")
      .toUpperCase()} formats are allowed!`;
    return cb(new Error(msg));
  }
};

export const upload = multer({
  storage,
  fileFilter,
});
