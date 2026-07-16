'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function OeNumbersPage() {
  const toast = useToast();
  const [oeNumbers, setOeNumbers] = useState<OeNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [form, setForm] = useState({
    oeNumber: '',
    brand: '',
    model: '',
    resultType: 'supported',
    sortOrder: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/oe-numbers');
      const data = await res.json();
      setOeNumbers(data.oeNumbers || []);
    } catch {
      toast('error', '加载OE号列表失败');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    
    let success = 0, fail = 0;
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
        if (res.ok) success++; else fail++;
      } catch { fail++; }
    }
    toast(success > 0 ? 'success' : 'error', `导入完成：成功${success}条，失败${fail}条`);
    setShowImport(false);
    setImportText('');
    fetchData();
  };

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">OE号管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理OE号查询表，配置查询结果类型</p>
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
            <button onClick={handleImport} className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600">开始导入</button>
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
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">暂无OE号，点击右上角添加</td></tr>
            ) : (
              oeNumbers.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-800">{item.oeNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{item.brand || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.model || '-'}</td>
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
