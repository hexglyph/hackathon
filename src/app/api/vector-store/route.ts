import { type NextRequest, NextResponse } from "next/server"
import {
    addDocumentToVectorStore,
    removeDocumentFromVectorStore,
    listVectorStoreDocuments,
    createVectorStore,
} from "@/app/utils/vector-store"

// Função para verificar a chave de API
function validateApiKey(request: NextRequest) {
    const apiKey = request.headers.get("x-api-key")
    return apiKey === process.env.ADMIN_API_KEY
}

export async function POST(request: NextRequest) {
    // Verificar a chave de API
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Acesso não autorizado" }, { status: 401 })
    }

    try {
        const { action, data } = await request.json()

        switch (action) {
            case "add-document":
                // Adicionar um documento ao vector store
                if (!data || !data.title || !data.content || !data.url || !data.category) {
                    return NextResponse.json(
                        { error: "Dados incompletos. Forneça title, content, url e category." },
                        { status: 400 },
                    )
                }

                const addResult = await addDocumentToVectorStore(data)
                return NextResponse.json(addResult)

            case "remove-document":
                // Remover um documento do vector store
                if (!data || !data.fileId) {
                    return NextResponse.json({ error: "Forneça o fileId do documento a ser removido." }, { status: 400 })
                }

                const removeResult = await removeDocumentFromVectorStore(data.fileId)
                return NextResponse.json(removeResult)

            case "list-documents":
                // Listar todos os documentos no vector store
                const listResult = await listVectorStoreDocuments()
                return NextResponse.json(listResult)

            case "create-vector-store":
                // Criar um novo vector store (executar apenas uma vez)
                const createResult = await createVectorStore()
                return NextResponse.json(createResult)

            default:
                return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 })
        }
    } catch (error) {
        console.error("Erro na API de vector store:", error)
        return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
    }
}

