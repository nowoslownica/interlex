/**
 * Конвертирует праславянскую лемму в стандартную междуславянскую орфографию
 * @param protoWord Сырое праславянское слово из словаря Оландера
 * @returns Очищенное междуславянское слово
 */
export function convertToInterslavic(protoWord: string): string {
    // Приводим к нижнему регистру и очищаем от пробелов
    let word = protoWord.toLowerCase().trim();

    // 1. Убираем специфическую праславянскую диакритику долготы/тонов,
    // которую Оландер мог оставить на гласных (ā, ē, ō, ū, ī и знаки ударений)
    word = word
        .replace(/[āá]/g, 'a')
        .replace(/[ēé]/g, 'e')
        .replace(/[ōó]/g, 'o')
        .replace(/[ūú]/g, 'u')
        .replace(/[īí]/g, 'i')
        .replace(/[ь́ь̈]/g, 'ь')
        .replace(/[ъ́ъ̈]/g, 'ъ');

    // 2. Метатеза плавных (Закон открытого слога для сочетаний ORT / OLT в начале слова)
    // ort- / olt- перед согласными переходят в rat- / lat-
    if (/^[or]t/i.test(word)) { // Упрощенная проверка на согласный далее
        word = word.replace(/^or(?=[bcdfghjklmnprstvxzščž])/, 'ra');
        word = word.replace(/^ol(?=[bcdfghjklmnprstvxzščž])/, 'la');
    }

    // 3. Метатеза плавных внутри корня (Сочетания TORT, TOLT, TERT, TELT)
    // Переходят в междуславянские RAT, LAT, RĚT, LĚT (по южнославянскому типу)
    word = word.replace(/([bcdfghjklmnprstvxzščž])or([bcdfghjklmnprstvxzščž])/g, '$1ra$2');
    word = word.replace(/([bcdfghjklmnprstvxzščž])ol([bcdfghjklmnprstvxzščž])/g, '$1la$2');
    word = word.replace(/([bcdfghjklmnprstvxzščž])er([bcdfghjklmnprstvxzščž])/g, '$1rě$2');
    word = word.replace(/([bcdfghjklmnprstvxzščž])el([bcdfghjklmnprstvxzščž])/g, '$1lě$2');

    // 4. Трансформация носовых гласных (Юсов)
    // Большой юс (ǫ / ǭ) переходит в междуславянский ǫ (в расширенной орфографии) или 'u'
    // Малый юс (ę) переходит в междуславянский ę
    word = word.replace(/[ǫǭ]/g, 'ų'); // Используем стандартное расширенное ų (или 'u')
    word = word.replace(/ę/g, 'ę');    // Сохраняем малый юс как ę

    // 5. Обработка редуцированных (еръ 'ъ' и ерь 'ь')
    // На конце слова редуцированные ВСЕГДА падают (исчезают)
    word = word.replace(/[ъь]$/, '');

    // Внутри слова «сильные» редуцированные переходят в гласные:
    // Для междуславянского стандартом является переход в 'e' (ь) и 'o' (ъ), либо в 'e' для обоих
    // Применим базовое правило: ь -> e, ъ -> o (или убираем, если они были слабыми)
    word = word.replace(/ь/g, 'e');
    word = word.replace(/ъ/g, 'o');

    // 6. Специфические праславянские согласные звуки
    word = word.replace(/ʒ/g, 'z'); // Праславянский дз (ʒ) переходит в z

    // 7. Смягчение L и N (переход lь/nь перед согласными или на конце)
    word = word.replace(/ľ/g, 'lj');
    word = word.replace(/ń/g, 'nj');

    return word;
}
