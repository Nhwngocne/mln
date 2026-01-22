import { knowledgeChunks } from "../data/knowledgeChunks";

export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function matchTopic(topic, question) {
  const keys = topic.split(" ");
  return keys.every(k => question.includes(k));
}

export function buildContext(question) {
  const q = normalize(question);

  const matched = knowledgeChunks
    .filter(chunk => matchTopic(chunk.topic, q))
    .slice(0, 5);

  if (matched.length === 0) return "";

  return matched.map(c => c.content).join("\n\n");
}
