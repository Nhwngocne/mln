import { useState } from "react";
import { buildFinalPrompt } from "../services/ragService";

export default function ChatPage() {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");

  async function ask() {
    const prompt = buildFinalPrompt(q);

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    setAns(data.candidates[0].content.parts[0].text);
  }

  return (
    <div>
      <textarea value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={ask}>Hỏi</button>
      <pre>{ans}</pre>
    </div>
  );
}
