import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"
import { createHash } from "crypto"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

// Função para gerar uma chave de cache baseada na consulta
function generateCacheKey(text: string): string {
    return createHash("sha256").update(text).digest("hex").substring(0, 32)
}

// Função para consultar o vector store
async function queryVectorStore(query: string) {
    try {
        const options = {
            model: "4o-mini", // Substitua pelo modelo que você está usando
            name: "PortalPrefeitura",
            instructions: `Você é um assistente especializado em encontrar serviços da Prefeitura de São Paulo.
            Retorne os dados completos dos serviços relevantes em formato JSON, incluindo nome, descrição, resumo, link e outros campos disponíveis.
            Exemplo:
            {
                "servicos": [
                    {"id": 719, "nome": "Guias e Postes - Solicitar pintura", "taxas": "...",  "descricao": "...", "link": "...", "orgão responsável": "...", ...}
                ]
            }`,
            tools: [{ type: "file_search" }],
            tool_resources: { file_search: { vector_store_ids: ["vs_CV873rENwjFOLLzVEtWU3M0u"] } },
            top_p: 1,
        }

        // Criar assistente temporário
        const assistantResponse = await azureOpenAI.beta.assistants.create(options)
        console.log("Assistente criado:", assistantResponse.id)
        const assistantThread = await azureOpenAI.beta.threads.create({})
        console.log("Thread criada:", assistantThread.id)

        // Enviar a consulta do usuário
        await azureOpenAI.beta.threads.messages.create(assistantThread.id, {
            role: "user",
            content: query,
        })

        // Executar a consulta
        const runResponse = await azureOpenAI.beta.threads.runs.create(assistantThread.id, {
            assistant_id: assistantResponse.id,
        })
        console.log("Execução iniciada:", runResponse.id)
        console.log("Status da execução:", runResponse.status)

        // Aguardar a conclusão da execução
        let runStatus = runResponse.status
        while (runStatus === "queued" || runStatus === "in_progress") {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const runStatusResponse = await azureOpenAI.beta.threads.runs.retrieve(assistantThread.id, runResponse.id)
            runStatus = runStatusResponse.status
            console.log("Status da execução:", runStatus)
        }

        if (runStatus === "completed") {
            const messagesResponse = await azureOpenAI.beta.threads.messages.list(assistantThread.id)
            console.log("Mensagens da thread:", messagesResponse.data)
            const assistantMessages = messagesResponse.data.filter((msg) => msg.role === "assistant")
            console.log("Mensagens do assistente:", assistantMessages)
            if (assistantMessages.length > 0) {
                const lastMessage = assistantMessages[0]
                const content = lastMessage.content.map((item) => (item.type === "text" ? item.text.value : "")).join("\n")
                console.log("Conteúdo da última mensagem:", content)
                console.log("Conteúdo da última mensagem (JSON):", JSON.stringify(content))

                // Tentar extrair JSON válido a partir da resposta
                const startIndex = content.indexOf("{")
                const endIndex = content.lastIndexOf("}")
                if (startIndex === -1 || endIndex === -1) {
                    throw new Error("JSON não encontrado na resposta do assistente")
                }
                const jsonStr = content.substring(startIndex, endIndex + 1)

                await azureOpenAI.beta.assistants.del(assistantResponse.id) // Deletar o assistente temporário
                return JSON.parse(jsonStr) // Retornar o JSON parseado
            }
        }

        await azureOpenAI.beta.assistants.del(assistantResponse.id) // Deletar o assistente em caso de falha
        return null
    } catch (error) {
        console.error("Erro ao consultar vector store:", error)
        return null
    }
}

