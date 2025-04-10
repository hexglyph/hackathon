import { type NextRequest, NextResponse } from "next/server"
import { load } from "cheerio"

export async function GET(request: NextRequest) {
    try {
        // Obter o termo de busca da URL
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get("q")

        if (!query) {
            return NextResponse.json({ error: "Termo de busca não fornecido" }, { status: 400 })
        }

        // Construir a URL de busca do site da prefeitura
        // Remover as aspas da URL para melhorar os resultados
        const encodedQuery = encodeURIComponent(query)
        const url = `https://capital.sp.gov.br/busca?q=${encodedQuery}&sort=createDate-&start=1&news=79914&title=${encodedQuery}`

        // Fazer a requisição para o site da prefeitura
        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        })

        console.log("Busca", { query, url }) // Log para depuração
        console.log("Status da resposta:", response.status) // Log do status da resposta
        console.log("Cabeçalhos da resposta:", response.headers) // Log dos cabeçalhos da resposta
        console.log("URL da resposta:", response.url) // Log da URL da resposta

        if (!response.ok) {
            return NextResponse.json(
                { error: `Erro ao buscar no site da prefeitura: ${response.status} ${response.statusText}` },
                { status: response.status },
            )
        }

        // Obter o HTML da resposta - IMPORTANTE: só podemos ler o corpo da resposta uma vez
        const html = await response.text()

        // Usar cheerio para extrair os resultados da busca
        const $ = load(html)

        // Adicionar logs para depuração
        console.log("HTML carregado com Cheerio")

        // Tentar diferentes seletores para encontrar os resultados
        const searchResultsContainer = $(
            ".portlet-boundary_com_liferay_portal_search_web_search_results_portlet_SearchResultsPortlet_ .portlet-search-results",
        )

        // Log para verificar se encontrou o container
        console.log("Container de resultados encontrado:", searchResultsContainer.length > 0)

        // Extrair os resultados da busca
        const results = []

        // Tentar encontrar resultados com diferentes seletores
        const searchResults =
            searchResultsContainer.find(".search-result").length > 0
                ? searchResultsContainer.find(".search-result")
                : $(".psp-search-result-title").closest("a") // Tenta um seletor alternativo

        console.log("Número de resultados encontrados:", searchResults.length)

        // Encontrar todos os itens de resultado
        if (searchResults.length > 0) {
            searchResults.each((index, element) => {
                // Para o seletor original
                if ($(element).find(".search-result-title a").length > 0) {
                    const title = $(element).find(".search-result-title a").text().trim()
                    const url = $(element).find(".search-result-title a").attr("href")
                    const description = $(element).find(".search-result-description").text().trim()

                    if (title && url) {
                        results.push({
                            title,
                            url,
                            description,
                        })
                    }
                }
                // Para o seletor alternativo
                else if ($(element).is("a")) {
                    const title = $(element).find(".psp-search-result-title").text().trim()
                    const url = $(element).attr("href")
                    const description = $(element).find(".psp-search-result-description").text().trim()

                    if (title && url) {
                        results.push({
                            title,
                            url,
                            description,
                        })
                    }
                }
            })
        }

        // Se não encontrou resultados com os seletores anteriores, tenta uma abordagem mais genérica
        if (results.length === 0) {
            // Procura por qualquer elemento que pareça um resultado de busca
            $("a.d-block.mb-5").each((index, element) => {
                const title = $(element).find("h2").text().trim()
                const url = $(element).attr("href")
                const description = $(element).find("span.psp-news-text").text().trim()

                if (title && url) {
                    results.push({
                        title,
                        url,
                        description,
                    })
                }
            })
        }

        console.log("Resultados processados:", results.length)

        // Se ainda não encontrou resultados, verifica se há algum erro na página
        if (results.length === 0) {
            const errorMessage = $(".alert-danger").text().trim() || $(".psp-search-result-error").text().trim()
            if (errorMessage) {
                console.log("Erro encontrado na página:", errorMessage)
                return NextResponse.json({ error: `Erro retornado pelo site da prefeitura: ${errorMessage}` }, { status: 500 })
            }
        }

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Erro ao processar busca no site:", error)
        return NextResponse.json(
            { error: "Erro ao processar a busca no site da prefeitura. Por favor, tente novamente." },
            { status: 500 },
        )
    }
}

