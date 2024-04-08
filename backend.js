// import fetch from 'node-fetch';
import { fetch } from 'undici';
import * as dotenv from "dotenv";
dotenv.config();
import Cache from "./cache.js";

let cache = new Cache();
const CACHE_TIME = 86400000; // 1000 * 60 * 60 * 24 (ms * sec * min * hour)
const BASE_URL = process.env.BACK_URL || "https://web.aiapp.gg/ai-tools";

const OPTIONS = (token, extra = {}) => {
  return {
    method: "POST",    
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...extra,
  };
};

export const authenticate = async (token) => {
  if (cache.has(token)) return cache.get(token);

  try {
    const res = await fetch(`${BASE_URL}/get-user`, OPTIONS(token));
    const data = await res.json();

    const dataToSend = { user: data?.user, error: null };
    cache.set(token, dataToSend, CACHE_TIME);

    return dataToSend;
  } catch (error) {
    return { user: null, error };
  }
};

export const verifyApiUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication Token Required" });
  }

  const { user, error } = await authenticate(token);

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  if (!user) {
    return res.status(401).json({ message: "Authentication Failed" });
  }

  req.user = user;
  next();
};

export const verifySocketUser = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication Token Required"));
  }

  const { user, error } = await authenticate(token);

  if (error) {
    return next(new Error(error?.message || "Authentication Failed"));
  }

  if (!user) {
    return next(new Error("Authentication Failed"));
  }

  socket.user = user;
  socket.token = token;
  next();
};

const checker = async (token, words, url) => {
  try {
    const res = await fetch(
      `${BASE_URL}/${url}`,
      OPTIONS(token, { body: JSON.stringify({ words }) })
    );
    const data = await res.json();
    return { balance: data?.balance, error: null };
  } catch (error) {
    return { balance: null, error };
  }
};

export const checkBalance = (token, words) => {
  return checker(token, words, "check-balance");
};

export const deductBalance = (token, words) => {
  return checker(token, words, "process-words");
};
