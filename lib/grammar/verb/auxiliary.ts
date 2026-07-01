import { FullParadigm } from './types/conjugator';

// Вспомогательный глагол "быти" в настоящем времени (для Перфекта)
export const bytiPresent: FullParadigm = {
    '1sg': 'jesm',  '2sg': 'jesi',  '3sg': 'jest',
    '1du': 'jesvě', '2du': 'jesta', '3du': 'jesta',
    '1pl': 'jesmo', '2pl': 'jeste', '3pl': 'sųt'
};

// Вспомогательный глагол "быти" в имперфекте (для Плюсквамперфекта)
export const bytiImperfect: FullParadigm = {
    '1sg': 'běh',  '2sg': 'běše',  '3sg': 'běše',
    '1du': 'běhvě', '2du': 'běšeta', '3du': 'běšeta',
    '1pl': 'běhmo', '2pl': 'běšete', '3pl': 'běhų'
};

// Аорист глагола быти (альтернатива для Плюсквамперфекта / Кондиционала)
export const bytiAorist: FullParadigm = {
    '1sg': 'byh',  '2sg': 'by',   '3sg': 'by',
    '1du': 'byhvě', '2du': 'bysta', '3du': 'bysta',
    '1pl': 'byhmo', '2pl': 'byste', '3pl': 'byšę'
};

// Будущее время глагола "быти" (для аналитического будущего)
export const bytiFuture: FullParadigm = {
    '1sg': 'bųdų',  '2sg': 'bųdeš',  '3sg': 'bųde',
    '1du': 'bųdevě', '2du': 'bųdeta', '3du': 'bųdeta',
    '1pl': 'bųdemo', '2pl': 'bųdete', '3pl': 'bųdųt'
};

// Формы кондиционала ("бим, бише...")
export const conditionalParticles: FullParadigm = {
    '1sg': 'bim',   '2sg': 'biš',   '3sg': 'bi',
    '1du': 'bivě',  '2du': 'bita',  '3du': 'bita',
    '1pl': 'bimo',  '2pl': 'bite',  '3pl': 'bišę'
};
