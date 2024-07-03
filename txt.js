const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");
const dir = "./output";

const traverseFolder = (folderPath, fileType, files) => {
  const folders = fs.readdirSync(folderPath);
  folders.forEach((fileName) => {
    const filePath = path.join(folderPath, fileName);
    const stats = fs.statSync(filePath);
    console.log("stats: ", filePath, stats.isDirectory());
    if (stats.isDirectory()) {
      traverseFolder(filePath, fileType, files);
    } else {
      console.log("filePath: ", filePath);
      if (filePath.indexOf(`.${fileType}`) !== -1) {
        files.push(filePath);
      }
    }
  });
};

const write = (list, outputFileName) => {
  const fullFileName = path.join(__dirname, dir, outputFileName);
  const files = list.map((item) => fs.readFileSync(item));
  fs.writeFile(fullFileName, Buffer.concat(files), (err) => {
    if (err) {
      return console.error("write error: ", err);
    }
  });
};

(async () => {
  const outputFileName = await input({
    message: "Please Enter your output file name",
  });
  const fileType =
    outputFileName.split(".")[outputFileName.split(".").length - 1];
  const files = [];
  traverseFolder(`${__dirname}/input`, fileType, files);
  write(files, outputFileName);
})();
