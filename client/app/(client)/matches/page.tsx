"use client";

import { useEffect, useState } from "react";
import { matchService } from "@/lib/services/match.service";
import { Match } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";

export default function MatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            const data = await matchService.getOpenMatches();
            setMatches(data.data);
        } catch (error) {
            toast.error("Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (matchId: number) => {
        try {
            await matchService.joinMatch(matchId);
            toast.success("Joined match successfully!");
            loadMatches(); // Refresh
        } catch (error) {
            toast.error("Failed to join match");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Find a Match</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.length === 0 && (
                    <p className="text-gray-500 col-span-full">No open matches found.</p>
                )}
                {matches.map((match) => (
                    <Card key={match.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Match #{match.id}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Venue ID:</span>
                                    <span>{match.venueId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span>{format(new Date(match.date), 'PPP')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Time:</span>
                                    <span>{match.startTime} - {match.endTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Players:</span>
                                    <span>{match.players?.length || 0} / 4</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleJoin(match.id)}>
                                Join Match
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
