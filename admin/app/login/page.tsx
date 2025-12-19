import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#191919] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">منصة الأستاذ أكرم مسلم</h1>
          <p className="text-muted-foreground">لوحة تحكم المسؤول</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
