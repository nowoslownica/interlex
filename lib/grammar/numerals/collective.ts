import { AccentParadigm, GrammaticalGender } from '@/lib/grammar/common';
import { Case, NumberType, FourSlavicTones } from '../noun';
import { getEndingByGrammeme } from '@/lib/grammar/endingLoader';
import { buildGrammeme } from '@/lib/grammar/grammemes';

export type CollectiveClass = 'oje_type' | 'ero_type'; // dvoje vs četvero

export interface CollectiveDbItem {
    interslavic: string;       // "dvoje", "četvero"
    protoSlavic: string;
    paradigm: AccentParadigm; // Исторически это окситонеза (B) или мобильный тип (C)
    collClass: CollectiveClass;
}

const COLLECTIVE_FALLBACK: Record<CollectiveClass, Record<Case, string>> = {
    oje_type: {
        [Case.NOMINATIVE]: 'e', [Case.ACCUSATIVE]: 'e', [Case.GENITIVE]: 'ih', [Case.DATIVE]: 'im', [Case.INSTRUMENTAL]: 'imi', [Case.LOCATIVE]: 'ih', [Case.VOCATIVE]: 'e'
    },
    ero_type: {
        [Case.NOMINATIVE]: 'o', [Case.ACCUSATIVE]: 'o', [Case.GENITIVE]: 'yh', [Case.DATIVE]: 'ym', [Case.INSTRUMENTAL]: 'ymi', [Case.LOCATIVE]: 'yh', [Case.VOCATIVE]: 'o'
    }
};

export function declineCollectiveNumeral(request: {
    dbItem: CollectiveDbItem;
    targetCase: Case;
}): string {
    const { dbItem, targetCase } = request;
    const lemma = dbItem.interslavic.toLowerCase().trim();
    const { collClass, paradigm } = dbItem;

    const cleanBase = collClass === 'oje_type' ? lemma.slice(0, -2) + 'j' : lemma.slice(0, -1);
    const stemType = collClass === 'oje_type' ? 'collective_oje' : 'collective_ero';
    const grammeme = buildGrammeme(targetCase, NumberType.PLURAL);
    const dbEnding = getEndingByGrammeme(stemType, grammeme);
    const ending = dbEnding ?? COLLECTIVE_FALLBACK[collClass][targetCase];
    const fullForm = cleanBase + ending;

    // Хелперы Юникода (импортируем из базового тонового процессора)
    const { applyFourTonesMark, getAcuteToneType, getCircumflexToneType } = require('../numerals/cardinal');

    // ПАРАДИГМА A: Неподвижное ударение
    if (paradigm === AccentParadigm.A) {
        return applyFourTonesMark(fullForm, 1, getAcuteToneType(fullForm, 1));
    }

    // ПАРАДИГМА B / C: Собирательные числительные удерживают ударение СТРОГО на суффиксе (dvójih, četvéryh)
    // Это обусловлено праславянской ретракцией на долгий суффиксальный слог.
    const totalVowels = (fullForm.match(/[aeiouyěęǫọų]/gi) || []).length;
    const baseVowels = (cleanBase.match(/[aeiouyěęǫọų]/gi) || []).length;

    // Вычисляем позицию суффикса (последний слог основы)
    const suffixSyllableIndex = totalVowels - baseVowels;

    return applyFourTonesMark(fullForm, suffixSyllableIndex, getAcuteToneType(fullForm, suffixSyllableIndex));
}
