/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client"

import { useState } from "react"
import { ChevronDown, Clock, FileText } from "lucide-react"

interface DemandHistoryProps {
    demands: any[]
}

export default function DemandHistory({ demands }: DemandHistoryProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!demands || demands.length === 0) return null

    return (
        <div className="bg-white rounded-lg shadow-md border border-blue-200 overflow-hidden mb-6">
            <div
                className="bg-blue-500 text-white p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className="text-lg font-bold flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Your Recent Requests ({demands.length})
                </h2>
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="p-4">
                    <div className="space-y-4">
                        {demands.map((demand, index) => (
                            <div key={index} className="border rounded-md p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{demand.title}</h3>
                                        <p className="text-sm text-gray-500">Submitted: {new Date(demand.submittedAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${demand.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : demand.status === "in_progress"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : demand.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            {demand.status === "pending"
                                                ? "Pending"
                                                : demand.status === "in_progress"
                                                    ? "In Progress"
                                                    : demand.status === "completed"
                                                        ? "Completed"
                                                        : "Unknown"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-700 line-clamp-2">{demand.description}</p>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 flex items-center">
                                        <FileText className="w-3 h-3 mr-1" />
                                        {demand.category ? categories[demand.category] || demand.category : "General Request"}
                                    </div>

                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                                        {demand.department || "City Hall"}
                                    </div>

                                    {demand.urgency && (
                                        <div
                                            className={`px-2 py-1 rounded text-xs ${demand.urgency === "critical"
                                                ? "bg-red-100 text-red-700"
                                                : demand.urgency === "high"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : demand.urgency === "medium"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {demand.urgency.charAt(0).toUpperCase() + demand.urgency.slice(1)} Priority
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between">
                                    <span className="text-xs text-gray-500">
                                        Request ID: SP-
                                        {Math.floor(Math.random() * 1000000)
                                            .toString()
                                            .padStart(6, "0")}
                                    </span>
                                    <button className="text-blue-600 text-sm hover:underline">View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

const categories = {
    zeladoria: "Urban Maintenance",
    iluminacao: "Public Lighting",
    arvores: "Trees and Vegetation",
    lixo: "Garbage and Waste",
    pichacao: "Graffiti and Vandalism",
    veiculos: "Abandoned Vehicles",
    agua: "Water and Sewage",
    transito: "Traffic and Signals",
    calcadas: "Sidewalks and Accessibility",
    outros: "Other Issues",
}
