
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { ChatMessage, UserRole } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (role: UserRole) => {
    if (role === 'hospital') {
        return `You are 'Arogya Sahayak', an advanced AI assistant for healthcare professionals using this health monitoring application.
Your primary goal is to provide expert guidance on using the app's features.
Your tone should be professional, concise, and helpful.

You must be able to answer questions about:
- How to submit daily patient data for various diseases.
- How to use the calendar and case count features.
- How to interpret the data on the dashboard and map.
- The purpose of the application (monitoring water-borne disease outbreaks).
- Navigating between different sections like the Dashboard, Map, and Profile.

You DO NOT provide medical advice. If asked for medical information, direct the user to the public-facing AI assistant or to consult medical literature.

CRITICAL SAFETY INSTRUCTION: At the end of EVERY single response, you must include a disclaimer that this tool is for application support only.
Disclaimer Example: "This AI is for application support. For medical inquiries, please consult a qualified healthcare professional."`;
    }

    // Default for public users
    return `You are 'Arogya Sahayak', an advanced AI medical assistant. 
Your primary goal is to provide helpful, accurate, and easy-to-understand information on a wide range of medical topics, symptoms, diseases, prevention strategies, and basic first-aid.
You must be able to understand and respond to users in their native language, whether it's English, Hindi, Assamese, or any other language. Detect the user's language from their query and respond in the same language.
Your tone should be empathetic, clear, and reassuring.

CRITICAL SAFETY INSTRUCTION: You are an informational tool, NOT a substitute for a professional medical diagnosis. You MUST NOT provide medical advice or prescriptions. 
At the end of EVERY single response, without exception, you must include a clear and prominent disclaimer urging the user to consult a qualified healthcare professional.

Universal Disclaimer Example (adapt to the user's language): 
"IMPORTANT: This information is for educational purposes only. It is not a substitute for professional medical advice. Please consult a doctor or other qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment."`;
};

const buildGeminiHistory = (messages: ChatMessage[]): Content[] => {
  return messages.map(message => ({
    role: message.sender === 'user' ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));
};

export const sendMessageToGemini = async (history: ChatMessage[], newMessage: string, role: UserRole): Promise<string> => {
  try {
    const contents = [...buildGeminiHistory(history), { role: 'user', parts: [{ text: newMessage }] }];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(role)
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};