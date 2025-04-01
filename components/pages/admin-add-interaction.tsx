import { SessionContext } from "@/contexts/session";
import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { API_URL } from "@/utils/dataInterface";
import { Interaction } from "@/utils/types"; // Assuming you have an Interaction type defined
import { getInteractions, addInteraction } from "@/utils/accountInterface";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminAddInteractionPage() {
    const { session, logout } = useContext(SessionContext);
    const router = useRouter();

    const [interactionType, setInteractionType] = useState("");
    const [question, setQuestion] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [interactionHistory, setInteractionHistory] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [pageCount, setPageCount] = useState(1);

    useEffect(() => {
        if (!session) {
            router.push("/login");
        } else if (session?.user.role !== "ADMIN") {
            router.push("/");
        }
    }, [session, router]);

    useEffect(() => {
            if (!router.isReady) return;
            const { page } = router.query;
            if (page) setCurrentPage(Number(page));
    
            fetchAndSetInteractionHistory();
        }, [router.query]);

    const fetchAndSetInteractionHistory = async () => {
            if (session && session.accessToken && session.refreshToken) {
                try {
                    const interactions = await getInteractions(session.accessToken, session.refreshToken);
                    setInteractions(interactions.interactions || []);
                    setPageCount(Math.ceil(interactions.numberOfInteractions / pageSize));
                } catch (error) {
                    console.error("Error fetching interaction history:", error);
                }
            } else {
                router.push("/login");
            }
        };
    
        const handlePrevPage = () => {
            if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        };
    
        const handleNextPage = () => {
            if (currentPage < pageCount) {
                setCurrentPage(currentPage + 1);
            }
        };
    
        const handlePageChange = (page: number) => {
            setCurrentPage(page);
        };

    

    const handleAddInteraction = async () => {
        if (!interactionType.trim() && !question.trim() && !imageUrl.trim()) {
            setError("All fields can't be empty.");
            return;
        }

        try {
            if (session && session.accessToken && session.refreshToken) {
                await addInteraction(session.accessToken, session.refreshToken, {
                    type: interactionType,
                    question,
                    imageUrl,
                });
            } else {
                setError("Session is invalid. Please log in again.");
            }
            
            setMessage("Interaction added successfully!");
            setInteractionType("");
            setQuestion("");
            setImageUrl("");
            fetchAndSetInteractionHistory(); // Refresh the interaction history
            setError(null); // Clear any previous error messages
        } catch (error: any) {
            console.error("Error adding interaction:", error);
            setError(error.message || "Failed to add interaction");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-textcolor">
            <div className="bg-yellow-600 text-black w-full text-center p-2">
                This is Admin Wizardry. I sure hope you know what spells you're casting!
            </div>
            <h1 className="text-3xl font-semibold p-4">Add Interaction</h1>
            <div className="w-full max-w-lg p-4">
                <Input
                    type="text"
                    placeholder="Enter interaction type"
                    value={interactionType}
                    onChange={(e) => setInteractionType(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                />
                <Input
                    type="text"
                    placeholder="Enter question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full mt-4"
                />
                <Input
                    type="text"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full mt-4"
                />
                <Button onClick={handleAddInteraction} className="mt-4">
                    Add Interaction
                </Button>
                {error && (
                    <div className="text-red-500 text-center mt-4">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="text-green-500 text-center mt-4">
                        {message}
                    </div>
                )}
            </div>
            <section className="w-full max-w-5xl mt-10">
                <div className="p-6 bg-background m-10">
                <h1 className="text-2xl font-bold mb-6">Current Interaction History</h1>

                <div className="grid grid-cols-1 gap-4">
                    {interactions.length === 0 ? (
                    <p className="text-gray-600">No interaction history available.</p>
                    ) : (
                    interactions
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((interaction: Interaction) => (
                        <div key={interaction.id} className="bg-background p-6 border shadow rounded w-full max-w-full">
                            <h2 className="text-xl font-bold">{interaction.type}</h2>
                            <p className="text-sm text-gray-500 mb-4">
                            Time: {new Date(interaction.timestamp).toLocaleString()}
                            </p>
                            {interaction.question && (
                                <p className="text-gray-500">Question: {interaction.question}</p>
                            )}
                            {interaction.imageUrl && (
                                <p className="text-gray-500">Image: {interaction.imageUrl}</p>
                            )}
                        </div>
                        ))
                    )}

                    {/* Pagination */}
                    <div className="flex justify-center mt-5">
                    <Pagination>
                        <PaginationContent className="flex flex-row justify-center gap-2">
                        <PaginationItem>
                            <PaginationPrevious
                            className={`${currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={handlePrevPage}
                            >
                            Previous
                            </PaginationPrevious>
                        </PaginationItem>

                        {Array.from({ length: pageCount }, (_, index) => (
                            <PaginationItem key={index}>
                            <PaginationLink
                                isActive={currentPage === index + 1}
                                onClick={() => handlePageChange(index + 1)}
                            >
                                {index + 1}
                            </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                            className={`${currentPage >= pageCount ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={handleNextPage}
                            >
                            Next
                            </PaginationNext>
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                    </div>
                </div>
                </div>
            </section>
        </div>
    );
}
