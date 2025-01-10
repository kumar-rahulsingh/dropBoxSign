"use client";
import React, { useState, useEffect } from "react";

export default function Form() {
    const [participants, setParticipants] = useState([{ name: "", email: "" }]);
    const [signingType, setSigningType] = useState("regular");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const handleParticipantChange = (index, field, value) => {
        const updatedParticipants = [...participants];
        updatedParticipants[index][field] = value;
        setParticipants(updatedParticipants);
    };

    const addParticipant = () => {
        setParticipants([...participants, { name: "", email: "" }]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf") {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFile(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setMessage("Please select a valid PDF file.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (participants.some((participant) => !participant.name || !participant.email) || !file) {
            setMessage("Please complete all fields and upload a file.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/dropsign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ participants, signingType, file }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(" Agreement sent successfully!");
            } else {
                setMessage(data.error || "Failed to send Agreement");
            }
        } catch (error) {
            setMessage("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between">
            <main className="flex-grow flex justify-center items-center px-4 py-8">
                <form
                    className="w-full max-w-md p-8 rounded-lg shadow-xl space-y-6"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-xl font-semibold text-gray-700 text-center">Send Agreement for Signature</h2>

                    {participants.map((participant, index) => (
                        <div key={index} className="flex flex-col gap-4 mb-6">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-gray-50 w-1/2"
                                    value={participant.name}
                                    onChange={(e) =>
                                        handleParticipantChange(index, "name", e.target.value)
                                    }
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-gray-50 w-1/2"
                                    value={participant.email}
                                    onChange={(e) =>
                                        handleParticipantChange(index, "email", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        className=" w-50% p-2 bg-gray-500 text-white rounded-md shadow-sm hover:bg-gray-800 mb-4"
                        onClick={addParticipant}
                    >
                        Add Participant
                    </button>

                    <select
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-gray-50 mb-6"
                        value={signingType}
                        onChange={(e) => setSigningType(e.target.value)}
                    >
                        <option value="regular">Regular Signing</option>
                        <option value="notary">Notary Signing</option>
                    </select>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-gray-50 mb-6"
                    />

                    <button
                        type="submit"
                        className={`w-50% p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors ${loading ? "opacity-50" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>

                    {message && <p className="text-sm text-green-600 mt-4 text-center">{message}</p>}
                </form>
            </main>
        </div>
    );
}
