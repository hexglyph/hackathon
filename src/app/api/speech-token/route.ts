import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Verificar se as credenciais do Azure Speech estão configuradas
        if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
            return NextResponse.json(
                {
                    error: true,
                    errorMessage: "Credenciais do Azure Speech não configuradas",
                    token: "",
                    region: "",
                },
                { status: 500 },
            )
        }

        // Obter o token de autenticação do Azure Speech
        const response = await fetch(
            `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
            {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
                },
                cache: "no-store",
            },
        )

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: true,
                    errorMessage: response.statusText,
                    token: "",
                    region: "",
                },
                { status: response.status },
            )
        }

        const token = await response.text()

        return NextResponse.json({
            error: false,
            errorMessage: "",
            token: token,
            region: process.env.AZURE_SPEECH_REGION,
        })
    } catch (error) {
        console.error("Erro ao obter token do Azure Speech:", error)
        return NextResponse.json(
            {
                error: true,
                errorMessage: "Erro ao obter token do Azure Speech",
                token: "",
                region: "",
            },
            { status: 500 },
        )
    }
}
