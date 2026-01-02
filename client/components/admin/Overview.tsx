"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Overview() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-gray-400">
                    Chart Placeholder
                </div>
            </CardContent>
        </Card>
    );
}
