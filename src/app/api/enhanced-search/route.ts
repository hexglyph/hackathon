import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"

// Configuração do cliente Azure OpenAI
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

export async function POST(request: NextRequest) {
    try {
        const { query, language = "pt" } = await request.json()

        if (!query || typeof query !== "string") {
            return NextResponse.json({
                result: "Por favor, forneça um termo de busca válido.",
                isOutOfScope: true,
            })
        }

        const sanitizedQuery = query.trim()

        // Preparar a consulta para o modelo com melhorias para lidar com variações de escrita
        const enhancedPrompt = `
      Busca original: "${sanitizedQuery}"
      
      Por favor, encontre serviços da Prefeitura de São Paulo relacionados a esta busca.
      Considere possíveis erros de digitação, variações de escrita e sinônimos.
      
      Exemplos de variações a considerar:
      - "catabagulho" / "cata bagulho" / "cata-bagulho"
      - "tapa buraco" / "tapaburaco" / "tapa-buraco"
      - "poda de árvore" / "poda arvore" / "podar árvore"
      
      Se a consulta for sobre ecopontos, inclua o endereço completo, telefone e horário de funcionamento.
    `

        // Consultar o vector store usando a API do Azure OpenAI
        const vectorStoreResult = await queryVectorStore(enhancedPrompt)

        if (vectorStoreResult) {
            let markdownResponse = ""

            // Verificar se temos serviços ou ecopontos
            if (vectorStoreResult.servicos && vectorStoreResult.servicos.length > 0) {
                markdownResponse = vectorStoreResult.servicos.map(formatServiceToMarkdown).join("\n\n---\n\n")
            } else if (vectorStoreResult.ecopontos && vectorStoreResult.ecopontos.length > 0) {
                markdownResponse = vectorStoreResult.ecopontos.map(formatEcopontoToMarkdown).join("\n\n---\n\n")

                // Adicionar link para o mapa geral, se disponível
                if (vectorStoreResult.mapa) {
                    const cleanMapaLink = vectorStoreResult.mapa.replace(/【.*?】/g, "").replace(/\s*source\s*/g, "")
                    markdownResponse += `\n\n[**Ver todos os Ecopontos no mapa**](${cleanMapaLink})\n\n`
                }
            }

            // Se o idioma não for português, traduzir os resultados
            if (language !== "pt" && markdownResponse) {
                markdownResponse = await translateText(markdownResponse, language)
            }

            if (markdownResponse) {
                return NextResponse.json({
                    result: markdownResponse,
                    isOutOfScope: false,
                    source: "vector_store",
                })
            }
        }

        // Se chegamos aqui, não encontramos resultados
        // Gerar uma resposta amigável com sugestões
        const noResultsResponse = await generateNoResultsResponse(sanitizedQuery, language)

        return NextResponse.json({
            result: noResultsResponse,
            isOutOfScope: true,
            source: "fallback",
        })
    } catch (error) {
        console.error("Erro ao processar busca:", error)

        // Mesmo com erro, retornar uma resposta amigável
        return NextResponse.json({
            result:
                "Desculpe, ocorreu um erro ao processar sua busca. Por favor, tente novamente com termos diferentes ou entre em contato com o SP156.",
            isOutOfScope: true,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        })
    }
}

