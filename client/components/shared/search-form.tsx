"use client";

import { useState, FormEvent, FC } from "react";
import { motion } from "framer-motion";
import { AlertCircle, LoaderCircle, Search } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-gray-600">{description}</p>
      <form
        onSubmit={onSubmit}
        className="mt-8 flex flex-col sm:flex-row items-start gap-4"
      >
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="أدخل الكود هنا..."
          className="h-12 text-center text-lg tracking-widest"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full sm:w-auto bg-[#6b5bd8] hover:bg-[#5b4ec1]"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          <span className="mr-2">بحث</span>
        </Button>
      </form>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
};
