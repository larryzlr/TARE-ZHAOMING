'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
  whatsappLink?: string;
  telegramLink?: string;
};

export default function InquiryForm({ locale, whatsappLink, telegramLink }: Props) {
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
    <form id="inquiry-form" className="bg-white rounded-2xl p-8 shadow-xl space-y-5" onSubmit={handleSubmit} noValidate>
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
          name="product"
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
        {telegramLink && (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-[#0088cc] text-white font-medium rounded-lg hover:bg-[#0077b5] transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.02.322-.046.476.09.16.136.181.37.181.552 0 .18-.014 2.12-.014 2.12l.002.425s.02.374-.126.525a.497.497 0 0 1-.369.14c-.148-.003-.318-.008-.508-.014l-.025.013c-.188-.007-.391-.014-.601-.018-.357-.008-.736-.012-1.067-.012-.31 0-.59.003-.807.012l-.096.003c-.158.006-.326.015-.49.026-.084.013-.18.042-.255.102-.052.04-.098.1-.125.183l-.008.025c-.02.064-.033.135-.033.212 0 .075.01.146.03.21l.01.024c.055.14.153.25.28.32.012.003.025.01.04.015.13.054.354.098.73.098.17 0 .38-.006.608-.017l.044-.002c.252-.012.513-.028.755-.048l.05-.004c.12-.01.235-.02.34-.033.058-.007.112-.014.162-.02.083-.013.186-.03.293-.05.028-.006.056-.012.083-.018.1-.023.2-.048.293-.075l.025-.007c.1-.03.195-.062.28-.095l.012-.005c.073-.028.14-.056.2-.084.018-.008.035-.016.052-.025.042-.02.1-.053.167-.1.023-.017.046-.034.067-.052.024-.02.046-.04.067-.062l.015-.014c.028-.028.054-.057.078-.089.01-.013.02-.027.03-.04.034-.05.05-.093.05-.13a.134.134 0 0 0-.018-.068l-.005-.008a.26.26 0 0 0-.047-.054l-.012-.01a.7.7 0 0 0-.078-.052l-.008-.005c-.024-.013-.05-.026-.076-.038a.934.934 0 0 0-.197-.062l-.02-.004a.742.742 0 0 0-.094-.01c-.04-.003-.083-.005-.126-.005h-.037l-.098.003-.015.001-.037.002-.064.003-.1.003-.018.001-.08.002h-.027l-.12.001c-.16 0-.317.0-.47-.002a.14.14 0 0 1-.022 0l-.14-.003-.097-.003-.19-.006-.178-.007-.252-.01-.143-.008-.24-.014-.065-.005-.168-.013-.017-.002-.103-.01-.073-.01-.036-.005-.064-.01-.01-.002-.066-.013-.05-.012-.022-.007c-.03-.01-.058-.02-.085-.033l-.014-.007a.363.363 0 0 1-.08-.053l-.006-.005a.236.236 0 0 1-.062-.078l-.002-.005a.194.194 0 0 1-.016-.08l.001-.022.002-.012a.228.228 0 0 1 .026-.078l.006-.01a.306.306 0 0 1 .034-.046l.006-.007c.016-.016.035-.033.055-.05l.01-.007c.012-.01.025-.018.04-.027l.016-.01c.025-.014.053-.028.085-.041l.012-.005c.043-.018.092-.035.146-.05l.03-.008c.043-.012.09-.022.14-.032l.016-.003.105-.018.07-.01.05-.006.12-.013.086-.007.082-.005.142-.006.054-.001.177-.002h.152l.104.003.086.003.1.005.066.004.11.008.04.004.156.015.017.002.128.016.072.01.094.015.085.016.02.004.092.022.088.023.068.02.1.034.045.018.077.035.06.03.018.011.067.04.03.02.036.028.016.015.023.02.033.035.01.014.018.026a.166.166 0 0 1 .021.06l-.001.025-.004.023-.009.028-.008.018-.017.03-.013.017-.027.028-.02.016-.025.017-.04.022-.02.01-.04.017-.028.01-.047.014-.022.006-.06.013-.022.004-.06.01-.013.002-.055.006-.01.001-.05.003h-.027l-.022.001-.035.001-.012-.001-.03-.002-.008-.001-.017-.003-.015-.003-.008-.003-.009-.004-.003-.003-.002-.003v-.005l.005-.007.015-.01.024-.01.017-.006.058-.016.01-.002.056-.01.008-.001.05-.006h.027l.04.002h.018l.028.003.007.001.018.003.012.003.005.003h.002l.002.002v.002l-.004.002-.013.003-.024.004-.009.001-.034.003h-.057l-.013-.001-.02-.003-.006-.002-.006-.002-.003-.003.001-.002.005-.001.013-.001.012-.001h.014l.009.001.005.002.002.002v.002h-.006l-.014-.001-.006-.001-.002-.001h-.001v-.001h.003l.007.001.003.001h-.001l-.001-.001h.002l.002.001h-.003l-.004-.002-.003-.002-.002-.002v-.002l.002-.001h.003l.003.001.002.002.001.002.001.001v.001h-.004l-.001-.001-.001-.002h.003l.001.001.001.002v.001h-.001l-.001-.001-.001-.002v-.001l.001.001.002.001v.001l-.001-.001-.001-.001v-.001h.002v.002l-.001-.001v-.002h.001v.002l-.001-.001v-.001h.001v.002l-.001-.001h.001l-.001-.001h.001l.001.001v.001l-.001-.001v-.001h.001v.001z"/></svg>
            <span>Telegram</span>
          </a>
        )}
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
