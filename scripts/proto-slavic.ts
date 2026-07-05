import fs from "fs";

const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.proto-slavic.ru/dic-trubachev/';
const START_URL = `${BASE_URL}index.html`;

// Функция для получения ссылок на все страницы-буквы
async function getLetterLinks(baseUrl, search) {
    try {
        // Указываем responseType: 'arraybuffer' и декодируем вручную,
        // если на сайте возникнут проблемы с UTF-8 кодировкой
        const response = await axios.get(baseUrl, { responseType: 'arraybuffer' });
        const html = response.data.toString('utf-8');
        const $ = cheerio.load(html);

        const links = new Set();

        $('a[href]').each((index, element) => {
            const href = $(element).attr('href');
            if (href && href.includes(`${search}-`)) {
                // Превращаем относительную ссылку в абсолютную
                links.add(href);
            }
        });

        return Array.from(links);
    } catch (error) {
        console.error('Ошибка при получении списка букв:', error.message);
        return [];
    }
}

// Функция для парсинга конкретной страницы с праславянскими словами
async function parseLetterPage(url) {
    try {
        if (!url.includes('https://')) return [];

        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const html = response.data.toString('utf-8');
        const $ = cheerio.load(html);
        const pageEntries = [];

        // Обходим все абзацы на странице
        $('p').each((index, element) => {
            const pTag = $(element);
            const bTag = pTag.find('s');

            if (bTag.length > 0) {
                let lemma = bTag.text().trim();

                // Проверяем, что это праславянская лемма (начинается со звездочки)
                if (lemma.startsWith('*')) {
                    // Очищаем лемму от случайных знаков препинания на концах
                    lemma = lemma.replace(/[.,:;?]/g, '');

                    // Получаем весь текст абзаца
                    const fullText = pTag.text().trim();

                    // Вырезаем заглавное слово из общего текста, чтобы получить тело статьи
                    const body = fullText.replace(bTag.text(), '').trim();

                    // Валидация от "грязной" верстки (если тег b забыли закрыть)
                    if (lemma.length < 30) {
                        pageEntries.push({
                            lemma: lemma,
                            body: body,
                            source_url: url
                        });
                    }
                }
            }
        });

        return pageEntries;
    } catch (error) {
        console.error(`Ошибка при парсинге страницы ${url}:, ${error.message}`);
        return [];
    }
}

// Главная функция запуска
async function main() {
    console.log('Шаг 1: Собираем ссылки на разделы словаря...');
    const letterUrls = await getLetterLinks(START_URL, "essja");
    console.log(`Найдено страниц для обработки: ${letterUrls.length}`);

    const allData = [];

    // Для теста обработаем только первые 2 страницы (чтобы не спамить сайт запросами)
    // Для боевого запуска замените letterUrls.slice(0, 2) на просто letterUrls
    // const testUrls = letterUrls.slice(0, 2);

    for (const url of letterUrls) {
        const letterInnerUrls = await getLetterLinks(url, "pslf");

        // const testInnerUrls = letterInnerUrls.slice(0, 2);

        for (const urlInner of letterInnerUrls) {
            console.log(`Обработка страницы: ${urlInner}`);
            const entries = await parseLetterPage(urlInner);
            allData.push(...entries);

            // Небольшая пауза между запросами (таймаут 500мс), чтобы не заблокировали IP
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    console.log(`\nУспешно собрано статей: ${allData.length}`);
    console.log('Пример первой собранной записи:', allData[0]);

    // ТУТ ВАШ КОД ДЛЯ СОХРАНЕНИЯ В БД (MySQL, PostgreSQL, MongoDB или просто в JSON файл)
    fs.writeFileSync('essja_dump.json', JSON.stringify(allData, null, 2));
}

main();