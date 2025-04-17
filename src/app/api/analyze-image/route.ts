import { type NextRequest, NextResponse } from "next/server"
import { AzureOpenAI } from "openai"

// Configure Azure OpenAI client
const azureOpenAI = new AzureOpenAI({
    endpoint: "https://ia-niass-east2.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    apiVersion: "2024-12-01-preview",
})

export async function POST(request: NextRequest) {
    try {
        // Get the form data with the image
        const formData = await request.formData()
        const imageFile = formData.get("image") as File

        if (!imageFile) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 })
        }

        // Convert the file to a buffer
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Convert to base64
        const base64Image = buffer.toString("base64")

        // Create the messages for the API call
        const messages = [
            {
                role: "system",
                content: [
                    {
                        type: "text",
                        text: `You are an AI assistant for São Paulo City Hall. Analyze the image and identify urban issues or problems that require municipal services.
            
            Focus on identifying:
            1. Infrastructure problems (broken sidewalks, potholes, damaged roads)
            2. Public lighting issues
            3. Tree-related problems (fallen trees, trees needing pruning)
            4. Garbage or waste disposal issues
            5. Graffiti or vandalism
            6. Abandoned vehicles
            7. Water leaks or flooding
            8. Traffic signal problems
            
            Provide a detailed analysis in the following JSON format:
            {
              "problem": "Brief description of the main problem",
              "details": "Detailed analysis of what you see in the image",
              "serviceType": "The type of municipal service needed to fix this issue",
              "urgency": "low|medium|high",
              "searchQuery": "A search query to find the appropriate service in the city hall database"
            }
            
            If you cannot identify a clear municipal issue in the image, respond with:
            {
              "problem": "No clear municipal issue identified",
              "details": "Explanation of what you see but why it's not a municipal service issue",
              "serviceType": null,
              "urgency": "none",
              "searchQuery": null
            }`,
                    },
                ],
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${imageFile.type};base64,${base64Image}`,
                        },
                    },
                    {
                        type: "text",
                        text: "Analyze this image and identify any urban issues that require municipal services. What problem do you see and what service is needed to fix it?",
                    },
                ],
            },
        ]

        // Call the OpenAI API with the o3 model
        const response = await azureOpenAI.chat.completions.create({
            model: "o3",
            messages: messages,
            max_completion_tokens: 2000,
            response_format: { type: "json_object" },
        })

        // Parse the response
        const content = response.choices[0].message.content
        if (!content) {
            throw new Error("No content in the response")
        }

        // Parse the JSON response
        const analysis = JSON.parse(content)

        // Return the analysis
        return NextResponse.json(analysis)
    } catch (error) {
        console.error("Error analyzing image:", error)
        return NextResponse.json({ error: "Error analyzing image. Please try again." }, { status: 500 })
    }
}
