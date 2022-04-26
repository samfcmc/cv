const latex = require("node-latex");
const fs = require("fs");
const nodeWatch = require("node-watch");
const BUILD_DIR = `${__dirname}/build`;

const INPUT_FILE = "cv.tex";
const OUTPUT_FILE = "cv.pdf";

const OUTPUT_PATH = `${BUILD_DIR}/${OUTPUT_FILE}`;

const makeBuildFolder = () => {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  fs.mkdirSync(BUILD_DIR, { recursive: true });
};

const buildPDF = () => {
  const input = fs.createReadStream(INPUT_FILE);
  const output = fs.createWriteStream(OUTPUT_PATH);
  const pdf = latex(input, {
    inputs: __dirname,
    precompiled: BUILD_DIR,
  });

  pdf.pipe(output);
  pdf.on("error", (err) => console.error(err));
  pdf.on("finish", () => console.log("PDF generated!"));
};

const compile = () => {
  makeBuildFolder();
  buildPDF();
};

const watch = () => {
  compile();
  nodeWatch(
    __dirname,
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
