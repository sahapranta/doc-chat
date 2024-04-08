import PPTX from "nodejs-pptx";
import officegen from "officegen";
import fs from "fs";

// function deleteAllSlides(pptx) {
//   const slides = pptx.slides;

//   for (let i = slides.length - 1; i >= 0; i--) {
//     const rId = slides[i].rId;
//     pptx.dropRel(rId);
//     slides.splice(i, 1);
//   }
// }

async function slide() {
  //   let pptx = officegen("pptx");
  let pptx = new PPTX.Composer();
  await pptx.load("uploads/theme.pptx");
  await pptx.compose(async (pres) => {
    // remove all slides
    console.log(pres.presentation);

    // pres.removeSlide();
    // let newSlide = await pres.addSlide(); // add a new slide

    // newSlide.addText((text) => {
    //   // add some text
    //   text.value("Hello World");
    // });
  });
  //   console.log(Object.keys(pres.presentation.content));
}

function makeSlide() {
  let pptx = officegen("pptx");

  let slide = pptx.makeTitleSlide(
    "Officegen",
    "Example to a PowerPoint document"
  );

  // Pie chart slide example:

  slide = pptx.makeNewSlide();

  slide.name = "Hello World";

  // Change the background color:
  slide.back = "000000";

  // Declare the default color to use on this slide:
  slide.color = "ffffff";

  //   Basic way to add text string:
  slide.addText("Created on the fly using a http server!");

  let out = fs.createWriteStream("example2.pptx");
  pptx.generate(out);
}

export const parseContent = async (content, pptx) => {
  //   let content = fs.readFileSync("content.txt", "utf-8");
  let lines = content.split("[SLIDEBREAK]");

  lines = lines.map((line) => line.trim()).filter((line) => line);
  // console.log('lines', extractText(lines[0], "TITLE"));

  let slide;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("[L_TS]")) {
      slide = pptx.makeSecHeadSlide(
        extractText(lines[i], "TITLE"),
        extractText(lines[i], "SUBTITLE")
      );
    }
    if (lines[i].includes("[L_CS")) {
      slide = pptx.makeObjSlide(
        extractText(lines[i], "TITLE"),
        extractText(lines[i], "CONTENT")
          .split("\n")
          .map((line, i) => ({
            type: "text",
            text: line.trim(),
            options: {
              font_size: i !== 0 ? 16 : 18,
              bullet: i !== 0 ? true : false,
              breakLine: true,
            },
          }))
      );
      //   console.log("lines: " + i, extractText(lines[i], "CONTENT"));
      //   slide.addText(extractText(lines[i], "TITLE"));
      //   slide.addText(extractText(lines[i], "CONTENT"));
    }
    if (lines[i].includes("[L_IS]")) {
      slide = pptx.makeObjSlide(
        extractText(lines[i], "TITLE"),
        extractText(lines[i], "CONTENT")
          .split("\n")
          .map((line, i) => ({
            type: "text",
            text: line.trim(),
            options: {
              font_size: i ? 16 : 18,
              bullet: i ? true : false,
              breakLine: true,
            },
          }))
      );
      //   slide.addText(extractText(lines[i], "CONTENT"));
      //   let image = extractText(text, "IMAGE");
      //   let imageURL = await dlImage(image);
      //   slide.addImage(imageURL);
    }
    if (lines[i].includes("[L_THS]")) {
      slide = pptx.makeTitleSlide(extractText(lines[i], "TITLE"), "THANK YOU");
    }
  }

  let out = fs.createWriteStream("example3.pptx");
};

function extractText(inputText, tag) {
  const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "g");
  let match;

  if ((match = regex.exec(inputText)) !== null) {
    return match[1];
  }

  return "";
}

async function dlImage(img) {
  const url = `https://loremflickr.com/640/480/${img.split(".").at(0)}`;
  const image = await fetch(url);
  const imageBlog = await image.blob();
  //   const imageURL = URL.createObjectURL(imageBlog);
  const imageURL = imageBlog;
  //   blob to buffer
  const buffer = await imageBlog.arrayBuffer();
  //   input source must be valid Stream or Buffer instance
  const buf = Buffer.from(buffer);

  return buf;
}

// parseContent();

// Title Slide: [L_TS]
// Content Slide: [L_CS]
// Image Slide: [L_IS]
// Thanks Slide: [L_THS]
