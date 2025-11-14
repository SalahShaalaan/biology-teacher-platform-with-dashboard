import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  iconUrl: string;
  iconBgColor: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  iconUrl,
  iconBgColor,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col shadow-none", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            iconBgColor
          )}
        >
          <Image
            src={iconUrl}
            alt={title}
            width={20}
            height={20}
            className="brightness-50"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
