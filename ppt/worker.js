// worker.js
import { parentPort, workerData } from "worker_threads";
import officegen from "officegen";

function parseContent(content) {
  let pptx = officegen("pptx");
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

  parentPort.postMessage(pptx);
}

function extractText(inputText, tag) {
  const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "g");
  let match;

  if ((match = regex.exec(inputText)) !== null) {
    return match[1];
  }

  return "";
}

parseContent(workerData.content);