// Função para consultar o vector store usando o assistente da Azure OpenAI
async function queryVectorStore(query: string) {
    try {
        const options = {
            model: "o3-mini",
            name: "PortalPrefeitura",
            instructions: `Você é um assistente especializado em encontrar serviços da Prefeitura de São Paulo.
      Retorne os dados completos dos serviços relevantes em formato JSON, incluindo nome, descrição, resumo, link e outros campos disponíveis.
      
      Se a consulta for sobre ecopontos, retorne no seguinte formato:
      {
          "ecopontos": [
              {"nome": "Nome do Ecoponto", "endereco": "...", "cep": "...", "horarioFuncionamento": "...", ...}
          ],
          "mapa": "URL do mapa com todos os ecopontos"
      }
      
      Para outros serviços, use:
      {
          "servicos": [
              {"id": 719, "nome": "Guias e Postes - Solicitar pintura", "taxas": "...",  "descricao": "...", "link": "...", "orgaoResponsavel": "...", ...}
          ]
      }
      
      Considere variações de escrita e erros comuns, como:
      - "catabagulho" = "cata bagulho" = "cata-bagulho"
      - "tapaburaco" = "tapa buraco" = "tapa-buraco"
      - "podaarvore" = "poda de árvore" = "poda árvore"
      
      Se não encontrar resultados exatos, tente buscar por serviços similares ou relacionados.`,
            tools: [{ type: "file_search" }],
            tool_resources: { file_search: { vector_store_ids: ["vs_CV873rENwjFOLLzVEtWU3M0u"] } },
            top_p: 1,
        }

        // Criar assistente temporário
        const assistantResponse = await azureOpenAI.beta.assistants.create(options)
        const assistantThread = await azureOpenAI.beta.threads.create({})

        // Enviar a consulta do usuário
        await azureOpenAI.beta.threads.messages.create(assistantThread.id, {
            role: "user",
            content: query,
        })

        // Executar a consulta
        const runResponse = await azureOpenAI.beta.threads.runs.create(assistantThread.id, {
            assistant_id: assistantResponse.id,
        })

        // Aguardar a conclusão da execução
        let runStatus = runResponse.status
        let attempts = 0
        const maxAttempts = 30 // Limitar o número de tentativas para evitar loops infinitos

        while ((runStatus === "queued" || runStatus === "in_progress") && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const runStatusResponse = await azureOpenAI.beta.threads.runs.retrieve(assistantThread.id, runResponse.id)
            runStatus = runStatusResponse.status
            attempts++
        }

        if (runStatus === "completed") {
            const messagesResponse = await azureOpenAI.beta.threads.messages.list(assistantThread.id)
            const assistantMessages = messagesResponse.data.filter((msg) => msg.role === "assistant")

            if (assistantMessages.length > 0) {
                const lastMessage = assistantMessages[0]
                const content = lastMessage.content.map((item) => (item.type === "text" ? item.text.value : "")).join("\n")

                // Tentar extrair JSON válido a partir da resposta
                let jsonStr = ""
                const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/)

                if (jsonBlockMatch && jsonBlockMatch[1]) {
                    jsonStr = jsonBlockMatch[1]
                } else {
                    // Se não encontrar bloco de código, procurar por chaves
                    const startIndex = content.indexOf("{")
                    const endIndex = content.lastIndexOf("}")
                    if (startIndex !== -1 && endIndex !== -1) {
                        jsonStr = content.substring(startIndex, endIndex + 1)
                    } else {
                        throw new Error("JSON não encontrado na resposta do assistente")
                    }
                }

                // Limpar o JSON de possíveis problemas
                jsonStr = jsonStr
                    .replace(/【.*?】/g, "") // Remover referências de fonte
                    .replace(/\s*source\s*/g, "") // Remover palavra "source"

                await azureOpenAI.beta.assistants.del(assistantResponse.id) // Deletar o assistente temporário
                return JSON.parse(jsonStr) // Retornar o JSON parseado
            }
        }

        await azureOpenAI.beta.assistants.del(assistantResponse.id) // Deletar o assistente em caso de falha
        return null
    } catch (error) {
        console.error("Erro ao consultar vector store:", error)
        throw error
    }
}

// Função para traduzir texto
async function translateText(text: string, targetLanguage: string): Promise<string> {
    try {
        // Determinar o sistema prompt baseado no idioma alvo
        const systemPrompt = `Você é um tradutor especializado. Traduza o seguinte texto do português para o ${targetLanguage === "en" ? "inglês" : targetLanguage === "es" ? "espanhol" : targetLanguage}. 
    Mantenha todas as formatações Markdown, links e estrutura original. 
    Não traduza nomes próprios, URLs ou códigos. 
    Mantenha os marcadores especiais como [SOLICITAR_NORMAL] e [SOLICITAR_ANONIMO].`

        // Usar o Azure OpenAI para traduzir o texto
        const translationResponse = await azureOpenAI.chat.completions.create({
            model: "o3-mini",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            reasoning_effort: "low",
            store: true,
        })

        return translationResponse.choices[0].message.content || text
    } catch (error) {
        console.error("Erro ao traduzir texto:", error)
        return text // Em caso de erro, retornar o texto original
    }
}

// Função para gerar resposta quando não há resultados
async function generateNoResultsResponse(query: string, language: string): Promise<string> {
    try {
        const prompt = `
      O usuário buscou por "${query}" mas não encontramos resultados específicos.
      
      Gere uma resposta amigável em português que:
      1. Informe que não encontramos um serviço específico para a consulta
      2. Sugira termos alternativos de busca relacionados
      3. Recomende entrar em contato com o SP156 para mais informações
      4. Forneça o link para o portal da Prefeitura: https://capital.sp.gov.br/
      
      Use formato Markdown e mantenha a resposta concisa e útil.
    `

        const response = await azureOpenAI.chat.completions.create({
            model: "o3-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Você é um assistente da Prefeitura de São Paulo, especializado em ajudar cidadãos a encontrar serviços municipais.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            reasoning_effort: "low",
            store: true,
        })

        let result =
            response.choices[0].message.content ||
            "Não encontramos um serviço específico para sua consulta. Para mais informações, acesse o portal da Prefeitura: https://capital.sp.gov.br/ ou ligue para o SP156."

        // Traduzir se necessário
        if (language !== "pt") {
            result = await translateText(result, language)
        }

        return result
    } catch (error) {
        console.error("Erro ao gerar resposta para busca sem resultados:", error)
        return "Não encontramos um serviço específico para sua consulta. Para mais informações, acesse o portal da Prefeitura: https://capital.sp.gov.br/ ou ligue para o SP156."
    }
}

