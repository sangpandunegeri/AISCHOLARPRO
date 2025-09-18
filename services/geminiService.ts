
import { GoogleGenAI, Type } from "@google/genai";
import { Project, EducationLevel } from '../types';

// IMPORTANT: This key is managed externally and assumed to be available in the environment.
// DO NOT HARDCODE or ask the user for the key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a more user-friendly error message
  // or disable AI features. For this example, we'll log a warning.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

function getAcademicContext(level: EducationLevel): string {
  switch (level) {
    case EducationLevel.S1:
      return "The focus is on applying existing theories and methods to solve a specific, practical problem. The writing should be clear, direct, and demonstrate a solid understanding of the chosen implementation.";
    case EducationLevel.S2:
      return "The focus is on developing or refining a method, model, or theory. The writing requires deeper critical analysis and a significant contribution to the field through development or extension of existing knowledge.";
    case EducationLevel.S3:
      return "The focus is on creating original, groundbreaking research that pushes the boundaries of the field. The writing must be highly rigorous, demonstrate profound theoretical understanding, and present a substantial, defensible, and novel contribution to knowledge.";
  }
}

function getHumanisticStylePrompt(): string {
  return `
    IMPORTANT STYLISTIC INSTRUCTIONS:
    1.  **Emulate Human Thought Patterns:** Write in a style that mimics a human author. Vary sentence length and structure significantly. Use a mix of short, punchy sentences and longer, more complex ones. This is known as "burstiness".
    2.  **Avoid AI Clichés:** Do not use common AI transition phrases like "In conclusion," "Furthermore," "Moreover," "It is important to note that," or "Overall." Instead, integrate transitions naturally.
    3.  **Use Active Voice:** Prefer active voice over passive voice to make the text more engaging and direct.
    4.  **Inject Personality (Subtly):** While maintaining a formal academic tone, write with confidence and conviction. The flow should feel natural, not like a robotic enumeration of facts.
    5.  **Perplexity and Nuance:** The text should have a high degree of perplexity, reflecting the complexity of human writing. Introduce nuanced arguments and avoid oversimplification.
    `;
}

function generatePrompt(project: Project, sectionId: string): { prompt: string; useSearch: boolean } {
  const sectionInfo = project.sections.find(s => s.id === sectionId);
  if (!sectionInfo) throw new Error("Section not found");

  const academicContext = getAcademicContext(project.educationLevel);
  const humanisticStyle = getHumanisticStylePrompt();

  let specificInstructions = '';
  let useSearch = false;
  
  switch (sectionId) {
    case 'title_page':
      specificInstructions = `Generate ONLY the cover page content. Include the title, author's name, student ID (NIM), university, faculty, study program, and year. Format it clearly. Do not add any explanation.`;
      break;
    case 'abstract':
      specificInstructions = `Write a concise abstract of 250-300 words. It must cover the research background, objectives, methodology, key findings, and conclusion. End with 3-5 relevant keywords.`;
      break;
    case 'bibliography':
      specificInstructions = `Based on the entire document's context, especially the literature review and discussion, find at least 15 highly relevant and authoritative academic sources (journals, books, conference papers). Generate a bibliography in strict APA 7th Edition format. The sources must be real and verifiable.`;
      useSearch = true;
      break;
    default:
      specificInstructions = `Generate the content for the section "${sectionInfo.title}". Ensure the content is academically rigorous, well-structured, and directly addresses the section's purpose within the overall document.`;
  }

  const fullPrompt = `
    You are an expert academic writer, acting as a co-author for a student.
    Your task is to draft a section of their scientific paper.

    **Project Context:**
    - Title: "${project.title}"
    - Author: ${project.authorName}
    - Institution: ${project.university}, ${project.faculty}, ${project.studyProgram}
    - Academic Level: ${project.educationLevel} (${academicContext})
    - Year: ${project.year}

    **Task:**
    ${specificInstructions}

    ${humanisticStyle}

    Please generate the content now in Indonesian language.
    `;
  
  return { prompt: fullPrompt.trim(), useSearch };
}

export async function generateSectionContent(project: Project, sectionId:string): Promise<{text: string, groundingChunks?: any[]}> {
    if (!API_KEY) return {text: "API Key not configured. Please set the API_KEY environment variable."};

    const { prompt, useSearch } = generatePrompt(project, sectionId);
    
    const config: any = {};
    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { text: response.text, groundingChunks };
}

export async function proofreadText(text: string): Promise<{ correctedText: string; changes: any[] }> {
    if (!API_KEY) return { correctedText: text, changes: [] };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please act as an expert academic editor. Proofread the following Indonesian text for grammar, spelling, punctuation, and clarity. Provide the corrected text and a list of changes.
        Text to proofread: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    correctedText: { type: Type.STRING },
                    changes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                original: { type: Type.STRING },
                                suggestion: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });

    try {
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse;
    } catch (e) {
        console.error("Failed to parse proofread JSON response:", e);
        return { correctedText: text, changes: [] };
    }
}

export async function paraphraseText(project: Project, text: string, style: string): Promise<string> {
    if (!API_KEY) return text;

    const academicContext = getAcademicContext(project.educationLevel);
    const humanisticStyle = getHumanisticStylePrompt();

    const prompt = `
    You are an expert academic writer. Your task is to paraphrase the following text in a specific style, maintaining the original meaning.

    **Project Context:**
    - Academic Level: ${project.educationLevel} (${academicContext})
    - Title: "${project.title}"

    **Paraphrasing Style:** ${style}

    **Original Text:**
    "${text}"

    ${humanisticStyle}

    Now, generate the paraphrased text in Indonesian language. Output ONLY the paraphrased text.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
}
