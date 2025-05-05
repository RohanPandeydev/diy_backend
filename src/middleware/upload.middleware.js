const multer = require("multer");

// get file extension
function getFileExtension(filename) {
    return filename.split(".").pop();
}
// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, String(Date.now() + "." + getFileExtension(file.originalname)));
    },
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;
