import {VerbModel, ConjugationResult, FullParadigm, LParticiple, IndicativeMood, Participles, ParticipleSet} from './types/conjugator';
import {applyIotation} from "@/lib/grammar/morphonology";
import {applyFirstPalatalization} from "@/lib/grammar/verb/index";
import {bytiFuture, bytiImperfect, bytiPresent, conditionalParticles} from "@/lib/grammar/verb/auxiliary";
import {applySpecificAccent} from "@/lib/grammar/accentUtils";
import { getEndingByGrammeme } from '@/lib/grammar/endingLoader';

const PRES_GRAMMEME = 'Tense=Pres|VerbForm=Fin';
const AOR_GRAMMEME = 'Tense=Aor|VerbForm=Fin';
const IMPF_GRAMMEME = 'Tense=Impf|VerbForm=Fin';
const IMP_GRAMMEME = 'Mood=Imp|VerbForm=Fin';
const LPART_GRAMMEME = 'Tense=Past|VerbForm=Part';
const PRES_ACT_EXTRA = 'VerbForm=Part|Tense=Pres|Voice=Act';
const PRES_PASS_EXTRA = 'VerbForm=Part|Tense=Pres|Voice=Pass';
const PAST_PASS_EXTRA = 'VerbForm=Part|Tense=Past|Voice=Pass';

function verbGrammeme(person: string, number: string, extra: string): string {
  const num = number === 'sg' ? 'Sing' : number === 'du' ? 'Dual' : 'Plur';
  return `Person=${person}|Number=${num}|${extra}`;
}

function getVE(stemType: string, key: string, extra: string, fallback: string): string {
  const person = key.charAt(0);
  const numMarker = key.substring(1);
  return getEndingByGrammeme(stemType, verbGrammeme(person, numMarker, extra)) ?? fallback;
}

function getLPartEnding(gender: string, number: string, fallback: string): string {
  const gn = number === 'sg' ? 'Sing' : number === 'du' ? 'Dual' : 'Plur';
  const g = `Gender=${gender}|Number=${gn}|${LPART_GRAMMEME}`;
  return getEndingByGrammeme('verb_lpart', g) ?? fallback;
}

function getPartEnding(stemType: string, gender: string, number: string, extra: string, fallback: string): string {
  const gn = number === 'sg' ? 'Sing' : number === 'du' ? 'Dual' : 'Plur';
  const g = `Gender=${gender}|Number=${gn}|${extra}`;
  return getEndingByGrammeme(stemType, g) ?? fallback;
}

// Вспомогательный хелпер (замените на вашу функцию разметки слогов и тонов)
// syllableFromEnd: 0 - последний слог, 1 - предпоследний, 'first' - абсолютное начало слова
function accentSyllable(word: string, position: number | 'first', tone: 'acute' | 'circumflex' | 'neoacute' | 'short'): string {
    if (position === 'first') {
        const vowels = /[aeiouyěęǫọų]/gi;
        const matches = Array.from(word.matchAll(vowels));
        if (matches.length === 0) return word;

        const firstSyllableIndex = matches.length - 1;
        return applySpecificAccent(word, firstSyllableIndex, tone);
    }

    return applySpecificAccent(word, position, tone);
}

