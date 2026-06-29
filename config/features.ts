// 1. Базовые системные фичи
export enum SystemFeature {
    DictionaryCreate = "dictionary_create",
    DictionaryEdit = "dictionary_edit",
    DictionaryDelete = "dictionary_delete",
    ModerationApprove = "moderation_approve",
    LogsView = "logs_view",
    SystemSettings = "system_settings",
}

// 2. Список кодов всех языков из вашей схемы Prisma
export const TRANSLATION_LANGUAGES = [
    { code: "en", name: "Английский" },
    { code: "ru", name: "Русский" },
    { code: "mk", name: "Македонский" },
    { code: "sr", name: "Сербский" },
    { code: "uk", name: "Украинский" },
    { code: "bg", name: "Болгарский" },
    { code: "pl", name: "Польский" },
    { code: "be", name: "Белорусский" },
    { code: "cs", name: "Чешский" },
    { code: "sk", name: "Словацкий" },
    { code: "sl", name: "Словенский" },
    { code: "hr", name: "Хорватский" },
    { code: "cu", name: "Церковнославянский" },
    { code: "de", name: "Немецкий" },
    { code: "nl", name: "Нидерландский" },
    { code: "eo", name: "Эсперанто" },
] as const;

// Генерируем Enum для языковых фич вида: translate_en = "translate_en"
type LanguageFeatureKeys = {
    [K in typeof TRANSLATION_LANGUAGES[number]["code"] as `Translate${Capitalize<K>}`]: `translate_${K}`
};

const LanguageFeature = TRANSLATION_LANGUAGES.reduce((acc, lang) => {
    const enumKey = `Translate${lang.code.toUpperCase()}`;
    const enumValue = `translate_${lang.code}`;
    acc[enumKey] = enumValue;
    return acc;
}, {} as any) as LanguageFeatureKeys;

// 3. Объединенный общий тип Feature для использования во всем проекте
export const Feature = {
    ...SystemFeature,
    ...LanguageFeature,
};
export type Feature = SystemFeature | `translate_${typeof TRANSLATION_LANGUAGES[number]["code"]}`;

// 4. Описываем метаданные для базовых системных фич
export const FEATURE_METADATA: Record<string, { label: string; description: string; category: string }> = {
    [SystemFeature.DictionaryCreate]: {
        label: "Создание статей",
        description: "Доступ к форме создания слов и корней",
        category: "Словарь",
    },
    [SystemFeature.DictionaryEdit]: {
        label: "Редактирование статей",
        description: "Изменение существующих словарных статей",
        category: "Словарь",
    },
    [SystemFeature.DictionaryDelete]: {
        label: "Удаление данных",
        description: "Право безвозвратно удалять слова и корни",
        category: "Словарь",
    },
    [SystemFeature.ModerationApprove]: {
        label: "Верификация (Аппрув)",
        description: "Возможность ставить маркер 'Проверено'",
        category: "Модерация",
    },
    [SystemFeature.LogsView]: {
        label: "Просмотр логов",
        description: "Доступ к аудиту действий модераторов",
        category: "Система",
    },
    [SystemFeature.SystemSettings]: {
        label: "Управление конфигурацией",
        description: "Изменение глобальных переменных окружения",
        category: "Система",
    },
};

// 5. Автоматически дополняем метаданные разрешениями по всем языкам из БД
TRANSLATION_LANGUAGES.forEach((lang) => {
    const featureKey = `translate_${lang.code}`;
    FEATURE_METADATA[featureKey] = {
        label: `Перевод: ${lang.name} (${lang.code.toUpperCase()})`,
        description: `Разрешить редактировать и добавлять перевод на ${lang.name.toLowerCase()} язык`,
        category: "Переводы", // Ваша новая категория
    };
});

// 6. Формируем итоговую группировку для двухколоночного интерфейса управления пользователями
export const FEATURE_CATEGORIES = Object.entries(FEATURE_METADATA).reduce(
    (acc, [key, meta]) => {
        const category = meta.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push({
            key: key as Feature,
            label: meta.label,
            description: meta.description,
        });
        return acc;
    },
    {} as Record<string, Array<{ key: Feature; label: string; description: string }>>
);
