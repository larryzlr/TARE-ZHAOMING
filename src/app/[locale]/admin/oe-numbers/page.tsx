'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/Toast';

interface OeNumber {
  id: string;
  oeNumber: string;
  brand: string;
  model: string;
  resultType: string;
  sortOrder: number;
  createdAt: string;
}

const PAGE_SIZE_KEY = 'oe-pageSize';
const PAGE_KEY = 'oe-page';
const SEARCH_KEY = 'oe-search';

export default function OeNumbersPage() {
  const toast = useToast();
  const [oeNumbers, setOeNumbers] = useState<OeNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(PAGE_KEY);
    return saved ? Math.max(1, parseInt(saved)) : 1;
  });
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') return 20;
    const saved = localStorage.getItem(PAGE_SIZE_KEY);
    return saved ? parseInt(saved) : 20;
  });
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(SEARCH_KEY) || '';
  });
  const [searchInput, setSearchInput] = useState(search);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState({
    oeNumber: '',
    brand: '',
    model: '',
    resultType: 'supported',
    sortOrder: 0,
  });
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set('search', search);
      const res = await fetch(`/api/oe-numbers?${params}`);
      const data = await res.json();
      setOeNumbers(data.oeNumbers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      // 如果当前页超出总页数，回到最后一页
      if (data.totalPages && page > data.totalPages && data.totalPages > 0) {
        setPage(data.totalPages);
      }
    } catch {
      toast('error', '加载OE号列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 持久化分页/搜索状态
  useEffect(() => { localStorage.setItem(PAGE_KEY, String(page)); }, [page]);
  useEffect(() => { localStorage.setItem(PAGE_SIZE_KEY, String(pageSize)); }, [pageSize]);
  useEffect(() => { localStorage.setItem(SEARCH_KEY, search); }, [search]);

  // 搜索防抖
  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 350);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...form } : form;
      const res = await fetch('/api/oe-numbers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast('success', editingId ? 'OE号更新成功！' : 'OE号添加成功！');
        setShowForm(false);
        setEditingId(null);
        setForm({ oeNumber: '', brand: '', model: '', resultType: 'supported', sortOrder: 0 });
        fetchData();
      } else {
        toast('error', data.error || '操作失败');
      }
    } catch {
      toast('error', '网络错误');
    }
  };

  const handleEdit = (item: OeNumber) => {
    setEditingId(item.id);
    setForm({
      oeNumber: item.oeNumber,
      brand: item.brand,
      model: item.model,
      resultType: item.resultType,
      sortOrder: item.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此OE号？')) return;
    try {
      const res = await fetch(`/api/oe-numbers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('success', 'OE号已删除');
        fetchData();
      } else {
        toast('error', '删除失败');
      }
    } catch {
      toast('error', '网络错误');
    }
  };

  const handleImport = async () => {
    const lines = importText.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return;

    setImporting(true);
    let success = 0, fail = 0;
    const failures: string[] = [];
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      try {
        const res = await fetch('/api/oe-numbers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oeNumber: parts[0].toUpperCase(),
            brand: parts[1] || '',
            model: parts[2] || '',
            resultType: 'supported',
          }),
        });
        if (res.ok) {
          success++;
        } else {
          const err = await res.json().catch(() => ({}));
          fail++;
          failures.push(`${parts[0]}: ${err.error || '失败'}`);
        }
      } catch {
        fail++;
        failures.push(`${parts[0]}: 网络错误`);
      }
    }
    setImporting(false);
    if (fail > 0) {
      toast('error', `导入完成：成功${success}条，失败${fail}条。详情：${failures.slice(0, 3).join('；')}${failures.length > 3 ? '...' : ''}`);
    } else {
      toast('success', `导入完成：成功${success}条`);
    }
    setShowImport(false);
    setImportText('');
    fetchData();
  };

  // 高亮搜索关键字
  const highlight = (text: string) => {
    if (!search || !text) return text;
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  // 分页页码生成
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);
    if (left > 1) { range.push(1); if (left > 2) range.push('...'); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) { if (right < totalPages - 1) range.push('...'); range.push(totalPages); }
    return range;
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">OE号管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理OE号查询表，共 {total} 条记录</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(v => !v)}
            className="px-4 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md text-sm hover:bg-blue-100"
          >
            批量导入
          </button>
          <button
            onClick={() => { setEditingId(null); setForm({ oeNumber: '', brand: '', model: '', resultType: 'supported', sortOrder: 0 }); setShowForm(true); }}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600"
          >
            + 添加OE号
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-400"
            placeholder="搜索 OE号 / 品牌 / 车型..."
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        {search && (
          <p className="text-xs text-gray-500 mt-2">
            搜索 "<strong className="text-gray-700">{search}</strong>" 找到 {total} 条结果
            <button onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="ml-2 text-primary-500 hover:underline">清除搜索</button>
          </p>
        )}
      </div>

      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📌 使用说明</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li><strong>resultType=支持(supported)</strong>：用户查询命中时显示绿色弹窗"支持该OE号"，含询盘按钮</li>
          <li><strong>resultType=定制(custom)</strong>：用户查询命中时显示蓝色弹窗"支持定制"，含咨询按钮</li>
          <li><strong>未命中</strong>：默认显示"支持定制"弹窗</li>
          <li><strong>批量导入格式</strong>：每行一个，格式：OE号,品牌,车型（逗号分隔，品牌和车型可选）</li>
        </ul>
      </div>

      {showImport && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-3">批量导入OE号</h3>
          <p className="text-xs text-gray-500 mb-2">每行一个，格式：OE号,品牌,车型（如：04465-06010,Toyota,Corolla）</p>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            placeholder="04465-06010,Toyota,Corolla&#10;04465-02140,Toyota,Camry&#10;..."
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={() => { setShowImport(false); setImportText(''); }} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button onClick={handleImport} disabled={importing} className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600 disabled:opacity-50">
              {importing ? '导入中...' : '开始导入'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-medium">OE号</th>
              <th className="px-4 py-3 text-left font-medium">品牌</th>
              <th className="px-4 py-3 text-left font-medium">车型</th>
              <th className="px-4 py-3 text-left font-medium">结果类型</th>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">加载中...</td></tr>
            ) : oeNumbers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">{search ? '未找到匹配的OE号' : '暂无OE号，点击右上角添加'}</td></tr>
            ) : (
              oeNumbers.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-800">{highlight(item.oeNumber)}</td>
                  <td className="px-4 py-3 text-gray-600">{highlight(item.brand || '-')}</td>
                  <td className="px-4 py-3 text-gray-600">{highlight(item.model || '-')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 text-xs rounded-full ${item.resultType === 'supported' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.resultType === 'supported' ? '支持' : '定制'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(item)} className="text-primary-600 hover:text-primary-700 text-xs font-medium mr-3">编辑</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {total > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>每页</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>条 · 共 {total} 条</span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                首页
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              {getPageNumbers().map((pn, i) =>
                pn === '...' ? (
                  <span key={`e${i}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <button
                    key={pn}
                    onClick={() => setPage(pn as number)}
                    className={`px-3 py-1.5 text-sm border rounded-md ${
                      page === pn
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pn}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                末页
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? '编辑OE号' : '添加OE号'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">OE号 *</label>
                <input
                  type="text"
                  value={form.oeNumber}
                  onChange={e => setForm(prev => ({ ...prev, oeNumber: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                  placeholder="如 04465-06010"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">品牌</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setForm(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="如 Toyota"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">车型</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="如 Corolla"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">查询结果类型</label>
                <select
                  value={form.resultType}
                  onChange={e => setForm(prev => ({ ...prev, resultType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="supported">支持（绿色弹窗）</option>
                  <option value="custom">定制（蓝色弹窗）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">排序权重</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">取消</button>
                <button type="submit" className="px-6 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600">{editingId ? '更新' : '添加'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
