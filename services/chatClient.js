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

// ===== EXTRACT KEYWORDS =====
// Loại bỏ các từ không quan trọng
function extractKeywords(text) {
  const stopWords = [
    "la", "gi", "theo", "thi", "cua", "va", "trong", "voi", "nhu", "the", "nao",
    "co", "duoc", "ra", "den", "khi", "ma", "hay", "se", "da", "roi", "chu",
    "biet", "hieu", "noi", "ve", "cho", "moi", "tat", "ca", "nhung", "cac",
    "mot", "hai", "ba", "do", "ay", "nay", "kia", "sao", "dau", "di", "len",
    "xuong", "vao", "ra", "tu", "ban", "minh", "toi", "ho", "no", "ai"
  ];
  
  const normalized = normalize(text);
  const words = normalized.split(/\s+/);
  
  return words.filter(w => w.length > 2 && !stopWords.includes(w));
}

// ===== IMPROVED MATCHING =====
// Tìm kiếm linh hoạt hơn - chỉ cần match 50% keywords
function matchContent(chunk, keywords) {
  const topicNormalized = normalize(chunk.topic);
  const contentNormalized = normalize(chunk.content);
  
  const matchCount = keywords.filter(keyword => 
    topicNormalized.includes(keyword) || contentNormalized.includes(keyword)
  ).length;
  
  // Trả về điểm số để sort
  return matchCount;
}

// ===== BUILD CONTEXT =====
function buildContext(question) {
  const keywords = extractKeywords(question);
  
  if (keywords.length === 0) return "";
  
  // Tính điểm cho mỗi chunk
  const scored = knowledgeChunks.map(chunk => ({
    chunk,
    score: matchContent(chunk, keywords)
  }));
  
  // Sắp xếp theo điểm giảm dần
  scored.sort((a, b) => b.score - a.score);
  
  // Lấy top 5 chunks có điểm > 0
  const matched = scored
    .filter(item => item.score > 0)
    .slice(0, 5)
    .map(item => item.chunk);
  
  if (matched.length === 0) return "";
  
  return matched.map(c => c.content).join("\n\n");
}

// ===== BUILD PROMPT =====
function buildFinalPrompt(question) {
  const context = buildContext(question);
  
  if (!context) {
    return `
Bạn là trợ lý học tập Triết học Mác – Lênin.

CÂU HỎI: ${question}

Tôi không tìm thấy thông tin liên quan trong tài liệu. 
Bạn có thể hỏi lại bằng cách khác hoặc hỏi về các chủ đề:
- Giai cấp (định nghĩa, nguồn gốc, kết cấu)
- Đấu tranh giai cấp (bản chất, nguyên nhân, vai trò, hình thức)
- Dân tộc (khái niệm, nguồn gốc)
- Quan hệ giai cấp và dân tộc
- Thực tiễn Việt Nam
`;
  }
  
  return `
Bạn là trợ lý học tập Triết học Mác – Lênin.
Hãy trả lời câu hỏi dựa trên thông tin trong tài liệu dưới đây.
Trả lời ngắn gọn, rõ ràng và chính xác.
Nếu tài liệu không đủ thông tin, hãy nói rõ điều đó.

=== TÀI LIỆU ===
${context}

=== CÂU HỎI ===
${question}

=== YÊU CẦU ===
- Trả lời bằng tiếng Việt
- Dựa vào tài liệu trên
- Ngắn gọn, dễ hiểu
`;
}

// ===== CALL SERVERLESS =====
export async function chatWithAI(question) {
  const prompt = buildFinalPrompt(question);
  
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("API Error:", errorData);
      return `⚠️ Lỗi từ server: ${errorData.error || "Không xác định"}`;
    }

    const data = await res.json();
    
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không nhận được phản hồi từ AI."
    );
    
  } catch (err) {
    console.error("Client error:", err);
    return "⚠️ Lỗi kết nối tới AI. Vui lòng thử lại.";
  }
}