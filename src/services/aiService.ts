import type { GraphDataResponse, GameConfig } from '../types';
import { getConstellationByTheme, getRandomConstellation } from '../data/constellations';

const PROMPT_TEMPLATE = (seedWord: string, maxRelations: number) => `
Você é um gerador de grafos de palavras associadas para um jogo chamado "Interligado".
O objetivo do jogo é adivinhar palavras que estão semanticamente conectadas umas às outras, partindo de uma palavra inicial.

**REGRAS PARA A GERAÇÃO DO GRAFO:**
1. A palavra semente (inicial) é: "${seedWord}".
2. O número total de palavras geradas (incluindo a semente) deve ser no máximo ${maxRelations}.
3. Todas as palavras devem ser em Português do Brasil.
4. Crie associações diretas e significativas. Exemplo: se "Terra" é a palavra, as conexões podem ser "Planeta", "Solo", "Vida", "Natureza".
5. As conexões formam uma rede. A palavra inicial deve ter algumas conexões, que também têm suas próprias conexões.
6. A estrutura deve ser JSON contendo uma propriedade "nodes", que é um array de objetos.
7. Cada objeto DEVE ter:
   {
     "id": "identificador_unico_sem_espacos",
     "word": "Palavra Real com acentos se houver",
     "connections": ["id_de_outra_palavra", "id_de_mais_uma_palavra"]
   }
8. A palavra inicial deve estar na lista (geralmente como o primeiro nó).
9. Mantenha os IDs curtos (word minúscula sem acentos e sem espaços).
10. RETORNE APENAS JSON VÁLIDO. Nenhuma formatação Markdown extra, apenas o JSON puro entre { e }.
`;

/**
 * Modo Offline: Usa constelações pré-construídas
 */
function generateOfflineGraph(seedWord: string): GraphDataResponse {
  const constellation = getConstellationByTheme(seedWord);

  if (!constellation) {
    const randomConstellation = getRandomConstellation();
    return {
      nodes: randomConstellation.nodes
    };
  }

  return {
    nodes: constellation.nodes
  };
}

/**
 * Modo Gemini: Usa Google Gemini API
 */
async function generateGeminiGraph(
  seedWord: string,
  maxRelations: number,
  apiKey: string
): Promise<GraphDataResponse> {
  const prompt = PROMPT_TEMPLATE(seedWord, maxRelations);

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro Gemini API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extrai JSON da resposta
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Gemini não retornou um formato JSON válido.");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString) as GraphDataResponse;

  } catch (error: any) {
    console.error("Erro ao gerar grafo com Gemini:", error);
    throw new Error(error.message || "Falha ao gerar conexões com Gemini.");
  }
}



/**
 * Função principal para gerar o grafo de palavras.
 * 
 * Modos disponíveis:
 * - offline: usa constelações pré-construídas (não depende de internet)
 * - gemini: usa a API do Google Gemini (necessita chave de API)
 */
export async function generateWordGraph(
  seedWord: string,
  maxRelations: number,
  config?: GameConfig
): Promise<GraphDataResponse> {
  const mode = config?.mode || 'offline';

  if (mode === 'gemini') {
    if (!config?.geminiKey) {
      throw new Error("API Key do Gemini é obrigatória para o modo Gemini.");
    }
    return generateGeminiGraph(seedWord, maxRelations, config.geminiKey);
  }

  // Default e modo offline
  return generateOfflineGraph(seedWord);
}
