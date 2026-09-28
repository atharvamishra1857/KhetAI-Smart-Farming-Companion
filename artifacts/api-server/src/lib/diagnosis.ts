import { logger } from "./logger";

export type Diagnosis = {
  crop: string;
  disease: string;
  status: "healthy" | "attention" | "critical";
  confidence: number;
  summary: string;
  treatment: string[];
  prevention: string[];
};

const diagnosisPrompt = `You are KhetAI, an agricultural advisor for small and marginal farmers in India.
Analyze the supplied crop or leaf photo carefully. Return ONLY valid JSON with this exact shape:
{"crop":"string","disease":"string","status":"healthy|attention|critical","confidence":0.0,"summary":"string","treatment":["string"],"prevention":["string"]}
Use practical, conservative advice. If the image is unclear or not a plant, say so in disease and summary, set status to attention, and keep confidence below 0.5. Confidence must be between 0 and 1. Do not recommend unsafe pesticide dosages.`;

function parseDiagnosis(text: string): Diagnosis {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Gemini returned no JSON diagnosis");
  const value = JSON.parse(text.slice(start, end + 1)) as Partial<Diagnosis>;
  const status = value.status === "healthy" || value.status === "critical" ? value.status : "attention";
  return {
    crop: typeof value.crop === "string" && value.crop.trim() ? value.crop : "Unknown crop",
    disease: typeof value.disease === "string" && value.disease.trim() ? value.disease : "Unable to identify",
    status,
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
    summary: typeof value.summary === "string" ? value.summary : "The image needs a closer review.",
    treatment: Array.isArray(value.treatment) ? value.treatment.filter((item): item is string => typeof item === "string") : [],
    prevention: Array.isArray(value.prevention) ? value.prevention.filter((item): item is string => typeof item === "string") : [],
  };
}

export async function diagnoseCrop(imageData: string, cropHint?: string): Promise<Diagnosis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("imageData must be a base64 data URL");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${diagnosisPrompt}${cropHint ? `\nFarmer crop hint: ${cropHint}` : ""}` },
              { inline_data: { mime_type: match[1], data: match[2] } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      }),
      signal: AbortSignal.timeout(30000),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    logger.warn({ status: response.status, providerMessage: message.slice(0, 300) }, "Gemini diagnosis failed");
    throw new Error(`Gemini diagnosis failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  return parseDiagnosis(text);
}