import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
// import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { HumanMessage, AIMessage } from "langchain/schema";
import { getFileExtension } from "./helper.js";

import * as fs from "fs";

export class AiModel {
  constructor() {
    this.chain = null;
    this.chatHistory = new ChatMessageHistory([]);
    this.totalTokens = 0;
  }

  fileUploaded = (filepath) => {
    return fs.existsSync(filepath);
  };

  addHistory = (query, result) => {
    const humanMessage = new HumanMessage(query);
    const aiMessage = new AIMessage(result);
    this.chatHistory.addMessage(humanMessage);
    this.chatHistory.addMessage(aiMessage);
  };

  loadDocument = async (filePath, texts = null) => {
    const model = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      callbacks: [
        {
          handleLLMEnd(output) {            
            this.totalTokens = output?.llmOutput?.tokenUsage?.totalTokens || 0;
          },
        },
      ],
    });

    const docs = texts ?? (await this.getDocument(filePath));

    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );

    const retriever = await vectorStore.asRetriever();

    const memory = new BufferMemory({
      chatHistory: this.chatHistory,
      memoryKey: "chat_history",
      inputKey: "question",
    });

    this.chain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
      memory,
    });

    if (!texts) {
      fs.rmSync(filePath);
    }

    return true;
  };

  getDocument = (filePath) => {
    return new Promise(async (resolve) => {
      const type = getFileExtension(filePath);

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 0,
      });

      if (type === "csv" || type === "pdf") {
        const loader =
          type === "csv" ? new CSVLoader(filePath) : new PDFLoader(filePath);
        const text = await loader.load();
        const docs = await textSplitter.splitDocuments(text);
        resolve(docs);
      }

      if (type === "docx") {
        const loader = new DocxLoader(filePath);
        const text = await loader.load();
        const docs = await textSplitter.splitDocuments(text);
        resolve(docs);
      }

      if (type === "txt") {
        const text = fs.readFileSync(filePath, "utf8");
        const docs = await textSplitter.createDocuments([text]);
        resolve(docs);
      }
    });
  };

  ask = async (query) => {
    if (!query) {
      return "Your Question is Blank";
    }

    if (!this.chain) {
      return "Please upload a document first or wait for the document to process";
    }

    const res = await this.chain.call({
      question: query,
    });

    this.addHistory(query, res.text);

    return { text: res.text, tokenUsage: this.totalTokens };
  };
}