function generateParticiples(verb: VerbModel): Participles {
    const { infinitive, infStem, presentStem, verbClass } = verb;
    const hasThematicE = presentStem.endsWith('e');
    const baseForVowels = hasThematicE ? presentStem.slice(0, -1) : presentStem;

    // --- Present Active Participle (-ǫšti / -ęťi) ---
    let paMasc: string;
    let paFem: string;
    let paNeut: string;
    let paPl: string;
    if (verbClass === 'IV') {
        const iotated = applyIotation(presentStem.slice(0, -1));
        const st = 'verb_part_act_pres_i';
        paMasc = iotated + getPartEnding(st, 'Masc', 'sg', PRES_ACT_EXTRA, 'ęťi');
        paFem = iotated + getPartEnding(st, 'Fem', 'sg', PRES_ACT_EXTRA, 'ęťa');
        paNeut = iotated + getPartEnding(st, 'Neut', 'sg', PRES_ACT_EXTRA, 'ęťe');
        paPl = iotated + getPartEnding(st, 'Masc', 'pl', PRES_ACT_EXTRA, 'ęťi');
    } else {
        const st = 'verb_part_act_pres_th';
        paMasc = baseForVowels + getPartEnding(st, 'Masc', 'sg', PRES_ACT_EXTRA, 'ųšti');
        paFem = baseForVowels + getPartEnding(st, 'Fem', 'sg', PRES_ACT_EXTRA, 'ųťa');
        paNeut = baseForVowels + getPartEnding(st, 'Neut', 'sg', PRES_ACT_EXTRA, 'ųťe');
        paPl = baseForVowels + getPartEnding(st, 'Masc', 'pl', PRES_ACT_EXTRA, 'ųťi');
    }

    // --- Present Passive Participle (-omyj / -imyj) ---
    let ppm: string;
    let ppf: string;
    let ppn: string;
    let ppp: string;
    if (verbClass === 'IV') {
        const root = presentStem.slice(0, -1);
        const st = 'verb_part_pass_pres_i';
        ppm = root + getPartEnding(st, 'Masc', 'sg', PRES_PASS_EXTRA, 'imyj');
        ppf = root + getPartEnding(st, 'Fem', 'sg', PRES_PASS_EXTRA, 'ima');
        ppn = root + getPartEnding(st, 'Neut', 'sg', PRES_PASS_EXTRA, 'imo');
        ppp = root + getPartEnding(st, 'Masc', 'pl', PRES_PASS_EXTRA, 'ime');
    } else {
        const isJStem = baseForVowels.endsWith('j');
        const st = isJStem ? 'verb_part_pass_pres_e' : 'verb_part_pass_pres_th';
        const fallbackMasc = isJStem ? 'emyj' : 'omyj';
        const fallbackFem = isJStem ? 'ema' : 'oma';
        const fallbackNeut = isJStem ? 'emo' : 'omo';
        const fallbackPl = isJStem ? 'eme' : 'ome';
        ppm = baseForVowels + getPartEnding(st, 'Masc', 'sg', PRES_PASS_EXTRA, fallbackMasc);
        ppf = baseForVowels + getPartEnding(st, 'Fem', 'sg', PRES_PASS_EXTRA, fallbackFem);
        ppn = baseForVowels + getPartEnding(st, 'Neut', 'sg', PRES_PASS_EXTRA, fallbackNeut);
        ppp = baseForVowels + getPartEnding(st, 'Masc', 'pl', PRES_PASS_EXTRA, fallbackPl);
    }

    // --- Past Passive Participle (-enyj / -tyj / -nyj) ---
    let ppaMasc: string;
    let ppaStemType: string;
    let ppaFallback: string;
    if (verbClass === 'IV') {
        const root = infStem.slice(0, -1);
        ppaMasc = applyFirstPalatalization(root) + 'enyj';
        ppaStemType = 'verb_part_pass_past_en';
        ppaFallback = 'enyj';
    } else if (verbClass === 'III') {
        ppaMasc = infStem + 'nyj';
        ppaStemType = 'verb_part_pass_past_n';
        ppaFallback = 'nyj';
    } else if (verbClass === 'II') {
        ppaMasc = infStem.slice(0, -1) + 'enyj';
        ppaStemType = 'verb_part_pass_past_en';
        ppaFallback = 'enyj';
    } else {
        const lastChar = infStem.slice(-1);
        if ('aeiouyěęǫ'.includes(lastChar)) {
            ppaMasc = infStem + 'tyj';
            ppaStemType = 'verb_part_pass_past_t';
            ppaFallback = 'tyj';
        } else {
            ppaMasc = applyFirstPalatalization(infStem) + 'enyj';
            ppaStemType = 'verb_part_pass_past_en';
            ppaFallback = 'enyj';
        }
    }
    const ppaFem = ppaMasc.replace('yj', 'a');
    const ppaNeut = ppaMasc.replace('yj', 'o');
    const ppaPl = ppaMasc.replace('yj', 'e');

    return {
        presentActive: { masculine: paMasc, feminine: paFem, neuter: paNeut, plural: paPl },
        presentPassive: { masculine: ppm, feminine: ppf, neuter: ppn, plural: ppp },
        pastPassive: { masculine: ppaMasc, feminine: ppaFem, neuter: ppaNeut, plural: ppaPl },
    };
}

