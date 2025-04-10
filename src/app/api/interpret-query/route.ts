import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"
import { createHash } from "crypto"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Modificar o conteúdo do sistema para incluir detecção de idioma
const systemContent = `Você é um assistente especializado em interpretar consultas de cidadãos sobre serviços da Prefeitura de São Paulo.
          
Sua tarefa é analisar a consulta do usuário e:
1. Identificar o serviço ou problema principal que o usuário está buscando
2. Reformular a consulta para ser mais eficaz na busca em um sistema de vector store
3. Extrair palavras-chave relevantes
4. Determinar se a consulta está relacionada a localização
5. Detectar o idioma da consulta (pt para português, en para inglês, es para espanhol, etc.)
          
Retorne um objeto JSON com os seguintes campos:
- interpretedQuery: a consulta reformulada para busca
- keywords: array de palavras-chave extraídas
- serviceType: o tipo de serviço identificado (ex: "Poda de árvores", "IPTU", "Iluminação pública")
- isLocationQuery: boolean indicando se a consulta está relacionada a localização
- originalQuery: a consulta original do usuário
- language: código do idioma detectado (pt, en, es, etc.)
          
Exemplos:
          
Consulta: "Preciso podar uma árvore na minha rua"
Resposta: {
  "interpretedQuery": "serviço poda de árvores via pública",
  "keywords": ["poda", "árvore", "rua", "via pública", "zeladoria"],
  "serviceType": "Poda de árvores",
  "isLocationQuery": false,
  "originalQuery": "Preciso podar uma árvore na minha rua",
  "language": "pt"
}
          
Consulta: "Onde tem UBS perto de mim?"
Resposta: {
  "interpretedQuery": "unidade básica de saúde UBS localização",
  "keywords": ["UBS", "unidade básica de saúde", "posto de saúde", "atendimento médico"],
  "serviceType": "Unidade Básica de Saúde",
  "isLocationQuery": true,
  "originalQuery": "Onde tem UBS perto de mim?",
  "language": "pt"
}

Consulta: "Where can I find information about IPTU?"
Resposta: {
  "interpretedQuery": "informações sobre IPTU imposto predial territorial urbano",
  "keywords": ["IPTU", "imposto", "imóvel", "propriedade", "tributo"],
  "serviceType": "Informações sobre IPTU",
  "isLocationQuery": false,
  "originalQuery": "Where can I find information about IPTU?",
  "language": "en"
}`

// Função para gerar uma chave de cache baseada na consulta
function generateCacheKey(query: string): string {
    return createHash("sha256").update(query).digest("hex").substring(0, 32)
}

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Consulta inválida" }, { status: 400 })
        }

        // Gerar uma chave de cache baseada na consulta
        const cacheKey = generateCacheKey(query)

        // Substituir o conteúdo do sistema na chamada da API
        const completion = await azureOpenAI.chat.completions.create({
            model: "4o-mini",
            messages: [
                {
                    role: "system",
                    content: systemContent,
                },
                {
                    role: "user",
                    content: query,
                },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" }
        })

        // Extrair a resposta
        const content = completion.choices[0].message.content

        if (!content) {
            throw new Error("Não foi possível interpretar a consulta")
        }

        // Parsear o JSON da resposta
        const interpretedQuery = JSON.parse(content)

        return NextResponse.json(interpretedQuery)
    } catch (error) {
        console.error("Erro ao interpretar consulta:", error)

        // Em caso de erro, retornar a consulta original sem processamento
        return NextResponse.json(
            {
                interpretedQuery: request.body.query,
                keywords: [],
                serviceType: "",
                isLocationQuery: false,
                originalQuery: request.body.query,
                language: "",
                error: "Erro ao processar consulta",
            },
            { status: 200 },
        ) // Retornamos 200 mesmo com erro para não interromper o fluxo
    }
}