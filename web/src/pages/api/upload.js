import multer from "multer";
import path from "path";

const uploadDir = path.join(
  process.cwd(),
  "../schedule/schedule/data/uni_data"
);

const desiredFilenames = ["horario", "inscritos_anon", "salas"];

let fileIndex = 0;

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const desiredFilename = desiredFilenames[fileIndex];
    fileIndex = (fileIndex + 1) % desiredFilenames.length;

    const fileExtension = path.extname(file.originalname);
    const finalFilename = `${desiredFilename}${fileExtension}`;

    cb(null, finalFilename);
  },
});

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed."));
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Something went wrong" });
    }

    return res.status(200).json({ message: "File received" });
  });
};
