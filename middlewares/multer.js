import multer from "multer";

const storage = multer.memoryStorage();
const multipleUpload = multer({ storage }).array("file", 14);
export default multipleUpload;
