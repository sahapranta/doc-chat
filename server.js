import express from "express";
import path from "path";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import { AiModel } from "./chatbot.js";
import { isYouTubeUrl } from "./helper.js";
import { getTranscription } from "./youtube/index.js";

import officegen from "officegen";

import {
  verifyApiUser,
  verifySocketUser,
  checkBalance,
  deductBalance,
} from "./backend.js";

import { upload } from "./multerConfig.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { cors: { origin: "*" } });

io.use(verifySocketUser);

io.on("connection", (socket) => {
  const model = new AiModel();

  socket.emit(
    "bot-reply",
    `Hi! ${socket.user.name}, Please Upload Your document.`
  );

  setTimeout(() => socket.emit("upload-file", "show"), 2000);

  socket.on("question", async (msg) => {
    if (!msg) {
      return socket.emit("bot-reply", "Your Question is Blank");
    }

    if (!model.chain) {
      return socket.emit(
        "bot-reply",
        "Please upload a document first or wait for the document to process"
      );
    }

    let words = msg.split(" ").length;
    const { balance, error } = await checkBalance(socket.token, words);

    if (error) {
      return socket.emit("bot-reply", error?.message || "Something went wrong");
    } else if (balance !== null) {
      const res = await model.ask(msg);

      socket.emit("bot-reply", res.text);

      if (res.text) {
        words += res.text
          .trim()
          .split(" ")
          .filter((item) => item && item.length > 1).length;
      }

      const { balance, error } = await deductBalance(socket.token, words);

      if (balance !== null && !error) {
        socket.emit("update-balance", balance);
      }
    }
  });

  socket.on("file-uploaded", async (filename) => {
    socket.emit("bot-reply", "Your document is being processed.");
    const filePath = path.join("uploads", filename);
    if (model.fileUploaded(filePath)) {
      await model.loadDocument(filePath);
      socket.emit("upload-file", "hide");
      socket
        .timeout(3000)
        .emit(
          "bot-reply",
          "SUCCESS, You can ask me questions from your document."
        );
    } else {
      socket.emit(
        "bot-reply",
        "Please upload a document first or wait for the document to process"
      );
    }
  });
});

// YouTube namespace
const youTube = io.of("/youtube");

youTube.use(verifySocketUser);

youTube.on("connection", (socket) => {
  socket.emit(
    "bot-reply",
    `Hi! ${socket.user.name}, Please give a valid YouTube video url.`
  );

  const model = new AiModel();

  socket.on("question", async (msg) => {
    if (!msg) return socket.emit("bot-reply", "Your Question is Blank");

    let url = isYouTubeUrl(msg);

    let transcription = "";
    if (url) {
      socket.emit("bot-reply", "Your link is being processed.");
      socket.emit("bot-loading", "loading...");
      try {
        transcription = await getTranscription(url);
        await model.loadDocument("", transcription);
        return socket.emit("bot-reply", "I am ready to talk, ask me");
      } catch (error) {
        console.log(error);
        return socket.emit(
          "bot-reply",
          "The Link is protected, we cannot help."
        );
      }
    }

    if (!model.chain) {
      return socket.emit(
        "bot-reply",
        "Please give me an youtube link, to start talking."
      );
    }

    if (model.chain) {
      let words = msg.split(" ").length;
      const { balance, error } = await checkBalance(socket.token, words);
      if (error) {
        return socket.emit(
          "bot-reply",
          error?.message || "Something went wrong"
        );
      } else if (balance !== null) {
        const res = await model.ask(msg);

        socket.emit("bot-reply", res.text);

        if (res.text) {
          words += res.text
            .trim()
            .split(" ")
            .filter((item) => item && item.length > 1).length;
        }

        const { balance, error } = await deductBalance(socket.token, words);

        if (balance !== null && !error) {
          socket.emit("update-balance", balance);
        }
      }
    }
  });
});

const PORT = 3000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let origins = process.env.ALLOWED_ORIGINS;
let allowedOrigins = origins.split(",");

app.use(
  cors({
    origin: "*",
    // credentials: true,
    // origin: function (origin, callback) {
    //   if (!origin) return callback(null, true);
    //   if (allowedOrigins.indexOf(origin) === -1) {
    //     var msg =
    //       "The CORS policy for this site does not " +
    //       "allow access from the specified Origin.";
    //     return callback(new Error(msg), false);
    //   }
    //   return callback(null, true);
    // },
  })
);

app.post("/upload", verifyApiUser, upload.single("document"), (req, res) => {
  const filename = req.file.filename;
  const response = {
    message: "Uploaded successfully",
    filename: filename,
    success: true,
  };

  res.status(200).send(response);
});

app.post("/generatePpt", verifyApiUser, async (req, res) => {
  let content = req.body.content;

  if (!content && !Array.isArray(content)) {
    return res.status(400).json({ message: "provided content is not valid" });
  }

  let pptx = officegen("pptx");

  let slide;

  content.forEach((element) => {
    switch (element.type) {
      case "title":
        slide = pptx.makeSecHeadSlide(element.title, element.subtitle);
        break;

      case "thanks":
        slide = pptx.makeTitleSlide(element.title, "Any Question?");
        break;

      case "content":
        slide = pptx.makeObjSlide(
          element.title,
          element.content.split("\n").map((line, i) => ({
            type: "text",
            text: line.trim(),
            options: {
              font_size: i !== 0 ? 16 : 18,
              bullet: i !== 0 ? true : false,
              breakLine: true,
            },
          }))
        );
        break;

      case "image":
        slide = pptx.makeObjSlide(element.title, [
          {
            type: "text",
            text: element.content,
            options: {
              font_size: 18,
              bullet: false,
              breakLine: true,
            },
          },
          {
            type: "text",
            text: element.image,
            options: {
              font_size: 18,
              bullet: false,
              breakLine: true,
            },
          },
        ]);
        break;

      default:
        // slide = pptx.makeNewSlide()
        // slide.addText(element.title)
        break;
    }
  });

  res.writeHead(200, {
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "Content-disposition": "attachment filename=output.pptx",
  });

  pptx.on("error", function (err) {
    res.end(err);
  });
  // Catch response errors:
  res.on("error", function (err) {
    res.end(err);
  });

  res.on("finish", function () {
    res.end();
  });

  pptx.generate(res);
});

console.log(`Listening on http://127.0.0.1:${PORT}`);
httpServer.listen(PORT);
