"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FileText, Video, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Blog } from "@/types";
import { getBlogs } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

export function BlogsList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const {
    data: blogs = [],
    isLoading,
    isError,
  } = useQuery<Blog[]>({
    queryKey: ["blogs"],
    queryFn: getBlogs,
  });

  const groupedByGrade = useMemo(() => {
    return blogs.reduce((acc, blog) => {
      const { grade } = blog;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(blog);
      return acc;
    }, {} as Record<string, Blog[]>);
  }, [blogs]);

  const grades = useMemo(() => Object.keys(groupedByGrade), [groupedByGrade]);

  const unitsForSelectedGrade = useMemo(() => {
    if (!selectedGrade || !groupedByGrade[selectedGrade]) return [];
    const blogsInGrade = groupedByGrade[selectedGrade];
    const units = [...new Set(blogsInGrade.map((blog) => blog.unit))];
    return units;
  }, [selectedGrade, groupedByGrade]);

  const contentForSelectedUnit = useMemo(() => {
    if (!selectedGrade || !selectedUnit || !groupedByGrade[selectedGrade])
      return {};
    const blogsInUnit = groupedByGrade[selectedGrade].filter(
      (blog) => blog.unit === selectedUnit
    );
    return blogsInUnit.reduce((acc, blog) => {
      const { lesson } = blog;
      if (!acc[lesson]) {
        acc[lesson] = [];
      }
      acc[lesson].push(blog);
      return acc;
    }, {} as Record<string, Blog[]>);
  }, [selectedGrade, selectedUnit, groupedByGrade]);

  useEffect(() => {
    if (grades.length > 0 && !selectedGrade) {
      setSelectedGrade(grades[0]);
    }
  }, [grades, selectedGrade]);

  useEffect(() => {
    if (
      unitsForSelectedGrade.length > 0 &&
      (!selectedUnit || !unitsForSelectedGrade.includes(selectedUnit))
    ) {
      setSelectedUnit(unitsForSelectedGrade[0]);
    }
  }, [unitsForSelectedGrade, selectedUnit]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      const cards = gsap.utils.toArray(".blog-card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current!,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedGrade, selectedUnit]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    const newUnits = groupedByGrade[grade]
      ? [...new Set(groupedByGrade[grade].map((b) => b.unit))]
      : [];
    setSelectedUnit(newUnits.length > 0 ? newUnits[0] : null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>جاري تحميل الشروحات...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>حدث خطأ أثناء تحميل الشروحات. يرجى المحاولة مرة أخرى.</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>لا يوجد محتوى متاح حاليًا.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white">
      <div className="w-full mb-12">
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src="/blogs-banner.jpg"
            alt="Blogs Banner"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
      <div className="container mx-auto px-4 pb-12">
        <div className="flex flex-wrap gap-4 mb-8 border-b-2 border-gray-100 pb-4">
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => handleGradeChange(grade)}
              className={`px-6 py-2 text-lg font-semibold rounded-t-lg transition-all duration-300 ${
                selectedGrade === grade
                  ? "border-b-4 border-emerald-800 text-emerald-800"
                  : "text-gray-500 hover:text-emerald-700"
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
        {selectedGrade && unitsForSelectedGrade.length > 0 && (
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {unitsForSelectedGrade.map((unit) => (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-6 py-2 text-md font-semibold rounded-full transition-all duration-300 ${
                  selectedUnit === unit
                    ? "bg-emerald-800 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        )}
        <div className="p-6 min-h-[500px]">
          {selectedUnit && Object.keys(contentForSelectedUnit).length > 0 ? (
            Object.keys(contentForSelectedUnit).map((lesson) => (
              <div key={lesson} className="mb-8">
                <h4 className="text-xl font-bold mb-6 text-gray-600 border-l-4 border-emerald-800 pl-4">
                  {lesson}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {contentForSelectedUnit[lesson].map((blog) => (
                    <Link
                      href={`/blogs/${blog._id}`}
                      key={blog._id}
                      className="blog-card group"
                    >
                      <div className="bg-white border-t border-l border-gray-200 rounded-tl-[40px] overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
                        <div className="relative h-56 w-full">
                          <Image
                            src={
                              blog.coverImage || "https://picsum.photos/800/600"
                            }
                            alt={blog.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md">
                            {blog.type === "video" && (
                              <Video className="text-red-500" size={24} />
                            )}
                            {blog.type === "pdf" && (
                              <FileText className="text-blue-500" size={24} />
                            )}
                          </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col justify-between">
                          <div>
                            <h5 className="mb-3 text-xl font-bold tracking-tight text-gray-900">
                              {blog.name}
                            </h5>
                            <p className="font-normal text-gray-600 text-sm mb-4">
                              {blog.description.substring(0, 100)}...
                            </p>
                          </div>
                          <div className="flex items-center gap-3 justify-end text-emerald-800 font-semibold">
                            اقرأ المزيد
                            <ArrowRight
                              className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                              size={20}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>لا توجد دروس متاحة في هذه الوحدة حاليًا.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
