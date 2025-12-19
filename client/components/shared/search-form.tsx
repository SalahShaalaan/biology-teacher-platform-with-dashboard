"use client";

import { useState, FormEvent, FC } from "react";
import { motion } from "framer-motion";
import { User, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SearchFormProps {
  title: string;
  description: string;
  handleSearch: (code: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const SearchForm: FC<SearchFormProps> = ({
  title,
  description,
  handleSearch,
  isLoading,
  error,
}) => {
  const [code, setCode] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    handleSearch(code);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-none border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="أدخل الكود هنا"
                  onKeyDown={(e) => e.key === "Enter" && onSubmit(e)}
                  className="text-center text-lg p-6 pe-12"
                  disabled={isLoading}
                  dir="ltr"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-lg p-6 bg-[#295638] hover:bg-[#295638]/90 cursor-pointer"
              >
                {isLoading ? (
                  "جاري التحقق..."
                ) : (
                  <>
                    <Search className="ms-2 h-5 w-5" />
                    <span>عرض الاختبارات</span>
                  </>
                )}
              </Button>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
