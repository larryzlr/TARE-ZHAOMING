'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/Toast';

interface ImageItem {
  url: string;
  pathname: string;
  filename: string;
  size: number;
  sizeFormatted: string;
  uploadedAt: string;
  format: string;
  used: boolean;
}

export default function ImagesManagementPage() {
  const toast = useToast();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [usedCount, setUsedCount] = useState(0);
  const [unusedCount, setUnusedCount] = useState(0);

  // 筛选条件
  const [search, setSearch] = useState('');
  const [usageFilter, setUsageFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // 选择状态
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 预览状态
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotate, setPreviewRotate] = useState(0);

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (usageFilter !== 'all') params.set('usage', usageFilter);
      if (formatFilter !== 'all') params.set('format', formatFilter);
      if (sortBy !== 'date-desc') params.set('sortBy', sortBy);

      const res = await fetch(`/api/images?${params}`);
      const data = await res.json();
      if (res.ok) {
        setImages(data.images || []);
        setTotal(data.total || 0);
        setUsedCount(data.usedCount || 0);
        setUnusedCount(data.unusedCount || 0);
      } else {
        toast('error', data.error || '加载图片失败');
      }
    } catch {
      toast('error', '网络错误');
    } finally {
      setLoading(false);
    }
  }, [search, usageFilter, formatFilter, sortBy, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchInput = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
    }, 350);
  };

  const toggleSelect = (url: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === images.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(images.map(i => i.url)));
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('success', 'URL 已复制');
    } catch {
      toast('error', '复制失败');
    }
  };

  const handleDelete = (urls: string[]) => {
    setDeleteTarget(urls);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteTarget.length === 0) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: deleteTarget }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('success', `已删除 ${data.deleted} 张图片`);
        setSelected(new Set());
        setDeleteTarget(null);
        fetchData();
      } else {
        toast('error', data.error || '删除失败');
      }
    } catch {
      toast('error', '网络错误');
    } finally {
      setDeleting(false);
    }
  };

  const openPreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewZoom(1);
    setPreviewRotate(0);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewZoom(1);
    setPreviewRotate(0);
  };

  // 键盘控制预览
  useEffect(() => {
    if (!previewUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      else if (e.key === '+' || e.key === '=') setPreviewZoom(z => Math.min(z + 0.25, 4));
      else if (e.key === '-') setPreviewZoom(z => Math.max(z - 0.25, 0.25));
      else if (e.key === 'r' || e.key === 'R') setPreviewRotate(r => (r + 90) % 360);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [previewUrl]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">图片管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {total} 张 · <span className="text-green-600">已使用 {usedCount}</span> · <span className="text-orange-500">未使用 {unusedCount}</span>
          </p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">已选 {selected.size} 张</span>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
            >
              取消选择
            </button>
            <button
              onClick={() => handleDelete(Array.from(selected))}
              className="px-4 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* 筛选工具栏 */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-400"
              placeholder="搜索文件名..."
            />
          </div>
          {/* 使用状态筛选 */}
          <select
            value={usageFilter}
            onChange={e => setUsageFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">全部状态</option>
            <option value="used">已使用</option>
            <option value="unused">未使用</option>
          </select>
          {/* 格式筛选 */}
          <select
            value={formatFilter}
            onChange={e => setFormatFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">全部格式</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
            <option value="svg">SVG</option>
          </select>
          {/* 排序 */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="date-desc">上传时间 ↓</option>
            <option value="date-asc">上传时间 ↑</option>
            <option value="size-desc">文件大小 ↓</option>
            <option value="size-asc">文件大小 ↑</option>
          </select>
        </div>
      </div>

      {/* 图片网格 */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center text-gray-400">
          {search || usageFilter !== 'all' || formatFilter !== 'all' ? '未找到匹配的图片' : '暂无图片，上传图片后会在此显示'}
        </div>
      ) : (
        <>
          {/* 全选 */}
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {selected.size === images.length ? '取消全选' : '全选'}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map(img => {
              const isSelected = selected.has(img.url);
              return (
                <div
                  key={img.url}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 transition cursor-pointer ${
                    isSelected ? 'border-primary-500' : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div
                    className="relative aspect-square bg-gray-50 group"
                    onClick={() => toggleSelect(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                    {/* 使用状态标签 */}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs rounded-full ${
                      img.used ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {img.used ? '已使用' : '未使用'}
                    </span>
                    {/* 选中标识 */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                    )}
                    {/* 悬浮操作 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); openPreview(img.url); }}
                        className="px-3 py-1.5 bg-white/90 text-gray-800 rounded-md text-xs font-medium mr-2 hover:bg-white"
                      >
                        预览
                      </button>
                      {!img.used && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete([img.url]); }}
                          className="px-3 py-1.5 bg-red-500/90 text-white rounded-md text-xs font-medium hover:bg-red-500"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-2.5 space-y-1">
                    <p className="text-xs text-gray-700 font-medium truncate" title={img.filename}>{img.filename}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{img.sizeFormatted}</span>
                      <span className="uppercase">{img.format}</span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(img.uploadedAt).toLocaleString('zh-CN')}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyUrl(img.url); }}
                      className="w-full mt-1 px-2 py-1 text-xs text-primary-600 border border-primary-200 rounded hover:bg-primary-50 transition"
                    >
                      复制URL
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要删除 {deleteTarget.length} 张图片吗？此操作不可恢复。
            </p>
            {deleteTarget.length <= 3 && (
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                {deleteTarget.map(url => (
                  <div key={url} className="flex items-center gap-2 text-xs text-gray-500">
                    <img src={url} alt="" className="w-10 h-10 object-contain border rounded" />
                    <span className="truncate">{url.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览弹窗 */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={closePreview}>
          {/* 工具栏 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewZoom(z => Math.max(0.25, z - 0.25))}
              className="w-9 h-9 flex items-center justify-center text-white text-xl hover:bg-white/20 rounded"
              title="缩小 (-)"
            >
              −
            </button>
            <span className="text-white text-sm px-2">{Math.round(previewZoom * 100)}%</span>
            <button
              onClick={() => setPreviewZoom(z => Math.min(4, z + 0.25))}
              className="w-9 h-9 flex items-center justify-center text-white text-xl hover:bg-white/20 rounded"
              title="放大 (+)"
            >
              +
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button
              onClick={() => setPreviewRotate(r => (r + 90) % 360)}
              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded"
              title="旋转 (R)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            <button
              onClick={() => handleCopyUrl(previewUrl)}
              className="px-3 h-9 flex items-center justify-center text-white text-sm hover:bg-white/20 rounded"
              title="复制URL"
            >
              复制URL
            </button>
            <button
              onClick={closePreview}
              className="w-9 h-9 flex items-center justify-center text-white text-xl hover:bg-white/20 rounded"
              title="关闭 (ESC)"
            >
              ✕
            </button>
          </div>
          <img
            src={previewUrl}
            alt="预览"
            onClick={e => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] object-contain transition-transform"
            style={{
              transform: `scale(${previewZoom}) rotate(${previewRotate}deg)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
