const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");
const dir = "./output";

/////////////////////////流合并，特殊文件类型无法合并///////////////////////

const initOutputFile = (directory, fileName) => {
  const fullFileName = path.join(__dirname, directory, fileName);
  if (fs.existsSync(fullFileName)) {
    fs.unlink(fullFileName, () => {
      fs.writeFileSync(fullFileName, "");
    });
  } else {
    fs.writeFileSync(fullFileName, "");
  }
};

const createWriteStream = (directory, fileName) => {
  const fullFileName = path.join(__dirname, directory, fileName);

  const writeStream = fs.createWriteStream(fullFileName, {
    flags: "a", // open file for appending, this file is created if it does not exists;
  });

  return writeStream;
};

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

const write = (list, writeStream) => {
  if (list.length === 0) {
    return console.log("------------------finish---------------");
  }
  const file = list.pop();
  const readStream = fs.createReadStream(file);
  readStream.pipe(writeStream, { end: false });
  readStream.on("end", () => {
    console.log("finish: ", file);
    write(list, writeStream);
  });
  readStream.on("error", (error) => {
    console.error(error);
    writeStream.close();
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
  initOutputFile(dir, outputFileName);
  const writeStream = createWriteStream(dir, outputFileName);
  write(files, writeStream);
})();
