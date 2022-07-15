const latex = require("node-latex");
const fs = require("fs");
const nodeWatch = require("node-watch");
const open = require("open");

const BUILD_DIR = `${__dirname}/build`;
const SOURCE_DIR = `${__dirname}/src`;

const INPUT_FILE = "cv.tex";
const OUTPUT_FILE = "cv.pdf";

const INPUT_PATH = `${SOURCE_DIR}/${INPUT_FILE}`;
const OUTPUT_PATH = `${BUILD_DIR}/${OUTPUT_FILE}`;

const makeBuildFolder = () => {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  fs.mkdirSync(BUILD_DIR, { recursive: true });
};

const buildPDF = ({ onFinish } = {}) => {
  const input = fs.createReadStream(INPUT_PATH);
  const output = fs.createWriteStream(OUTPUT_PATH);
  const pdf = latex(input, {
    inputs: SOURCE_DIR,
    precompiled: BUILD_DIR,
  });

  pdf.pipe(output);
  pdf.on("error", (err) => console.error(err));
  pdf.on("finish", () => {
    console.log("PDF generated!");
    if (onFinish) {
      onFinish();
    }
  });
};

const compile = (options = {}) => {
  makeBuildFolder();
  buildPDF(options);
};

const watch = () => {
  const onOpen = () => open(OUTPUT_PATH);

  compile({ onFinish: onOpen });
  nodeWatch(
    SOURCE_DIR,
    {
      recursive: true,
      filter: (file, skip) => {
        if (file.includes(BUILD_DIR)) {
          return skip;
        }
        return true;
      },
    },
    function (_, name) {
      console.log("%s changed.", name);
      buildPDF();
    }
  );
};

const main = () => {
  makeBuildFolder();
  const isWatchMode = process.env.WATCH;
  if (isWatchMode) {
    watch();
  } else {
    compile();
  }
};

main();
