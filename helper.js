import { extname } from "path";

export const getFileExtension = (filename) => extname(filename).slice(1);

export function cleanString(text) {
  text = text.replace(/\\/g, "");
  text = text.replace(/#/g, " ");
  text = text.replace(/\. \./g, ".");
  text = text.replace(/\s\s+/g, " ");
  text = text.replace(/(\r\n|\n|\r)/gm, " ");

  return text.trim();
}

/**
 * @params url String
 * @return String|Boolean
 */
export function isYouTubeUrl(url) {
  var p =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  if (url.match(p)) {
    return url.match(p)[1];
  }
  return false;
}
