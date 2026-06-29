'use client';

import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
    const currentLocale = useLocale();

    const changeLocale = (newLocale: string) => {
        // Пишем стандартную куку, которую ожидает наш i18n/request.ts
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // Принудительно перезагружаем вкладку, чтобы бэкенд Next.js пересчитал словарь
        window.location.reload();
    };

    return (
        <select
            value={currentLocale}
            onChange={(e) => changeLocale(e.target.value)}
            className="bg-transparent border-0 p-1 text-base cursor-pointer focus:outline-none focus:ring-0 appearance-none hover:scale-110 transition-transform text-center select-none"
            title="Сменить язык / Change language"
        >
            <option value="isv" className="bg-slate-800 text-white text-sm">🌍</option>
            <option value="ru" className="bg-slate-800 text-white text-sm">🇷🇺</option>
            <option value="en" className="bg-slate-800 text-white text-sm">🇬🇧</option>
        </select>
    );
}
