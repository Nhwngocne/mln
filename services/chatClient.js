// ===== DATA =====
import { knowledgeChunks } from "../data/knowledgeChunks.js";

// ===== NORMALIZE =====
function normalize(text) {
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

function buildContext(question) {
  const q = normalize(question);

  const matched = knowledgeChunks
    .filter(chunk => matchTopic(chunk.topic, q))
    .slice(0, 5);

  if (matched.length === 0) return "";

  return matched.map(c => c.content).join("\n\n");
}

// ===== BUILD PROMPT =====
function buildFinalPrompt(question) {
  const context = buildContext(question);

  return `
Bạn là trợ lý học tập Triết học Mác – Lênin.
Chỉ sử dụng thông tin trong tài liệu bên dưới.
Không suy diễn ngoài tài liệu.

Nếu không có thông tin, trả lời:
"Tôi không tìm thấy thông tin trong tài liệu."

=== TÀI LIỆU ===
${context}

=== CÂU HỎI ===
${question}
`;
}

// ===== CALL SERVERLESS =====
export async function chatWithAI(question) {
  const prompt = buildFinalPrompt(question);

  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Không nhận được phản hồi từ AI."
  );
}
