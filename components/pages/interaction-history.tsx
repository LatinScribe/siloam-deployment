import { SessionContext } from "@/contexts/session";
import React, { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Interaction } from "@/utils/types"; // Assuming you have an Interaction type defined
import { getInteractions, deleteInteractions } from "@/utils/accountInterface";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function InteractionHistoryPage() {
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [pageCount, setPageCount] = useState(1);

    const { session } = useContext(SessionContext);
    const router = useRouter();

    useEffect(() => {
        if (!session || !session?.accessToken || !session?.refreshToken) {
            router.replace("/login");
        }
    }, [session, router]);

    useEffect(() => {
        if (!router.isReady) return;
        const { page } = router.query;
        const parsedPage = parseInt(page as string, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) {
            setCurrentPage(parsedPage);
            console.log("Current page", currentPage);
        } else {
            setCurrentPage(1); // default to page 1
            console.log("Current page", currentPage);
        }
        fetchAndSetInteractionHistory();
    }, [router.query, router.isReady]);

    useEffect(() => {
        if (router.isReady) {
            router.push(
                {
                    pathname: "/interaction-history",
                    query: { page: currentPage || undefined },
                },
                undefined,
                { shallow: true }
            );
        }
        // fetchAndSetInteractionHistory();
    }, [currentPage]);

    const fetchAndSetInteractionHistory = async () => {
        if (session && session.accessToken && session.refreshToken) {
            try {
                const interactions = await getInteractions(session.accessToken, session.refreshToken);
                const inorderedInteractions = interactions.interactions
                const reverseInteractions = inorderedInteractions.reverse();
                setInteractions(reverseInteractions || []);
                setPageCount(Math.ceil(interactions.interactions.length / pageSize));
                console.log("Page size", pageSize);
                console.log("Number of interactions", interactions.interactions.length);
                console.log("Expected page count", Math.ceil(interactions.interactions.length / pageSize));
                console.log("pageCount", pageCount);
            } catch (error) {
                console.error("Error fetching interaction history:", error);
            }
        } else {
            router.push("/login");
        }
    };

    const handleInteractionDelete = async () => {
        if (session && session.accessToken && session.refreshToken) {
            try {
                await deleteInteractions(session.accessToken, session.refreshToken);
                fetchAndSetInteractionHistory();
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
            console.log("Current page", currentPage);
            router.push(`/interaction-history?page=${currentPage - 1}`);
        }
    };

    const handleNextPage = () => {
        if (currentPage < pageCount) {
            setCurrentPage(currentPage + 1);
            console.log("Current page", currentPage);
            router.push(`/interaction-history?page=${currentPage + 1}`);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        console.log("Current page", currentPage);
    };

    return (
        <div className="p-6 bg-background min-h-screen m-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Interaction History</h1>
                <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="bg-red-500 text-white hover:bg-red-600">
                                Delete History
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Confirm Delete
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {session?.user?.username}, are you sure you want to Delete your interaction history?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleInteractionDelete} className="bg-destructive">
                                    Delete History
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {interactions.length === 0 ? (
                    <p className="text-gray-600">No interaction history available.</p>
                ) : (
                    interactions
                        ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
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
                                className={`${
                                    currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                // disabled={currentPage <= 1}
                                onClick={() => {
                                    try {
                                    if (currentPage > 1) {
                                        const newPage = currentPage - 1;
                                        setCurrentPage(newPage); // update the current page state
                                        console.log("Current page", currentPage);
                                        router.push(`/interaction-history?page=${newPage}`);
                                    }
                                } catch (error) {
                                    console.error("History fetch failed:", error);
                                    toast.error("Failed to fetch History.");
                                }}
                            }
                            >
                                Previous
                            </PaginationPrevious>
                        </PaginationItem>

                            {Array.from({ length: pageCount }, (_, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        isActive={currentPage === index + 1}
                                        onClick={() => {
                                            try {
                                            // update current page and fetch blogs for that page
                                            const newPage = index + 1;
                                            setCurrentPage(newPage); // update the current page state
                                            console.log("Current page", currentPage);
                                            router.push(`/interaction-history?page=${newPage}`);
                                            } catch (error) {
                                                console.error("History fetch failed:", error);
                                                toast.error("Failed to fetch history.");
                                            }
                                        }}
                                    >
                                        {index + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    className={`${
                                        currentPage >= pageCount ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    // disabled={currentPage >= pageCount}
                                    onClick={() => {
                                        try {
                                        if (currentPage < pageCount) {
                                            const newPage = currentPage + 1;
                                            setCurrentPage(newPage); // update the current page state
                                            console.log("Current page", currentPage);
                                            router.push(`/interaction-history?page=${newPage}`);
                                        }
                                    } catch (error) {
                                        console.error("History fetch failed:", error);
                                        toast.error("Failed to fetch history.");
                                    }
                                    }}
                                >
                                    Next
                                </PaginationNext>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}
