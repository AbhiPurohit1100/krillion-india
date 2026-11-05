import { LLMAnswerValidation, LLMAnswerValidationSchema, LLMCandidateQuestion, LLMQuestionGenerationBatchSchema } from "./schemas";

export interface AIProvider {
  validateAnswer(questionText: string, rawAnswer: string): Promise<LLMAnswerValidation | null>;
  generateCandidateQuestions(): Promise<LLMCandidateQuestion[]>;
}

export class GroqClient implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string = "https://api.groq.com/openai/v1/chat/completions";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    this.model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  }

  private async callWithRetry(messages: any[], maxRetries: number = 3): Promise<any> {
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY is not configured. AI requests will be bypassed.");
      return null;
    }

    let attempt = 0;
    let delay = 1000;

    while (attempt < maxRetries) {
      try {
        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (response.status === 429 || response.status >= 500) {
          console.warn(`Groq API returned ${response.status}. Retrying in ${delay}ms... (attempt ${attempt + 1})`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          attempt++;
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq API error (${response.status}): ${errText}`);
        }

        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        return JSON.parse(content);
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    return null;
  }

  /**
   * Resolves previously unseen player answers against the trivia question.
   */
  async validateAnswer(questionText: string, rawAnswer: string): Promise<LLMAnswerValidation | null> {
    const prompt = `
You are an expert Indian trivia arbitrator.
Verify if the candidate answer is a factually valid answer to the given Indian trivia question.

Question: "${questionText}"
Candidate Answer: "${rawAnswer}"

Output JSON matching this exact structure:
{
  "is_valid": true or false,
  "canonical_name": "Official canonical entity name if valid, else empty string",
  "entity_type": "actor / cricketer / city / state / sweet / tv_show / movie / etc",
  "aliases": ["common nickname", "alternate spelling"],
  "confidence": 0.0 to 1.0,
  "explanation": "Concise factual reason why it is valid or invalid",
  "sources": [{"title": "Verified source or reference", "url": ""}]
}
`;

    try {
      const data = await this.callWithRetry([
        { role: "system", content: "You are a precise, factual Indian cultural and trivia expert. Respond ONLY in valid JSON." },
        { role: "user", content: prompt },
      ]);

      if (!data) return null;

      const parsed = LLMAnswerValidationSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("LLM response did not match Zod schema:", parsed.error);
        return null;
      }
    } catch (e) {
      console.error("Groq answer validation failed:", e);
      return null;
    }
  }

  /**
   * Generates 3 Indian candidate trivia questions daily with accepted answers and sources.
   */
  async generateCandidateQuestions(): Promise<LLMCandidateQuestion[]> {
    const prompt = `
Generate 3 distinct, high-quality, culturally engaging India-focused trivia questions for a daily rarity game.
Categories to include: Bollywood & Cinema, Cricket & Sports, Indian History, Geography, Food, 90s/2000s Nostalgia, or Regional Culture.

Each question must have:
- An unambiguous, clear question prompt.
- At least 4-8 accepted canonical answers with prior frequency estimations (0.01 for rare, 0.40 for common) and aliases.
- Verified factual explanation.
- No invented sources.

Respond with JSON adhering to:
{
  "candidates": [
    {
      "question": "Name an Indian...",
      "category": "Bollywood",
      "subcategory": "Directors",
      "difficulty": "medium",
      "language": "en",
      "accepted_answers": [
        {
          "canonical_name": "Name",
          "prior_frequency": 0.15,
          "aliases": ["Alias 1", "Alias 2"]
        }
      ],
      "explanation": "Explanation...",
      "sources": [{"title": "Verified Source", "url": "https://..."}]
    }
  ]
}
`;

    try {
      const data = await this.callWithRetry([
        { role: "system", content: "You are an elite Indian trivia curator and quizmaster. Return exactly 3 candidate questions in JSON." },
        { role: "user", content: prompt },
      ]);

      if (!data) return [];

      const parsed = LLMQuestionGenerationBatchSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data.candidates;
      } else {
        console.warn("Generated questions did not match Zod schema:", parsed.error);
        return [];
      }
    } catch (e) {
      console.error("Groq candidate question generation failed:", e);
      return [];
    }
  }
}

export const groqClient = new GroqClient();

