'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
  whatsappLink?: string;
};

export default function InquiryForm({ locale, whatsappLink }: Props) {
  const t = useTranslations('IndexPage');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    product: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validate = () => {
    const next: { name?: string; email?: string } = {};
    if (!form.name.trim()) next.name = t('inquiryNameRequired');
    if (!form.email.trim()) {
      next.email = t('inquiryEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t('inquiryEmailInvalid');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          whatsapp: form.whatsapp || undefined,
          product: form.product || undefined,
          message: form.message || undefined,
          lang: locale,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ type: 'success', msg: t('inquirySuccess') });
        setForm({ name: '', email: '', phone: '', whatsapp: '', product: '', message: '' });
      } else {
        setResult({ type: 'error', msg: data.error || t('inquiryFailed') });
      }
    } catch {
      setResult({ type: 'error', msg: t('inquiryFailed') });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <form className="bg-white rounded-2xl p-8 shadow-xl space-y-5" onSubmit={handleSubmit} noValidate>
      {result && (
        <div
          className={`rounded-lg p-3 text-sm ${
            result.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('inquiryName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            className={inputClass(!!errors.name)}
            placeholder={t('inquiryNamePlaceholder')}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('inquiryEmail')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className={inputClass(!!errors.email)}
            placeholder={t('inquiryEmailPlaceholder')}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('inquiryPhone')} <span className="text-gray-400 text-xs">({t('inquiryOptional')})</span>
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            className={inputClass()}
            placeholder={t('inquiryPhonePlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('inquiryWhatsapp')} <span className="text-gray-400 text-xs">({t('inquiryOptional')})</span>
          </label>
          <input
            type="text"
            value={form.whatsapp}
            onChange={e => setForm(prev => ({ ...prev, whatsapp: e.target.value }))}
            className={inputClass()}
            placeholder={t('inquiryWhatsappPlaceholder')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('inquiryProduct')} <span className="text-gray-400 text-xs">({t('inquiryOptional')})</span>
        </label>
        <input
          type="text"
          value={form.product}
          onChange={e => setForm(prev => ({ ...prev, product: e.target.value }))}
          className={inputClass()}
          placeholder={t('inquiryProductPlaceholder')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('inquiryMessage')} <span className="text-gray-400 text-xs">({t('inquiryOptional')})</span>
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
          className={`${inputClass()} resize-none`}
          placeholder={t('inquiryMessagePlaceholder')}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {submitting ? t('inquirySending') : t('inquirySend')}
        </button>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            <span>{t('inquiryWhatsApp')}</span>
          </a>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">{t('inquiryRequiredTip')}</p>
    </form>
  );
}
