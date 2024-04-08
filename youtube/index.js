import { YoutubeTranscript } from "youtube-transcript";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { cleanString } from "../helper.js";

export const getTranscription = async (videoIdOrUrl) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0,
    keepSeparator: false,
  });

  const transcripts = await YoutubeTranscript.fetchTranscript(videoIdOrUrl, {
    lang: "en",
  });

  const chunks = [];
  for await (const transcript of transcripts) {
    chunks.push(...(await splitter.splitText(cleanString(transcript.text))));
  }

  const docs = await splitter.createDocuments(chunks);
  return docs;
};

// getTranscription("https://www.youtube.com/watch?v=d0RCDIist_4");
// hello world