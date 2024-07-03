const fs = require("fs");
const path = require("path");
const { input } = require("@inquirer/prompts");
const { PDFDocument } = require("pdf-lib");

const dir = "./output";

const traverseFolder = (folderPath, files) => {
  const folders = fs.readdirSync(folderPath);
  folders.forEach((fileName) => {
    const filePath = path.join(folderPath, fileName);
    const stats = fs.statSync(filePath);
    console.log("stats: ", filePath, stats.isDirectory());
    if (stats.isDirectory()) {
      traverseFolder(filePath, files);
    } else {
      console.log("filePath: ", filePath);
      if (filePath.indexOf(".pdf") !== -1) {
        files.push(filePath);
      }
    }
  });
};

const write = async (list, outputFileName) => {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < list.length; i++) {
    const filePath = list[i];
    const pdfItem = await PDFDocument.load(fs.readFileSync(filePath));
    for (let j = 0; j < pdfItem.getPageCount(); j++) {
      const [pdfPageItem] = await pdfDoc.copyPages(pdfItem, [j]);
      pdfDoc.addPage(pdfPageItem);
    }
  }
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, dir, outputFileName), pdfBytes);
};

(async () => {
  const outputFileName = await input({
    message: "Please Enter your output file name",
  });

  const files = [];
  traverseFolder(`${__dirname}/input`, files);
  write(files, outputFileName);
})();
