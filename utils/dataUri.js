import DataURIParser from "datauri/parser.js";
import path from "path";
const getDataUri = (files) => {

  const parser = new DataURIParser();
  const dataUris = [];
  files.forEach((file) => {
    const extName = path.extname(file.originalname).toString();
    const dataUri = parser.format(extName, file.buffer);
    dataUris.push(dataUri);
  });

  return dataUris;
};
export default getDataUri;
