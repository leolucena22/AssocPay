"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { month: "Out", value: 12400 },
  { month: "Nov", value: 14200 },
  { month: "Dez", value: 13800 },
  { month: "Jan", value: 15600 },
  { month: "Fev", value: 16900 },
  { month: "Mar", value: 18450 },
];

const maxValue = Math.max(...data.map((d) => d.value));

export function RevenueChart() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-bold">
          Receita Mensal
        </CardTitle>
        <CardDescription>Últimos 6 meses de arrecadação</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="flex items-end gap-3 h-52">
          {data.map((item, i) => {
            const height = (item.value / maxValue) * 100;
            const isLast = i === data.length - 1;
            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                {/* Value label */}
                <span className="text-xs font-medium text-muted-foreground">
                  {(item.value / 1000).toFixed(1)}k
                </span>
                {/* Bar */}
                <div className="w-full relative">
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                      isLast
                        ? "bg-primary shadow-lg shadow-primary/20"
                        : "bg-primary/20 hover:bg-primary/30"
                    }`}
                    style={{
                      height: `${height * 1.8}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                {/* Month label */}
                <span
                  className={`text-xs font-medium ${
                    isLast ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
            <p className="text-lg font-bold font-heading">
              R${" "}
              {(data.reduce((acc, d) => acc + d.value, 0) / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            +9.2% crescimento
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