// Modificar a função formatServiceToMarkdown para usar uma abordagem mais simples
function formatServiceToMarkdown(service: any): string {
    const {
        id,
        nome,
        descricao,
        oQueE,
        quandoSolicitar,
        publicoAlvo,
        requisitosDocumentosInformacoes,
        prazoMaximo,
        taxasPrecoPublico,
        principaisEtapas,
        legislacao,
        observacoes,
        orgaoResponsavel,
        link,
    } = service

    // Criar um cabeçalho com o nome do serviço
    let markdown = `### ${nome}\n\n`

    // Adicionar os botões de solicitação usando uma sintaxe mais simples
    // Usamos marcadores especiais no texto para identificar os tipos de botões
    markdown += `[SOLICITAR_NORMAL](${link}?action=solicitar)\n`
    markdown += `[SOLICITAR_ANONIMO](https://sp156.prefeitura.sp.gov.br/portal/servicos/solicitacao?servico=${id}&anonimo=true)\n\n`

    // Adicionar informações básicas
    if (descricao) markdown += `**Descrição:** ${descricao}\n\n`
    if (oQueE) markdown += `**O que é:** ${oQueE}\n\n`
    if (quandoSolicitar) markdown += `**Quando solicitar:** ${quandoSolicitar}\n\n`
    if (publicoAlvo) markdown += `**Público-alvo:** ${publicoAlvo}\n\n`
    if (taxasPrecoPublico) markdown += `**Taxas/Preço público:** ${taxasPrecoPublico}\n\n`
    if (prazoMaximo) markdown += `**Prazo máximo:** ${prazoMaximo}\n\n`

    // Adicionar requisitos
    if (requisitosDocumentosInformacoes) {
        markdown += `**Requisitos/Documentos/Informações necessárias:**\n${requisitosDocumentosInformacoes}\n\n`
    }

    // Adicionar etapas do processo - verificando se é array ou string
    if (principaisEtapas) {
        markdown += `**Principais etapas:**\n`
        if (Array.isArray(principaisEtapas)) {
            principaisEtapas.forEach((etapa) => {
                markdown += `${etapa}\n`
            })
        } else if (typeof principaisEtapas === "string") {
            markdown += `${principaisEtapas}\n`
        }
        markdown += `\n`
    }

    // Adicionar legislação - verificando se é array ou string
    if (legislacao) {
        markdown += `**Legislação:**\n`
        if (Array.isArray(legislacao)) {
            legislacao.forEach((lei) => {
                markdown += `${lei}\n`
            })
        } else if (typeof legislacao === "string") {
            markdown += `${legislacao}\n`
        }
        markdown += `\n`
    }

    // Adicionar observações e órgão responsável
    if (observacoes && observacoes !== "Não há.") markdown += `**Observações:** ${observacoes}\n\n`
    if (orgaoResponsavel) markdown += `**Órgão responsável:** ${orgaoResponsavel}\n\n`

    // Adicionar link para informações completas
    markdown += `[**Acessar informação completa**](${link})\n\n`

    return markdown
}

// Atualizar a API de busca para traduzir os resultados quando necessário

// 1. Modificar a função POST para receber o parâmetro de idioma
export async function POST(request: NextRequest) {
    try {
        const { query, language = "pt" } = await request.json()
        const sanitizedQuery = query.trim()

        // Consultar o vector store
        const vectorStoreResult = await queryVectorStore(sanitizedQuery)

        if (vectorStoreResult && vectorStoreResult.servicos) {
            // Formatar os resultados em Markdown
            let markdownResponse = vectorStoreResult.servicos.map(formatServiceToMarkdown).join("\n\n---\n\n")

            // Se o idioma não for português, traduzir os resultados
            if (language !== "pt") {
                markdownResponse = await translateResults(markdownResponse, language)
            }

            return NextResponse.json({
                result: markdownResponse,
                isOutOfScope: false,
            })
        }

        // Resposta padrão caso não haja resultados
        let defaultResponse =
            "Não encontramos um serviço específico para sua consulta. Para mais informações, acesse o portal da Prefeitura: https://capital.sp.gov.br/ ou ligue para o SP156."

        // Traduzir a resposta padrão se necessário
        if (language !== "pt") {
            defaultResponse = await translateText(defaultResponse, language)
        }

        return NextResponse.json({
            result: defaultResponse,
            isOutOfScope: true,
        })
    } catch (error) {
        console.error("Erro ao processar busca:", error)
        return NextResponse.json({ error: "Erro ao processar a busca. Por favor, tente novamente." }, { status: 500 })
    }
}

// 2. Adicionar função para traduzir os resultados
async function translateResults(markdown: string, targetLanguage: string): Promise<string> {
    try {
        // Gerar uma chave de cache baseada no texto e idioma alvo
        const cacheKey = generateCacheKey(`translate-${markdown}-${targetLanguage}`)

        // Usar o Azure OpenAI para traduzir o texto
        const completion = await azureOpenAI.chat.completions.create({
            model: "4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Você é um tradutor especializado. Traduza o seguinte texto em Markdown do português para o ${targetLanguage === "en" ? "inglês" : targetLanguage === "es" ? "espanhol" : targetLanguage}. 
          Mantenha todas as formatações Markdown, links e estrutura original. 
          Não traduza nomes próprios, URLs ou códigos. 
          Mantenha os marcadores especiais como [SOLICITAR_NORMAL] e [SOLICITAR_ANONIMO].`,
                },
                {
                    role: "user",
                    content: markdown,
                },
            ],
            temperature: 0.3
        })

        return completion.choices[0].message.content || markdown
    } catch (error) {
        console.error("Erro ao traduzir resultados:", error)
        return markdown // Em caso de erro, retornar o texto original
    }
}

// 3. Adicionar função para traduzir textos simples
async function translateText(text: string, targetLanguage: string): Promise<string> {
    try {
        // Gerar uma chave de cache baseada no texto e idioma alvo
        const cacheKey = generateCacheKey(`translate-simple-${text}-${targetLanguage}`)

        // Usar o Azure OpenAI para traduzir o texto
        const completion = await azureOpenAI.chat.completions.create({
            model: "4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Traduza o seguinte texto do português para o ${targetLanguage === "en" ? "inglês" : targetLanguage === "es" ? "espanhol" : targetLanguage}. Mantenha URLs e nomes próprios sem tradução.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            temperature: 0.3
        })

        return completion.choices[0].message.content || text
    } catch (error) {
        console.error("Erro ao traduzir texto:", error)
        return text // Em caso de erro, retornar o texto original
    }
}

export const SERVICES = []