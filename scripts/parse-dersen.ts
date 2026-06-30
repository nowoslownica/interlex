import * as fs from 'fs';
import * as path from 'path';
import {convertToInterslavic, EnhancedLemmaRow, sanitizeProtoSlavic} from "@/lib/proto";

interface FinalLemmaRow {
    interslavic: string;
    protoSlavic: string;
    paradigm: 'A' | 'B' | 'C';
}

// Используем ваш рабочий современный синтаксис
const { PDFParse } = require('pdf-parse');

async function parseDerksenDictionary() {
    const pdfUrl = 'https://ia600508.us.archive.org/12/items/EtymologicalDictionaryOfTheSlavicInheritedLexicon_201310/179381168-Etymological-Dictionary-of-the-Slavic-Inherited-Lexicon.pdf';

    console.log('1. Запуск современного PDF-парсера...');
    try {
        // Инициализируем парсер по вашему методу
        const parser = new PDFParse({ url: pdfUrl });

        console.log('2. Извлечение текста из удаленного архива...');
        const extractedText = (await parser.getText()).text;

        const rawText = extractedText.normalize('NFKC');

        console.log('2. Анализ и сбор славянских лемм...');

        const regex = /\*([^\s.,;()]+)/g;

        const uniqueLemmas = new Map<string, EnhancedLemmaRow>();
        let totalMatches = 0;
        let match;

        while ((match = regex.exec(rawText)) !== null) {
            // Вытаскиваем сырое слово со всеми кракозябрами (например: "kг№diti" или "syቸnሢ")
            const rawProtoWord = match[1].toLowerCase();

            const contextIndex = match.index;
            const articleContext = rawText.substring(contextIndex, contextIndex + 300).toLowerCase();

            // Ищем парадигму (a, b, c)
            const paradigmMatch = articleContext.match(/\(([abc])\)/);
            if (!paradigmMatch) continue;

            const paradigm = paradigmMatch[1].toUpperCase() as 'A' | 'B' | 'C';
            const headerContext = articleContext.substring(0, 70);

            // Определяем род / часть речи
            let gender: 'masculine' | 'feminine' | 'neuter' | 'verb' = 'masculine';
            if (/\b(f|fem)\b\./.test(headerContext) || headerContext.includes('f. ') || headerContext.includes('fem. ')) {
                gender = 'feminine';
            } else if (/\b(n|neut)\b\./.test(headerContext) || headerContext.includes('n. ') || headerContext.includes('neut. ')) {
                gender = 'neuter';
            } else if (/\b(v|verb)\b\./.test(headerContext) || headerContext.includes('v. ') || headerContext.includes('verb. ') || rawProtoWord.endsWith('ti') || rawProtoWord.includes('ti')) {
                gender = 'verb';
            }

            let protoStemClass = 'o';
            let stemExtension: string | undefined = undefined;

            // Парсим класс основы
            if (headerContext.includes('jā') || headerContext.includes('ja-st')) protoStemClass = 'jā';
            else if (headerContext.includes('ā-st') || headerContext.includes('a-st')) protoStemClass = 'ā';
            else if (headerContext.includes('jo-st')) protoStemClass = 'jo';
            else if (headerContext.includes('o-st')) protoStemClass = 'o';
            else if (headerContext.includes('i-st') || headerContext.includes(' i ')) protoStemClass = 'i';
            else if (headerContext.includes('u-st') || headerContext.includes(' u ')) protoStemClass = 'u';
            else if (headerContext.includes('en-st') || headerContext.includes('n-st')) { protoStemClass = 'consonant'; stemExtension = 'en'; }
            else if (headerContext.includes('es-st') || headerContext.includes('s-st')) { protoStemClass = 'consonant'; stemExtension = 'es'; }

            totalMatches++;

            // Очищаем праславянское слово от мусора ДО конвертации
            // Убираем битые символы Mojibake (Г, в, №, б, а̀, †, ‰ и т.д.), сохраняя буквы n, r, t!
            const cleanProtoWord = rawProtoWord
                .replace(/[гвв‚б№†‰œўћўќіїєџћ门户趨]/g, '') // Полный спектр кракозябр кодировки Windows-1252/Brill
                .replace(/[ሢቲቲ]́?/g, 'ъ')
                .replace(/ᆑ́?/g, 'ь')
                .replace(/ቸ/g, 'ъ')
                .replace(/ቐ/g, 'ě')
                .replace(/ቤ/g, 'e')
                .replace(/ቡ/g, 'o')
                .replace(/ቖ/g, 'o')
                .replace(/ብ/g, 'y')
                .replace(/ታ/g, 'a');

            // Теперь на вход транслятору идет слово С СОХРАНЕННЫМИ согласными (kuditi, synъ)
            const interslavicWord = convertToInterslavic(cleanProtoWord);
            const uniqueKey = `${interslavicWord}_${gender}`;

            uniqueLemmas.set(uniqueKey, {
                interslavic: interslavicWord,
                protoSlavic: cleanProtoWord, // Чистая славянская латиница
                paradigm: paradigm,
                gender: gender,
                protoStemClass: protoStemClass,
                stemExtension: stemExtension
            });
        }

        const finalDatabase = Array.from(uniqueLemmas.values());
        finalDatabase.sort((a, b) => a.interslavic.localeCompare(b.interslavic));

        fs.writeFileSync('./dersen_accents_2.json', JSON.stringify(finalDatabase, null, 2), 'utf-8');

        console.log(`\nУспех! Распознано статей в книге: ${totalMatches}`);
        console.log(`Уникальных праславянских корней собрано: ${uniqueLemmas.size}`);

        // Здесь данные можно сохранить в итоговый JSON-файл

    } catch (error: any) {
        console.error('Критическая ошибка:', error.message);
    }
}

parseDerksenDictionary();
