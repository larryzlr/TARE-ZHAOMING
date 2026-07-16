// src/app/not-found.tsx
// 全局404页面 - 纯静态，不使用getTranslations避免构建时访问数据库

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">404 - The page you are looking for does not exist.</p>
      <a
        href="/en"
        className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition duration-300"
      >
        Back to Home
      </a>
    </div>
  );
}
