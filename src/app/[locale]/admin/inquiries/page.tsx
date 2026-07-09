'use client';

import { useEffect, useState, useMemo } from 'react';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  product: string | null;
  message: string | null;
  lang: string;
  status: string;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: '新询盘', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  read: { label: '已读', color: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  handled: { label: '已处理', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
};

const LANG_MAP: Record<string, string> = {
  en: 'EN',
  zh: '中文',
  ru: 'RU',
  fr: 'FR',
  es: 'ES',
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries?limit=500');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          (item.product || '').toLowerCase().includes(q) ||
          (item.message || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inquiries, filterStatus, search]);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter(i => i.status === 'new').length,
      read: inquiries.filter(i => i.status === 'read').length,
      handled: inquiries.filter(i => i.status === 'handled').length,
    };
  }, [inquiries]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setInquiries(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
      setSelected(prev => (prev && prev.id === id ? { ...prev, status } : prev));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条询盘吗？此操作不可恢复。')) return;
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setInquiries(prev => prev.filter(i => i.id !== id));
      setSelected(null);
    }
  };

  const openDetail = (inquiry: Inquiry) => {
    setSelected(inquiry);
    if (inquiry.status === 'new') {
      handleStatusChange(inquiry.id, 'read');
    }
  };

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">询盘管理</h1>
        <p className="text-sm text-gray-500 mt-1">查看和管理网站前台提交的所有询盘信息</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">询盘总数</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-blue-200 p-4">
          <div className="text-xs text-blue-500 mb-1">新询盘</div>
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">已读</div>
          <div className="text-2xl font-bold text-gray-600">{stats.read}</div>
        </div>
        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="text-xs text-green-500 mb-1">已处理</div>
          <div className="text-2xl font-bold text-green-600">{stats.handled}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-sm ${filterStatus === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-3 py-1.5 rounded-md text-sm ${filterStatus === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              新询盘
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-3 py-1.5 rounded-md text-sm ${filterStatus === 'read' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              已读
            </button>
            <button
              onClick={() => setFilterStatus('handled')}
              className={`px-3 py-1.5 rounded-md text-sm ${filterStatus === 'handled' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              已处理
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索姓名/邮箱/产品/留言..."
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-medium">状态</th>
                <th className="px-4 py-3 text-left font-medium">姓名</th>
                <th className="px-4 py-3 text-left font-medium">邮箱</th>
                <th className="px-4 py-3 text-left font-medium">感兴趣的产品</th>
                <th className="px-4 py-3 text-left font-medium">留言摘要</th>
                <th className="px-4 py-3 text-left font-medium">语言</th>
                <th className="px-4 py-3 text-left font-medium">提交时间</th>
                <th className="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">加载中...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">暂无询盘记录</td>
                </tr>
              ) : (
                filtered.map(item => {
                  const st = STATUS_MAP[item.status] || STATUS_MAP.new;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(item)}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">{item.email}</td>
                      <td className="px-4 py-3 text-gray-600">{item.product || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{item.message || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{LANG_MAP[item.lang] || item.lang}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); openDetail(item); }}
                          className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">询盘详情</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${(STATUS_MAP[selected.status] || STATUS_MAP.new).color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${(STATUS_MAP[selected.status] || STATUS_MAP.new).dot}`}></span>
                  {(STATUS_MAP[selected.status] || STATUS_MAP.new).label}
                </span>
                <span className="text-xs text-gray-400">{LANG_MAP[selected.lang] || selected.lang}</span>
              </div>

              <DetailField label="姓名" value={selected.name} />
              <DetailField label="邮箱" value={selected.email} link={`mailto:${selected.email}`} />
              {selected.phone && <DetailField label="电话" value={selected.phone} />}
              {selected.whatsapp && <DetailField label="WhatsApp" value={selected.whatsapp} />}
              {selected.product && <DetailField label="感兴趣的产品" value={selected.product} />}
              {selected.message && <DetailField label="留言内容" value={selected.message} multiline />}
              <DetailField label="提交时间" value={formatDateTime(selected.createdAt)} />

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {selected.status !== 'read' && (
                  <button onClick={() => handleStatusChange(selected.id, 'read')} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs hover:bg-gray-200">标记为已读</button>
                )}
                {selected.status !== 'handled' && (
                  <button onClick={() => handleStatusChange(selected.id, 'handled')} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs hover:bg-green-100">标记为已处理</button>
                )}
                {selected.status !== 'new' && (
                  <button onClick={() => handleStatusChange(selected.id, 'new')} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs hover:bg-blue-100">标记为新询盘</button>
                )}
                <button onClick={() => handleDelete(selected.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs hover:bg-red-100 ml-auto">删除</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, link, multiline }: { label: string; value: string; link?: string; multiline?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      {link ? (
        <a href={link} className="text-sm text-primary-600 hover:underline break-all">{value}</a>
      ) : (
        <div className={`text-sm text-gray-800 ${multiline ? 'whitespace-pre-wrap break-words' : 'break-all'}`}>{value}</div>
      )}
    </div>
  );
}