export function conjugateFullVerb(verb: VerbModel): ConjugationResult {
    const { infinitive, infStem, presentStem, aoristStem, verbClass, aspect, paradigm } = verb;

    // --- 1. Презенс (Настоящее / Бесприставочное будущее время) ---
    const hasThematicE = presentStem.endsWith('e');
    const baseForVowels = hasThematicE ? presentStem.slice(0, -1) : presentStem;
    const presentStemType = verbClass === 'IV' ? 'verb_present_athematic_i' : 'verb_present_thematic_e';

    let p1sg = '';
    if (verbClass === 'IV') {
        const root = presentStem.slice(0, -1);
        p1sg = `${applyIotation(root)}${getVE(presentStemType, '1sg', PRES_GRAMMEME, 'ų')}`;
    } else {
        p1sg = `${baseForVowels}${getVE(presentStemType, '1sg', PRES_GRAMMEME, 'ų')}`;
    }

    const p3pl = verbClass === 'IV'
        ? `${presentStem.slice(0, -1)}${getVE(presentStemType, '3pl', PRES_GRAMMEME, 'ęt')}`
        : `${baseForVowels}${getVE(presentStemType, '3pl', PRES_GRAMMEME, 'ųt')}`;

    const accentPresentForm = (
        form: string,
        person: '1sg' | '2sg' | '3sg' | '1du' | '2du' | '3du' | '1pl' | '2pl' | '3pl'
    ): string => {
        if (paradigm === 'A') {
            return accentSyllable(form, 'first', 'acute');
        }

        if (paradigm === 'B') {
            if (person === '1sg') {
                return accentSyllable(form, 0, 'short');
            }
            if (person === '3pl') {
                return accentSyllable(form, 1, 'neoacute');
            }
            return accentSyllable(form, 1, 'neoacute');
        }

        if (paradigm === 'C') {
            if (person === '1sg') {
                return accentSyllable(form, 0, 'short');
            }
            return accentSyllable(form, 'first', 'short');
        }

        return form;
    };

    const directParadigm: FullParadigm = {
        '1sg': accentPresentForm(p1sg, '1sg'),
        '2sg': accentPresentForm(`${presentStem}${getVE(presentStemType, '2sg', PRES_GRAMMEME, 'š')}`, '2sg'),
        '3sg': accentPresentForm(`${presentStem}${getVE(presentStemType, '3sg', PRES_GRAMMEME, '')}`, '3sg'),
        '1du': accentPresentForm(`${presentStem}${getVE(presentStemType, '1du', PRES_GRAMMEME, 'vě')}`, '1du'),
        '2du': accentPresentForm(`${presentStem}${getVE(presentStemType, '2du', PRES_GRAMMEME, 'ta')}`, '2du'),
        '3du': accentPresentForm(`${presentStem}${getVE(presentStemType, '3du', PRES_GRAMMEME, 'ta')}`, '3du'),
        '1pl': accentPresentForm(`${presentStem}${getVE(presentStemType, '1pl', PRES_GRAMMEME, 'mo')}`, '1pl'),
        '2pl': accentPresentForm(`${presentStem}${getVE(presentStemType, '2pl', PRES_GRAMMEME, 'te')}`, '2pl'),
        '3pl': accentPresentForm(p3pl, '3pl'),
    };

    // --- 2. Аорист ---
    const isVowelStem = ['III', 'IV'].includes(verbClass) || infStem.endsWith('a') || infStem.endsWith('i');
    const aoristStemType = isVowelStem ? 'verb_aorist_sigmatic' : 'verb_aorist_asigmatic';

    const accentAoristForm = (form: string, persons: '1sg'|'2sg'|'3sg'|'1du'|'2du'|'3du'|'1pl'|'2pl'|'3pl'): string => {
        if (paradigm === 'C' && ['2sg', '3sg'].includes(persons)) {
            return accentSyllable(form, 0, 'short');
        }
        return accentSyllable(form, 'first', paradigm === 'A' ? 'acute' : 'short');
    };

    const aorist: FullParadigm = {
        '1sg': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '1sg', AOR_GRAMMEME, 'h')}`, '1sg'),
        '2sg': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '2sg', AOR_GRAMMEME, isVowelStem ? '' : 'e')}`, '2sg'),
        '3sg': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '3sg', AOR_GRAMMEME, isVowelStem ? '' : 'e')}`, '3sg'),
        '1du': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '1du', AOR_GRAMMEME, 'hvě')}`, '1du'),
        '2du': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '2du', AOR_GRAMMEME, 'sta')}`, '2du'),
        '3du': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '3du', AOR_GRAMMEME, 'sta')}`, '3du'),
        '1pl': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '1pl', AOR_GRAMMEME, 'hmo')}`, '1pl'),
        '2pl': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '2pl', AOR_GRAMMEME, 'ste')}`, '2pl'),
        '3pl': accentAoristForm(`${aoristStem}${getVE(aoristStemType, '3pl', AOR_GRAMMEME, 'šę')}`, '3pl'),
    };

    // --- 3. Имперфект ---
    const impBase = isVowelStem ? infStem : `${infStem}ě`;
    const accentImperfectForm = (form: string) => accentSyllable(form, 1, 'circumflex');

    const imperfect: FullParadigm = {
        '1sg': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '1sg', IMPF_GRAMMEME, 'ah')}`),
        '2sg': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '2sg', IMPF_GRAMMEME, 'aše')}`),
        '3sg': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '3sg', IMPF_GRAMMEME, 'aše')}`),
        '1du': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '1du', IMPF_GRAMMEME, 'ahvě')}`),
        '2du': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '2du', IMPF_GRAMMEME, 'ašeta')}`),
        '3du': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '3du', IMPF_GRAMMEME, 'ašeta')}`),
        '1pl': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '1pl', IMPF_GRAMMEME, 'ahmo')}`),
        '2pl': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '2pl', IMPF_GRAMMEME, 'ašete')}`),
        '3pl': accentImperfectForm(`${impBase}${getVE('verb_imperfect', '3pl', IMPF_GRAMMEME, 'ahu')}`),
    };

    // --- 4. Генерация L-причастия ---
    const accentLPart = (form: string, gender: 'm' | 'f' | 'n' | 'pl') => {
        if (paradigm === 'C' && gender === 'f') {
            return accentSyllable(form, 0, 'short');
        }
        return accentSyllable(form, 'first', paradigm === 'A' ? 'acute' : 'short');
    };

    const lParticiple: LParticiple = {
        masculine: accentLPart(`${infStem}${getLPartEnding('Masc', 'sg', 'l')}`, 'm'),
        feminine: accentLPart(`${infStem}${getLPartEnding('Fem', 'sg', 'la')}`, 'f'),
        neuter: accentLPart(`${infStem}${getLPartEnding('Neut', 'sg', 'lo')}`, 'n'),
        dual_masculine: accentLPart(`${infStem}${getLPartEnding('Masc', 'du', 'la')}`, 'pl'),
        dual_feminine_neuter: accentLPart(`${infStem}${getLPartEnding('Fem', 'du', 'lě')}`, 'pl'),
        plural_masculine: accentLPart(`${infStem}${getLPartEnding('Masc', 'pl', 'li')}`, 'pl'),
        plural_feminine_neuter: accentLPart(`${infStem}${getLPartEnding('Fem', 'pl', 'le')}`, 'pl'),
    };

    // --- Оставшаяся часть сборки аналитических форм ---
    const buildAnalytical = (aux: FullParadigm, part: string): FullParadigm => {
        const res = {} as FullParadigm;
        (Object.keys(aux) as Array<keyof FullParadigm>).forEach((key) => {
            res[key] = `${aux[key]} ${part}`;
        });
        return res;
    };

    const perfect = {
        masculine: buildAnalytical(bytiPresent, lParticiple.masculine),
        feminine: buildAnalytical(bytiPresent, lParticiple.feminine),
        neuter: buildAnalytical(bytiPresent, lParticiple.neuter),
        plural: buildAnalytical(bytiPresent, lParticiple.plural_masculine),
    };

    const pluperfect = {
        masculine: buildAnalytical(bytiImperfect, lParticiple.masculine),
        feminine: buildAnalytical(bytiImperfect, lParticiple.feminine),
    };

    let futureAnalytical: IndicativeMood['futureAnalytical'];
    if (aspect === 'imperfective' || aspect === 'bi-aspectual') {
        futureAnalytical = {
            withByti: buildAnalytical(bytiFuture, infinitive),
            withImati: buildAnalytical({
                '1sg': 'imam', '2sg': 'imaš', '3sg': 'ima', '1du': 'imavě', '2du': 'imata', '3du': 'imata', '1pl': 'imamo', '2pl': 'imate', '3pl': 'imajųt'
            }, infinitive),
            withHtěti: buildAnalytical({
                '1sg': 'hoćų', '2sg': 'hočeš', '3sg': 'hoče', '1du': 'hočevě', '2du': 'hočeta', '3du': 'hočeta', '1pl': 'hočemo', '2pl': 'hočete', '3pl': 'hočųt'
            }, infinitive),
        };
    }

    // --- 5. Императив ---
    let impBaseForm = '';
    if (verbClass === 'IV') {
        impBaseForm = `${presentStem}`;
    } else {
        const rootWithoutE = hasThematicE ? presentStem.slice(0, -1) : presentStem;
        impBaseForm = rootWithoutE.endsWith('j') ? rootWithoutE : `${rootWithoutE}j`;
    }

    const accentImperative = (form: string) => {
        if (paradigm === 'A') return accentSyllable(form, 'first', 'acute');
        return accentSyllable(form, 1, 'acute');
    };

    const imperative = {
        '2sg': accentImperative(impBaseForm),
        '1du': accentImperative(`${impBaseForm}${getVE('verb_imperative', '1du', IMP_GRAMMEME, 'vě')}`),
        '2du': accentImperative(`${impBaseForm}${getVE('verb_imperative', '2du', IMP_GRAMMEME, 'ta')}`),
        '1pl': accentImperative(`${impBaseForm}${getVE('verb_imperative', '1pl', IMP_GRAMMEME, 'mo')}`),
        '2pl': accentImperative(`${impBaseForm}${getVE('verb_imperative', '2pl', IMP_GRAMMEME, 'te')}`),
    };

    const participles = generateParticiples(verb);

    const conditional = {
        masculine: buildAnalytical(conditionalParticles, lParticiple.masculine),
        feminine: buildAnalytical(conditionalParticles, lParticiple.feminine),
    };

    return {
        infinitive,
        verbClass,
        aspect,
        lParticiple,
        indicative: {
            presentOrFutureDirect: directParadigm,
            futureAnalytical,
            aorist,
            imperfect,
            perfect,
            pluperfect,
        },
        imperative,
        conditional,
        participles,
    };
}