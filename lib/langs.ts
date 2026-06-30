// Интерфейс для отдельной словарной конфигурации
interface DictionaryConfig {
    readonly name: string;
    readonly url: string;
}

// Тип-литерал для всех поддерживаемых ISO-кодов языков
export type LanguageCode =
    | 'en' | 'de' | 'nl' | 'eo' // Германские и Эсперанто
    | 'ru' | 'be' | 'uk'         // Восточнославянские
    | 'pl' | 'cs' | 'sk' | 'hsb' | 'dsb' | 'csb' // Западнославянские
    | 'bg' | 'mk' | 'hr' | 'sr' | 'sl';         // Южнославянские

// Строго типизированный реестр словарей
export const DICTIONARY_REGISTRY: Record<LanguageCode, DictionaryConfig> = {
    // Германские языки и Эсперанто
    en: { name: 'English', url: 'https://merriam-webster.com/{{word}}' },
    de: { name: 'Deutsch', url: 'https://duden.de/{{word}}' },
    nl: { name: 'Nederlands', url: 'https://ensie.nl/{{word}}' },
    eo: { name: 'Esperanto', url: 'https://vortaro.net/{{word}}' },

    // Восточнославянские
    ru: { name: 'Русский', url: 'https://gufo.me/{{word}}' },
    be: { name: 'Беларуская', url: 'https://verbum.by/{{word}}' },
    uk: { name: 'Українська', url: 'https://sum.in.ua/{{word}}' },

    // Западнославянские
    pl: { name: 'Polski', url: 'https://pwn.pl/{{word}}.html' },
    cs: { name: 'Čeština', url: 'https://cas.cz/{{word}}' },
    sk: { name: 'Slovenčina', url: 'https://savba.sk/{{word}}' },
    hsb: { name: 'Hornjoserbsce', url: 'https://soblex.de/{{word}}' },
    dsb: { name: 'Dolnoserbski', url: 'https://dolnoserbski.de/{{word}}' },
    csb: { name: 'Kaszëbsczi', url: 'https://kaszubski.pl/{{word}}' },

    // Южнославянские
    bg: { name: 'Български', url: 'https://bas.bg/{{word}}' },
    mk: { name: 'Македонски', url: 'https://drmj.eu/{{word}}' },
    hr: { name: 'Hrvatski', url: 'https://znanje.hr/{{word}}' },
    sr: { name: 'Српски', url: 'https://vokabular.org/{{word}}' },
    sl: { name: 'Slovenščina', url: 'https://fran.si/{{word}}' }
};

/**
 * Формирует ссылку на толковый словарь для заданного языка.
 * @param langCode - ISO-код языка (например, 'pl', 'ru'). Регистронезависимый на рантайме.
 * @param word - Искомое слово.
 * @returns Готовый URL-адрес строки.
 */
export function getDictionaryUrl(langCode: string, word: string): string {
    const normalizedCode = langCode.toLowerCase() as LanguageCode;
    const config = DICTIONARY_REGISTRY[normalizedCode];

    if (!config) {
        throw new Error(`Языковой код "${langCode}" не найден в базе данных словарей.`);
    }

    if (!word || word.trim() === '') {
        throw new Error('Параметр "word" не должен быть пустой строкой.');
    }

    // Безопасное кодирование спецсимволов для URL
    const encodedWord = encodeURIComponent(word.trim());

    // Подстановка в шаблон
    return config.url.replace('{{word}}', encodedWord);
}
