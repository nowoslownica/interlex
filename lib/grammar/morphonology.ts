/**
 * Утилиты для праславянских и межславянских звуковых чередований
 */

// Карта первой палатализации (задненёбные -> шипящие перед гласными переднего ряда e, i, ь)
const FIRST_PALATALIZATION: Record<string, string> = {
    'k': 'č',
    'g': 'ž',
    'h': 'š',
    'ch': 'š',
};

// Карта йотовой палатализации (согласный + j)
const IOTATION: Record<string, string> = {
    't': 'č', // В межславянском праславянское *tj переходит в č или ć. Используем стандартную č
    'd': 'ž', // *dj -> ž / dž
    's': 'š',
    'z': 'ž',
    'k': 'č',
    'g': 'ž',
    'h': 'š',
    'ch': 'š',
    'c': 'č',
};

// Губные согласные, требующие вставки L-эпитетичного (epentheticum) перед j
const LABIALS = ['p', 'b', 'm', 'v', 'f'];

/**
 * 1. Первая палатализация (First Palatalization)
 * Применяется в I классе (e-основы) для глаголов типа pekti -> pečeš, mogti -> možeš
 */
export function applyFirstPalatalization(stem: string): string {
    // Проверяем диграфы сначала (ch)
    if (stem.endsWith('ch')) {
        return stem.slice(0, -2) + 'š';
    }

    const lastChar = stem.slice(-1);
    if (lastChar in FIRST_PALATALIZATION) {
        return stem.slice(0, -1) + FIRST_PALATALIZATION[lastChar];
    }

    return stem;
}

/**
 * 2. Йотовая палатализация (Iotation / Йотация)
 * Применяется в IV классе (i-основы) для формы 1sg (настоящее время) и подтипах III класса
 */
export function applyIotation(stem: string): string {
    // 1. Проверяем сочетания согласных st -> šč, zd -> ždž
    if (stem.endsWith('st')) return stem.slice(0, -2) + 'šč';
    if (stem.endsWith('zd')) return stem.slice(0, -2) + 'ždž';
    if (stem.endsWith('sk')) return stem.slice(0, -2) + 'šč';
    if (stem.endsWith('zg')) return stem.slice(0, -2) + 'ždž';

    // 2. Проверяем губные согласные (Labials + j -> Labial + lj)
    const lastChar = stem.slice(-1);
    if (LABIALS.includes(lastChar)) {
        return stem + 'lj';
    }

    // 3. Стандартная йотация одиночных согласных
    if (lastChar in IOTATION) {
        return stem.slice(0, -1) + IOTATION[lastChar];
    }

    return stem;
}

/**
 * 3. Автоматическое определение основы презенса для регулярных праславянских классов
 * Функция принимает инфинитив и пытается восстановить основы по строгим морфологическим правилам
 */
export interface ExtractedStems {
    infStem: string;
    presentStem: string;
    aoristStem: string;
    verbClass: 'I' | 'II' | 'III' | 'IV' | 'V';
}

export function extractProtoStems(infinitive: string): ExtractedStems {
    const lemma = infinitive.toLowerCase().trim();

    // Класс IV: на -iti (кроме односложных) или -ěti (после шипящих/мягких)
    if (lemma.endsWith('iti') && lemma.length > 5) {
        const root = lemma.slice(0, -3);
        return {
            infStem: root + 'i',
            presentStem: root + 'i', // Тематический гласный i (govor-i-)
            aoristStem: root + 'i',
            verbClass: 'IV'
        };
    }

    // Класс III: на -ovati (меняется на -uje-)
    if (lemma.endsWith('ovati')) {
        const root = lemma.slice(0, -5);
        return {
            infStem: root + 'ova',
            presentStem: root + 'uje', // kup-ovati -> kup-uje-
            aoristStem: root + 'ova',
            verbClass: 'III'
        };
    }

    // Класс III: на -ati после j или гласных (znati -> znaje-, spasati -> spasaje-)
    if (lemma.endsWith('ati')) {
        const root = lemma.slice(0, -3); // Для "spasati" -> "spas"

        // Проверяем, является ли это подклассом на -аjе- (большинство регулярных глаголов на -ati)
        // Исключаем только корневые основы I класса (напр., zvati -> zov-)
        return {
            infStem: root + 'a',       // "spasa"
            presentStem: root + 'aje', // ИСПРАВЛЕНО: "spasaje" вместо "spasaje" (без лишней "а")
            aoristStem: root + 'a',    // "spasa"
            verbClass: 'III'
        };
    }


    // Класс II: на -nųti (суффикс однократности -nų-)
    if (lemma.endsWith('nųti') || lemma.endsWith('nuti')) {
        const suffix = lemma.endsWith('nųti') ? 'nų' : 'nu';
        const root = lemma.slice(0, -4);
        return {
            infStem: root + suffix,
            presentStem: root + 'ne', // dvignųti -> dvigne-
            aoristStem: root + suffix,
            verbClass: 'II'
        };
    }

    // Класс I: Атематические основы на согласный (-ti) с палатализацией в презенсе
    // Например: pekti -> peče-, mogti -> može-
    const rawRoot = lemma.slice(0, -2); // Отрезаем -ti
    const palatalizedRoot = applyFirstPalatalization(rawRoot);

    return {
        infStem: rawRoot,
        presentStem: palatalizedRoot + 'e', // Тематический -е- с чередованием
        aoristStem: rawRoot,
        verbClass: 'I'
    };
}
