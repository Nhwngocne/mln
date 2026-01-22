import { buildContext } from "./knowledgeService";

export function buildFinalPrompt(question) {
  const context = buildContext(question);

  return `
Bạn là hệ thống hỏi đáp học tập.
Chỉ sử dụng thông tin trong tài liệu bên dưới để trả lời.
Không suy diễn, không mở rộng kiến thức ngoài tài liệu.

Nếu không có thông tin, hãy trả lời:
"Tôi không tìm thấy thông tin trong tài liệu."

=== TÀI LIỆU ===
${context}

=== CÂU HỎI ===
${question}
`;
}
