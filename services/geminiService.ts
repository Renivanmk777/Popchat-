
import { GoogleGenAI, GenerateContentParameters, Type } from "@google/genai";

export async function getChatResponse(
  message: string, 
  personality: string, 
  history: { text: string; sender: 'me' | 'other' }[],
  imageAttachment?: { data: string; mimeType: string }
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Erro: API Key não configurada.";

  const ai = new GoogleGenAI({ apiKey });
  
  const context = history
    .slice(-10) 
    .map(m => `${m.sender === 'me' ? 'Usuário' : 'Você'}: ${m.text}`)
    .join('\n');

  const textPart = {
    text: `${personality}\n\nContexto da conversa:\n${context}\nUsuário: ${message}\nVocê:`
  };

  const parts: any[] = [textPart];

  if (imageAttachment) {
    parts.push({
      inlineData: {
        data: imageAttachment.data.split(',')[1] || imageAttachment.data,
        mimeType: imageAttachment.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
    });
    
    return response.text || "Desculpe, não consegui processar sua mensagem.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao tentar responder. Por favor, tente novamente.";
  }
}

/**
 * Gera personas baseadas na localização atual para a função "Pessoas Próximas"
 */
export async function getNearbyPeople(lat: number, lng: number): Promise<any[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Estou nas coordenadas ${lat}, ${lng}. 
  Identifique brevemente o bairro ou cidade e crie 5 personas de usuários anônimos "próximos" de forma criativa.
  Retorne APENAS um JSON válido no formato abaixo, sem blocos de código markdown:
  [
    {
      "name": "Nome Criativo",
      "username": "@id_unico",
      "bio": "Uma bio curta e interessante",
      "distance": "distância entre 100m e 5km",
      "personality": "instrução de sistema para este bot"
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // IMPORTANTE: responseMimeType e responseSchema NÃO SÃO PERMITIDOS ao usar googleMaps
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    let text = response.text || "[]";
    // Limpa possíveis blocos de código markdown que a IA possa retornar
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Nearby error:", error);
    // Fallback simples se falhar
    return [
      { name: "Viajante Urbano", username: "@urban_traveler", bio: "Explorando a cidade.", distance: "450m", personality: "Amigável e conhecedor da região." },
      { name: "Café Lover", username: "@coffee_enthusiast", bio: "Sempre procurando o melhor espresso.", distance: "1.2km", personality: "Sofisticado e viciado em cafeína." },
      { name: "Coder Noturno", username: "@night_coder", bio: "Onde tem Wi-Fi e café, eu estou.", distance: "800m", personality: "Introvertido e focado em tecnologia." },
      { name: "Gamer Retro", username: "@pixel_master", bio: "Vida em 8 bits.", distance: "2.1km", personality: "Nostálgico e competitivo." },
      { name: "Fitness Guru", username: "@fit_life", bio: "Correndo pelo bairro.", distance: "3.5km", personality: "Energético e motivador." }
    ];
  }
}

export async function verifyReceipt(imageData: string, mimeType: string): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { success: false, message: "API Key não encontrada." };

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Analise este comprovante Pix. Valor: R$ 9,90. Destinatário: CNPJ 60.062.159/0001-62 ou "PopChat".
  Retorne JSON: {"valid": boolean, "reason": "string"}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: imageData.split(',')[1] || imageData, mimeType } }
        ]
      },
      // Fix: responseMimeType is not supported for gemini-3-pro-image-preview (nano banana series)
      config: { }
    });
    
    let text = response.text || '{"valid": false}';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(text);
    
    return { success: result.valid === true, message: result.reason || "Processado." };
  } catch (error: any) {
    console.error("Receipt Verification Error:", error);
    return { success: false, message: "Erro na verificação." };
  }
}
