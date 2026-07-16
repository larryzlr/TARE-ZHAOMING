'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

/**
 * OE号正则验证
 * 穷举主流OE号格式：
 * - 纯数字: 0986461234, 1234
 * - 数字+分隔符(空格/点/连字符): 0 986 461 234, 07.042.10, 13.0460-2835.2
 * - 字母前缀+数字: GDB1234, FDB1234, LP1234
 * - 字母+分隔符+数字: GDB 1234, AN-1234
 * - 字母+数字+字母后缀: AN-1234WK, 1K0698151F, 4403546AB
 * - 混合字母数字: 1K0698151F, 4403546AB
 * 规则：以字母或数字开头结尾，中间可含字母、数字、空格、点、连字符，长度4-30字符
 */
const OE_NUMBER_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s.\-]{2,29}[A-Za-z0-9]$/;

export default function OeNumberQuery() {
  const t = useTranslations('OeQuery');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [touched, setTouched] = useState(false);

  // 实时验证OE号格式
  const validation = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return { valid: true, empty: true };
    const valid = OE_NUMBER_REGEX.test(trimmed);
    return { valid, empty: false };
  }, [query]);

  const showError = touched && !validation.empty && !validation.valid;

  const handleSearch = async () => {
    setTouched(true);
    const trimmed = query.trim();
    if (!trimmed) return;
    // 格式校验不通过则阻止查询
    if (!OE_NUMBER_REGEX.test(trimmed)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/oe-numbers/query?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResult(data);
      setShowModal(true);
    } catch {
      setResult({ found: false, resultType: 'custom', oeNumber: trimmed });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = () => {
    setShowModal(false);
    // 滚动到询盘表单并预填
    const form = document.getElementById('inquiry-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
      const productInput = form.querySelector('[name="product"]') as HTMLInputElement;
      if (productInput) {
        productInput.value = `OE: ${result?.oeNumber || query}`;
        productInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  const isSupported = result?.resultType === 'supported';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {t('title')}
          </h2>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); if (!touched) setTouched(true); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              onBlur={() => setTouched(true)}
              placeholder={t('placeholder')}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
                showError
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100'
              }`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim() || (touched && !validation.valid)}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? t('searching') : t('searchBtn')}
          </button>
        </div>

        {/* 格式错误提示 */}
        {showError && (
          <div className="max-w-xl mx-auto mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
            <span>{t('formatError')}</span>
          </div>
        )}

        {/* 帮助文本 */}
        <p className="max-w-xl mx-auto mt-3 text-xs text-gray-400 text-center">
          {t('formatHint')}
        </p>
      </div>

      {showModal && result && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-5 ${isSupported ? 'bg-green-50' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isSupported ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {isSupported ? '✓' : '🔧'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isSupported ? 'text-green-700' : 'text-blue-700'}`}>
                      {isSupported ? t('supportedTitle') : t('customTitle')}
                    </h3>
                    <p className={`text-sm ${isSupported ? 'text-green-600' : 'text-blue-600'}`}>
                      OE: {result.oeNumber}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                {isSupported ? t('supportedDesc') : t('customDesc')}
              </p>
              {result.brand && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <span className="text-gray-500">{t('brandLabel')}: </span>
                  <span className="font-medium text-gray-800">{result.brand}</span>
                  {result.model && (
                    <>
                      <span className="text-gray-300 mx-2">|</span>
                      <span className="text-gray-500">{t('modelLabel')}: </span>
                      <span className="font-medium text-gray-800">{result.model}</span>
                    </>
                  )}
                </div>
              )}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">{t('suggestions')}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestions.map((s: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => { setResult({ ...s, resultType: s.resultType || 'supported', found: true }); }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-gray-700"
                      >
                        {s.oeNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleInquiry}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white ${isSupported ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {isSupported ? t('inquiryBtn') : t('customBtn')}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  {t('closeBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
