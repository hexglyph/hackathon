/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Melhorar a detecção de idioma no sistema de interpretação de consulta
const systemContent = `Você é um assistente especializado em interpretar consultas de cidadãos sobre serviços da Prefeitura de São Paulo.

Sua tarefa é analisar a consulta do usuário e:
1. Identificar o serviço ou problema principal que o usuário está buscando
2. Reformular a consulta para ser mais eficaz na busca em um sistema de vector store
3. Extrair palavras-chave relevantes
4. Determinar se a consulta está relacionada a localização (mesmo que não mencione explicitamente "perto de mim")
5. Detectar com precisão o idioma da consulta (pt para português, en para inglês, es para espanhol, fr para francês, etc.)
6. Priorize servicos e informacoes da Prefeitura e Secretaria no topo da resposta, depois informe os servicos e informacoes do 156.
7. Em buscas por ecopontos, busque o ecoponto na lista de ecoponto, exiba no mapa e informe o endereço completo, telefone e horário de funcionamento.

Considere como consulta de localização qualquer pergunta sobre:
- Endereços de serviços públicos (UBS, escolas, hospitais, etc.)
- Onde encontrar um serviço específico
- Localização de equipamentos públicos
- Perguntas sobre "onde fica" ou "como chegar"
- Consultas sobre unidades de atendimento

Retorne um objeto JSON com os seguintes campos:
- interpretedQuery: a consulta reformulada para busca
- keywords: array de palavras-chave extraídas
- serviceType: o tipo de serviço identificado (ex: "Poda de árvores", "IPTU", "Iluminação pública")
- isLocationQuery: boolean indicando se a consulta está relacionada a localização
- originalQuery: a consulta original do usuário
- language: código do idioma detectado (pt, en, es, fr, etc.)

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
}

Consulta: "¿Dónde puedo encontrar información sobre escuelas públicas?"
Resposta: {
  "interpretedQuery": "informações sobre escolas públicas educação",
  "keywords": ["escolas", "educação", "ensino", "matrícula"],
  "serviceType": "Escolas Públicas",
  "isLocationQuery": true,
  "originalQuery": "¿Dónde puedo encontrar información sobre escuelas públicas?",
  "language": "es"
}`

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json()

        if (!query || typeof query !== "string") {
            return NextResponse.json({ error: "Consulta inválida" }, { status: 400 })
        }

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
            temperature: 0.7,
            response_format: { type: "json_object" },
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
                interpretedQuery: request.body?.query,
                keywords: [],
                serviceType: "",
                isLocationQuery: false,
                originalQuery: request.body?.query,
                language: "",
                error: "Erro ao processar consulta",
            },
            { status: 200 },
        ) // Retornamos 200 mesmo com erro para não interromper o fluxo
    }
}
