import dashboard from "@/public/dashboard.svg";
import students from "@/public/students.svg";
import results from "@/public/results.svg";
import blogs from "@/public/blogs.svg";
import books from "@/public/book.svg";
import people from "@/public/people.svg";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  className?: string;
  children?: NavItem[];
};

export const topNavItems: NavItem[] = [
  { label: "الرئيسية", href: "/", icon: dashboard },
  { label: "الطلاب", href: "/students", icon: students },
  { label: "الامتحانات", href: "/exams", icon: books },
  { label: "الشروحات", href: "/blogs", icon: blogs },
  { label: "نتائج الامتحانات", href: "/results", icon: results },
  { label: "الآراء", href: "/testimonials", icon: people },
];
