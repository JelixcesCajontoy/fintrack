
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BarChartHorizontalBig, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { loadAppData } from "@/lib/storage";
import type { AppData, MonthlyReport } from "@/types";
import { format, parse } from "date-fns";
import { formatCurrency, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function MonthlyReportsPage() {
    const { user } = useAuth();
    const [appData, setAppData] = React.useState<AppData | null>(null);
    const [isLoaded, setIsLoaded] = React.useState(false);
    
    const [fromDate, setFromDate] = React.useState<string | undefined>(undefined);
    const [toDate, setToDate] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        if (user) {
            const data = loadAppData();
            setAppData(data);
            setIsLoaded(true);

            if (data.monthlyReports && data.monthlyReports.length > 0) {
                const sortedMonths = data.monthlyReports.map(r => r.month).sort();
                setFromDate(sortedMonths[0]);
                setToDate(sortedMonths[sortedMonths.length - 1]);
            }
        }
    }, [user]);

    const availableMonths = React.useMemo(() => {
        if (!appData?.monthlyReports) return [];
        return [...new Set(appData.monthlyReports.map(r => r.month))].sort().reverse();
    }, [appData?.monthlyReports]);

    const filteredReports = React.useMemo(() => {
        if (!appData?.monthlyReports) return [];
        if (!fromDate || !toDate) return appData.monthlyReports;

        return appData.monthlyReports.filter(report => {
            return report.month >= fromDate && report.month <= toDate;
        });
    }, [appData?.monthlyReports, fromDate, toDate]);

    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="flex items-center p-4 border-b sticky top-0 bg-background z-10">
                <Link href="/profile" passHref>
                    <Button asChild variant="ghost" size="icon" aria-label="Back to Profile">
                       <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2">Monthly Reports</h1>
            </div>

            {isLoaded && availableMonths.length > 0 && (
                 <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                        <Label htmlFor="from-month">From</Label>
                        <Select value={fromDate} onValueChange={setFromDate}>
                            <SelectTrigger id="from-month">
                                <SelectValue placeholder="Select start month" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMonths.map(month => (
                                    <SelectItem key={`from-${month}`} value={month}>
                                        {format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex-1 space-y-1.5">
                        <Label htmlFor="to-month">To</Label>
                         <Select value={toDate} onValueChange={setToDate}>
                            <SelectTrigger id="to-month">
                                <SelectValue placeholder="Select end month" />
                            </SelectTrigger>
                            <SelectContent>
                                 {availableMonths.filter(m => !fromDate || m >= fromDate).map(month => (
                                    <SelectItem key={`to-${month}`} value={month}>
                                        {format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <ScrollArea className="flex-grow p-4">
                {!isLoaded ? (
                     <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                    </div>
                ) : !filteredReports || filteredReports.length === 0 ? (
                    <Card className="border-dashed mt-4">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <Calendar className="mx-auto h-8 w-8 mb-2" />
                            <p className="font-semibold">No Reports Found</p>
                            <p className="text-sm">
                                {availableMonths.length > 0
                                    ? "No reports match your current filter criteria."
                                    : "Your first report will be saved here automatically at the start of next month."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {filteredReports.map((report) => (
                             <AccordionItem value={report.month} key={report.month} className="border-b-0">
                                <Card className="rounded-lg shadow-sm">
                                    <AccordionTrigger className="p-4 hover:no-underline rounded-lg data-[state=open]:bg-secondary/50">
                                        <div className="flex flex-col items-start text-left">
                                            <p className="font-semibold text-base">{format(parse(report.month, 'yyyy-MM', new Date()), 'MMMM yyyy')}</p>
                                            <p className={cn("text-sm", report.netSavings >= 0 ? 'text-accent' : 'text-destructive')}>
                                                Net Savings: {formatCurrency(report.netSavings)}
                                            </p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="space-y-3 pt-2 border-t">
                                             <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4"/>Total Income</span>
                                                <span className="font-medium text-accent">{formatCurrency(report.totalIncome)}</span>
                                             </div>
                                             <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-muted-foreground"><TrendingDown className="h-4 w-4"/>Total Expenses</span>
                                                <span className="font-medium">{formatCurrency(report.totalExpenses)}</span>
                                             </div>

                                            {report.expenseBreakdown.length > 0 && (
                                                <div className="pt-2">
                                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><BarChartHorizontalBig className="h-4 w-4"/>Expense Breakdown</h4>
                                                    <div className="space-y-1 pl-2">
                                                        {report.expenseBreakdown.sort((a,b) => b.amount - a.amount).map(item => (
                                                            <div key={item.categoryId} className="flex justify-between items-center text-xs">
                                                                <span className="text-muted-foreground">{item.categoryLabel}</span>
                                                                <span className="font-mono">{formatCurrency(item.amount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </ScrollArea>
             <div className="p-4 text-center text-xs text-muted-foreground border-t">
                Reports are auto-generated at the start of each new month.
            </div>
        </div>
    );
}