// Função para formatar serviço em Markdown
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
        endereco,
        localizacao,
        telefone,
        horarioFuncionamento,
    } = service

    // Criar um cabeçalho com o nome do serviço
    let markdown = `### ${nome}\n\n`

    // Adicionar os botões de solicitação usando uma sintaxe mais simples
    if (link) {
        markdown += `[SOLICITAR_NORMAL](${link}?action=solicitar)\n`
        markdown += `[SOLICITAR_ANONIMO](https://sp156.prefeitura.sp.gov.br/portal/servicos/solicitacao?servico=${id}&anonimo=true)\n\n`
    }

    // Adicionar informações básicas
    if (descricao) markdown += `**Descrição:** ${descricao}\n\n`
    if (oQueE) markdown += `**O que é:** ${oQueE}\n\n`
    if (quandoSolicitar) markdown += `**Quando solicitar:** ${quandoSolicitar}\n\n`
    if (publicoAlvo) markdown += `**Público-alvo:** ${publicoAlvo}\n\n`
    if (taxasPrecoPublico) markdown += `**Taxas/Preço público:** ${taxasPrecoPublico}\n\n`
    if (prazoMaximo) markdown += `**Prazo máximo:** ${prazoMaximo}\n\n`

    if (endereco) markdown += `**Endereço:** ${endereco}\n\n`
    if (telefone) markdown += `**Telefone:** ${telefone}\n\n`
    if (horarioFuncionamento) markdown += `**Horário de Funcionamento:** ${horarioFuncionamento}\n\n`
    if (localizacao) markdown += `**Localização:** ${localizacao}\n\n`

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
    if (link) {
        // Limpar o link removendo referências de fonte
        const cleanLink = link.replace(/【.*?】/g, "").replace(/\s*source\s*/g, "")
        markdown += `[**Acessar informação completa**](${cleanLink})\n\n`
    }

    return markdown
}

// Função para formatar ecoponto em Markdown
function formatEcopontoToMarkdown(ecoponto: any): string {
    const {
        nome,
        endereco,
        cep,
        horarioFuncionamento,
        materiaisAceitos,
        subprefeitura,
        aceitaGesso,
        telefone,
        link,
        mapa,
    } = ecoponto

    // Criar um cabeçalho com o nome do ecoponto
    let markdown = `### ${nome}\n\n`

    // Adicionar botão para ver no Google Maps
    if (endereco) {
        markdown += `[Ver no Google Maps](https://www.google.com/maps/search/${encodeURIComponent(endereco + " São Paulo")})\n\n`
    }

    // Adicionar informações básicas
    if (endereco) markdown += `**Endereço:** ${endereco}\n\n`
    if (cep) markdown += `**CEP:** ${cep}\n\n`
    if (horarioFuncionamento) markdown += `**Horário de Funcionamento:** ${horarioFuncionamento}\n\n`
    if (telefone) markdown += `**Telefone:** ${telefone}\n\n`

    // Adicionar informações sobre materiais aceitos
    if (materiaisAceitos) {
        markdown += `**Materiais Aceitos:**\n`
        if (Array.isArray(materiaisAceitos)) {
            materiaisAceitos.forEach((material) => {
                markdown += `- ${material}\n`
            })
        } else if (typeof materiaisAceitos === "string") {
            markdown += `${materiaisAceitos}\n`
        }
        markdown += `\n`
    }

    // Adicionar informação sobre aceitação de gesso
    if (aceitaGesso !== undefined) {
        markdown += `**Aceita Gesso:** ${aceitaGesso ? "Sim" : "Não"}\n\n`
    }

    // Adicionar subprefeitura
    if (subprefeitura) markdown += `**Subprefeitura:** ${subprefeitura}\n\n`

    // Adicionar link para informações completas
    if (link) {
        // Limpar o link removendo referências de fonte
        const cleanLink = link.replace(/【.*?】/g, "").replace(/\s*source\s*/g, "")
        markdown += `[**Acessar informação completa**](${cleanLink})\n\n`
    }

    return markdown
}
