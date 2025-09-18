import { Buffer } from "buffer";

export function getImageSrc(file) {
  if (!file || !file.data || !file.data.data) return null;

  try {
    const base64String = Buffer.from(file.data.data).toString("base64");
    return `data:${file.contentType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting file to base64:", error);
    return null;
  }
}