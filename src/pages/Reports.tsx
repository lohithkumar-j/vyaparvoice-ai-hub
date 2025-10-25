import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["reports", reportType, dateRange, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      if (reportType === "sales") {
        const { data } = await supabase
          .from("sales")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", dateRange.from.toISOString())
          .lte("date", dateRange.to.toISOString())
          .order("date", { ascending: false });
        return data;
      } else if (reportType === "inventory") {
        const { data } = await supabase
          .from("inventory")
          .select("*")
          .eq("user_id", user.id);
        return data;
      } else if (reportType === "customers") {
        const { data } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
          .order("balance", { ascending: true });
        return data;
      }
      return null;
    },
    enabled: !!user?.id,
  });

  const downloadReport = () => {
    if (!reportData) return;

    let csvContent = "";
    if (reportType === "sales") {
      csvContent = "Date,Amount,Items\n";
      reportData.forEach((sale: any) => {
        csvContent += `${new Date(sale.date).toLocaleDateString()},${sale.amount},"${JSON.stringify(sale.items)}"\n`;
      });
    } else if (reportType === "inventory") {
      csvContent = "Product,Category,Quantity,Price,Value\n";
      reportData.forEach((item: any) => {
        csvContent += `${item.name},${item.category},${item.quantity},${item.price},${item.quantity * item.price}\n`;
      });
    } else if (reportType === "customers") {
      csvContent = "Name,Phone,Balance,Last Transaction\n";
      reportData.forEach((customer: any) => {
        csvContent += `${customer.name},${customer.phone},${customer.balance},${customer.last_transaction || "N/A"}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and download business reports</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="customers">Customer Ledger</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "sales" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.from, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.to, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            <Button onClick={downloadReport} disabled={!reportData || isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          {isLoading ? (
            <p className="text-center py-12">Loading report data...</p>
          ) : !reportData || reportData.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {reportType === "sales" && (
                      <>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Items</th>
                      </>
                    )}
                    {reportType === "inventory" && (
                      <>
                        <th className="text-left p-3">Product</th>
                        <th className="text-left p-3">Category</th>
                        <th className="text-left p-3">Quantity</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Total Value</th>
                      </>
                    )}
                    {reportType === "customers" && (
                      <>
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Phone</th>
                        <th className="text-left p-3">Balance</th>
                        <th className="text-left p-3">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {reportType === "sales" && (
                        <>
                          <td className="p-3">{new Date(row.date).toLocaleDateString()}</td>
                          <td className="p-3">₹{row.amount.toFixed(2)}</td>
                          <td className="p-3">{JSON.stringify(row.items)}</td>
                        </>
                      )}
                      {reportType === "inventory" && (
                        <>
                          <td className="p-3">{row.name}</td>
                          <td className="p-3">{row.category}</td>
                          <td className="p-3">{row.quantity}</td>
                          <td className="p-3">₹{row.price.toFixed(2)}</td>
                          <td className="p-3">₹{(row.quantity * row.price).toFixed(2)}</td>
                        </>
                      )}
                      {reportType === "customers" && (
                        <>
                          <td className="p-3">{row.name}</td>
                          <td className="p-3">{row.phone}</td>
                          <td className="p-3 font-semibold">₹{Math.abs(row.balance).toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.balance < 0 ? "bg-destructive/10 text-destructive" :
                              row.balance > 0 ? "bg-success/10 text-success" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {row.balance < 0 ? "Due" : row.balance > 0 ? "Advance" : "Settled"}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;
