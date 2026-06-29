import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const headersList = await headers();

    // 1. Напрямую смотрим в куку NEXT_LOCALE
    let locale = cookieStore.get('NEXT_LOCALE')?.value;

    // 2. Если куки нет, парсим язык браузера пользователя
    if (!locale) {
        const acceptLanguage = headersList.get('accept-language');
        if (acceptLanguage) {
            const preferred = acceptLanguage.split(',')[0].split('-')[0];
            if (['isv', 'ru', 'en'].includes(preferred)) {
                locale = preferred;
            }
        }
    }

    // 3. Дефолтный язык, если ничего не подошло
    const finalLocale = locale || 'isv';

    return {
        locale: finalLocale,
        messages: (await import(`../messages/${finalLocale}.json`)).default
    };
});
