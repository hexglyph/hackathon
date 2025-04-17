"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AlertTriangle, Check, ChevronDown, FileText, Loader2, MapPin, Send, Upload, Info } from "lucide-react"
import Image from "next/image"

interface DemandMakerProps {
    query: string
    imageAnalysis: any | null
    searchResults: string | null
    interpretedQuery: any | null
    userLocation: { lat: number; lng: number } | null
    onSubmit: (demandData: any) => void
    selectedImage?: File | null // Add this line
}

export default function DemandMaker({
    query,
    imageAnalysis,
    searchResults,
    interpretedQuery,
    userLocation,
    onSubmit,
    selectedImage,
}: DemandMakerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
    const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([])
    const [mainImage, setMainImage] = useState<File | null>(null)
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        urgency: "medium",
        location: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        anonymous: false,
    })

    // Categories based on common city services
    const categories = [
        { id: "zeladoria", name: "Urban Maintenance" },
        { id: "iluminacao", name: "Public Lighting" },
        { id: "arvores", name: "Trees and Vegetation" },
        { id: "lixo", name: "Garbage and Waste" },
        { id: "pichacao", name: "Graffiti and Vandalism" },
        { id: "veiculos", name: "Abandoned Vehicles" },
        { id: "agua", name: "Water and Sewage" },
        { id: "transito", name: "Traffic and Signals" },
        { id: "calcadas", name: "Sidewalks and Accessibility" },
        { id: "outros", name: "Other Issues" },
    ]

    // Departments that handle different types of issues
    const departments = {
        zeladoria: "Department of Urban Services",
        iluminacao: "Department of Public Lighting",
        arvores: "Department of Green Areas",
        lixo: "Department of Urban Cleaning",
        pichacao: "Department of Urban Landscape",
        veiculos: "Department of Traffic",
        agua: "Department of Water and Sewage",
        transito: "Department of Traffic and Transport",
        calcadas: "Department of Urban Infrastructure",
        outros: "City Hall Central Services",
    }

    // Pre-fill form data based on props
    useEffect(() => {
        let title = ""
        let description = ""
        let category = ""
        let urgency = "medium"
        let location = ""

        // Use image analysis if available
        if (imageAnalysis) {
            title = imageAnalysis.problem || ""
            description = imageAnalysis.details || ""
            category = mapProblemToCategory(imageAnalysis.serviceType || "")
            urgency = imageAnalysis.urgency || "medium"
        }
        // Otherwise use search query
        else if (query) {
            title = interpretedQuery?.serviceType || query
            description = `Request regarding: ${query}`
            category = interpretedQuery ? mapProblemToCategory(interpretedQuery.serviceType) : ""
        }

        // Add location information if available
        if (userLocation) {
            location = `Lat: ${userLocation.lat.toFixed(6)}, Lng: ${userLocation.lng.toFixed(6)}`
        }

        setFormData((prev) => ({
            ...prev,
            title,
            description,
            category,
            urgency,
            location,
        }))

        // If there's an image from analysis, use it as the main image
        if (selectedImage) {
            setMainImage(selectedImage)
            setMainImagePreview(URL.createObjectURL(selectedImage))
        }
    }, [query, imageAnalysis, interpretedQuery, userLocation, selectedImage])

    // Map problem types to categories
    function mapProblemToCategory(problem: string): string {
        const problemLower = problem?.toLowerCase() || ""

        if (problemLower.includes("tree") || problemLower.includes("árvore") || problemLower.includes("poda"))
            return "arvores"
        if (problemLower.includes("light") || problemLower.includes("iluminação") || problemLower.includes("poste"))
            return "iluminacao"
        if (problemLower.includes("garbage") || problemLower.includes("lixo") || problemLower.includes("resíduo"))
            return "lixo"
        if (problemLower.includes("graffiti") || problemLower.includes("pichação") || problemLower.includes("vandalismo"))
            return "pichacao"
        if (problemLower.includes("vehicle") || problemLower.includes("veículo") || problemLower.includes("carro"))
            return "veiculos"
        if (problemLower.includes("water") || problemLower.includes("água") || problemLower.includes("vazamento"))
            return "agua"
        if (problemLower.includes("traffic") || problemLower.includes("trânsito") || problemLower.includes("semáforo"))
            return "transito"
        if (
            problemLower.includes("sidewalk") ||
            problemLower.includes("calçada") ||
            problemLower.includes("acessibilidade")
        )
            return "calcadas"

        return "zeladoria" // Default to urban maintenance
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData((prev) => ({ ...prev, [name]: checked }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setAdditionalFiles((prev) => [...prev, ...newFiles])

            // Create preview URLs
            const newUrls = newFiles.map((file) => URL.createObjectURL(file))
            setFilePreviewUrls((prev) => [...prev, ...newUrls])
        }
    }

    const removeFile = (index: number) => {
        setAdditionalFiles((prev) => prev.filter((_, i) => i !== index))

        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(filePreviewUrls[index])
        setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index))
    }

    const nextStep = () => {
        setStep((prev) => prev + 1)
    }

    const prevStep = () => {
        setStep((prev) => prev - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // In a real implementation, you would send the form data to your backend
            // For now, we'll simulate a successful submission after a delay
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Prepare the data that would be sent to the backend
            const demandData = {
                ...formData,
                files: additionalFiles.map((file) => file.name), // In a real app, you'd upload these files
                mainImage: mainImage ? mainImage.name : null, // Add the main image
                submittedAt: new Date().toISOString(),
                department: departments[formData.category as keyof typeof departments] || departments.outros,
                status: "pending",
            }

            // Call the onSubmit callback with the demand data
            onSubmit(demandData)

            // Show success state
            setSubmitSuccess(true)

            // Reset form after a delay
            setTimeout(() => {
                setIsOpen(false)
                setStep(1)
                setSubmitSuccess(false)
                setAdditionalFiles([])
                setFilePreviewUrls([])
                setFormData({
                    title: "",
                    description: "",
                    category: "",
                    urgency: "medium",
                    location: "",
                    contactName: "",
                    contactEmail: "",
                    contactPhone: "",
                    anonymous: false,
                })
            }, 3000)
        } catch (error) {
            console.error("Error submitting demand:", error)
            setSubmitError("There was an error submitting your request. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!query && !imageAnalysis) return null

    return (
        <div className="bg-white rounded-lg shadow-md border border-orange-200 overflow-hidden mb-6">
            <div
                className="bg-orange-500 text-white p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className="text-lg font-bold flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Create Service Request
                </h2>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="p-4">
                    {submitSuccess ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                            <div className="flex justify-center mb-2">
                                <div className="bg-green-100 p-2 rounded-full">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Request Submitted Successfully!</h3>
                            <p className="text-green-700">
                                Your service request has been submitted to{" "}
                                {departments[formData.category as keyof typeof departments] || "City Hall"}. You will receive a
                                confirmation email shortly.
                            </p>
                            <p className="mt-2 text-sm text-green-600">
                                Request ID: SP-
                                {Math.floor(Math.random() * 1000000)
                                    .toString()
                                    .padStart(6, "0")}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Request Details</h3>

                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Request Title*
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Brief description of the issue"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category*
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.category && (
                                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
                                                <p className="text-sm font-medium flex items-center text-orange-700">
                                                    <Info className="w-4 h-4 mr-1 flex-shrink-0" />
                                                    This request will be directed to:
                                                    <span className="font-bold ml-1">
                                                        {departments[formData.category as keyof typeof departments]}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Detailed Description*
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Provide details about the issue, including when you noticed it"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                                            Urgency Level
                                        </label>
                                        <select
                                            id="urgency"
                                            name="urgency"
                                            value={formData.urgency}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        >
                                            <option value="low">Low - Can be addressed in the coming weeks</option>
                                            <option value="medium">Medium - Should be addressed soon</option>
                                            <option value="high">High - Requires prompt attention</option>
                                            <option value="critical">Critical - Safety hazard, immediate action needed</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Location & Attachments</h3>

                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                            Location Description*
                                        </label>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                required
                                                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="Address or description of the location"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (navigator.geolocation) {
                                                        navigator.geolocation.getCurrentPosition(
                                                            (position) => {
                                                                const { latitude, longitude } = position.coords
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                                                                }))
                                                            },
                                                            (error) => {
                                                                console.error("Error getting location:", error)
                                                                alert("Could not get your location. Please enter it manually.")
                                                            },
                                                        )
                                                    }
                                                }}
                                                className="bg-gray-200 px-3 py-2 rounded-r-md hover:bg-gray-300 transition-colors flex items-center"
                                            >
                                                <MapPin className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Provide the exact address or a detailed description of the location
                                        </p>
                                    </div>

                                    {mainImagePreview && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image</label>
                                            <div className="relative h-40 w-full border rounded-md overflow-hidden">
                                                {mainImagePreview && (
                                                    <Image
                                                        src={mainImagePreview || "/placeholder.svg"}
                                                        alt="Main image"
                                                        fill
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                This image was automatically added from your analysis
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {mainImagePreview ? "Additional Photos or Documents" : "Photos or Documents"}
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                                            <input
                                                type="file"
                                                id="files"
                                                multiple
                                                accept="image/*,.pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <label htmlFor="files" className="cursor-pointer">
                                                <div className="flex flex-col items-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                                                </div>
                                            </label>
                                        </div>

                                        {filePreviewUrls.length > 0 && (
                                            <div className="mt-3 grid grid-cols-3 gap-2">
                                                {filePreviewUrls.map((url, index) => (
                                                    <div key={index} className="relative">
                                                        <div className="h-20 w-full border rounded-md overflow-hidden">
                                                            {additionalFiles[index].type.startsWith("image/") ? (
                                                                <Image
                                                                    src={url || "/placeholder.svg"}
                                                                    alt={`Preview ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>

                                    <div className="bg-orange-50 p-3 rounded-md mb-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <AlertTriangle className="h-5 w-5 text-orange-400" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-orange-800">Privacy Notice</h3>
                                                <div className="mt-2 text-sm text-orange-700">
                                                    <p>
                                                        Your contact information will only be used to follow up on this specific request. You can
                                                        choose to submit anonymously, but we won&apos;t be able to provide updates.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center">
                                            <input
                                                id="anonymous"
                                                name="anonymous"
                                                type="checkbox"
                                                checked={formData.anonymous}
                                                onChange={handleCheckboxChange}
                                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                                                Submit anonymously
                                            </label>
                                        </div>
                                    </div>

                                    {!formData.anonymous && (
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="contactName"
                                                    name="contactName"
                                                    value={formData.contactName}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="Your full name"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    id="contactEmail"
                                                    name="contactEmail"
                                                    value={formData.contactEmail}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="Your email address"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="contactPhone"
                                                    name="contactPhone"
                                                    value={formData.contactPhone}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="Your phone number"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {submitError && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                                            {submitError}
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit Request
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
