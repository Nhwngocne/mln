export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    try {
      const { prompt } = req.body;
  
      const response = await fetch(
        "https://generative.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
          })
        }
      );
  
      const data = await response.json();
  
      res.status(200).json(data);
    } catch (e) {
      res.status(500).json({ error: "Gemini API error" });
    }
  }
  