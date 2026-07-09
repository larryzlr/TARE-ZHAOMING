import { getAllProducts } from '@/lib/product-service';
import ImageUploader from '@/components/ImageUploader';

type DashboardPageProps = {
  params: { locale: string };
};

export default async function DashboardPage({ params: { locale } }: DashboardPageProps) {
  let totalProducts = 0;
  let publishedProducts = 0;
  let draftProducts = 0;

  try {
    const allProducts = await getAllProducts(locale, 'published');
    publishedProducts = allProducts.length;

    const draftProductsList = await getAllProducts(locale, 'draft');
    draftProducts = draftProductsList.length;

    totalProducts = publishedProducts + draftProducts;
  } catch (e) {
    console.error('Failed to load dashboard data:', e);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">仪表板</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">产品总数</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{totalProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">已发布</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{publishedProducts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">草稿</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{draftProducts}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href={`/${locale}/admin/products/new`} className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <h3 className="font-medium text-gray-800">+ 添加新产品</h3>
            <p className="text-sm text-gray-500 mt-1">创建支持多语言的新产品</p>
          </a>
          <a href={`/${locale}/admin/settings`} className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <h3 className="font-medium text-gray-800">⚙ 站点设置</h3>
            <p className="text-sm text-gray-500 mt-1">配置公司信息、WhatsApp、微信等</p>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">图片上传</h2>
        <p className="text-sm text-gray-500 mb-4">上传后将自动生成可使用的 URL 链接</p>
        <ImageUploader buttonText="上传图片" />
      </div>
    </div>
  );
}
