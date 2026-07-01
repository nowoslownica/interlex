import { VerbModel, ConjugationResult, FullParadigm, LParticiple } from './types/conjugator';
import { bytiPresent, bytiImperfect, bytiFuture, conditionalParticles } from './auxiliary';
import {applyIotation} from "@/lib/grammar/morphonology";

export function conjugateFullVerb(verb: VerbModel): ConjugationResult {
    const { infinitive, infStem, presentStem, aoristStem, verbClass, aspect } = verb;

    // 1. Генерация L-причастия (база для сложных времён)
    const lParticiple: LParticiple = {
        masculine: `${infStem}l`,
        feminine: `${infStem}la`,
        neuter: `${infStem}lo`,
        dual_masculine: `${infStem}la`,
        dual_feminine_neuter: `${infStem}lě`,
        plural_masculine: `${infStem}li`,
        plural_feminine_neuter: `${infStem}le`,
    };

    // 2. Настоящее / Бесприставочное Будущее время (Презенс)
    // Базовая основа без тематического гласного для форм 1sg и 3pl
    // Если основа оканчивается на 'e' (например, "spasaje"), отсекаем его для гласных окончаний
    const hasThematicE = presentStem.endsWith('e');
    const baseForVowels = hasThematicE ? presentStem.slice(0, -1) : presentStem;

    // 1. Форма 1-го лица единственного числа (1sg)
    let p1sg = '';
    if (verbClass === 'IV') {
        const root = presentStem.slice(0, -1); // Отрезаем -i-
        p1sg = `${applyIotation(root)}ų`;     // Например: roditi -> rožų
    } else {
        p1sg = `${baseForVowels}ų`;           // ИСПРАВЛЕНО: spasaje -> spasaj + ų = spasajų
    }

    // 2. Форма 3-го лица множественного числа (3pl)
    const p3pl = verbClass === 'IV'
        ? `${presentStem.slice(0, -1)}ęt`
        : `${baseForVowels}ųt`;               // ИСПРАВЛЕНО: spasaje -> spasaj + ųt = spasajųt

    // Сборка полной парадигмы
    const directParadigm: FullParadigm = {
        // Единственное
        '1sg': p1sg,
        '2sg': `${presentStem}š`,             // spasaješ
        '3sg': `${presentStem}`,              // spasaje

        // Двойственное
        '1du': `${presentStem}vě`,            // spasajevě
        '2du': `${presentStem}ta`,            // spasajeta
        '3du': `${presentStem}ta`,            // spasajeta

        // Множественное
        '1pl': `${presentStem}mo`,            // spasajemo
        '2pl': `${presentStem}te`,            // spasajete
        '3pl': p3pl,                          // spasajųt
    };

    // 3. АОРИСТ (Сигматический или простой в зависимости от праславянской основы)
    // Для основ на согласный (I класс) в 2sg/3sg окончание нулевое (-е), для гласных - сербско-хорватский/старославянский тип
    const isVowelStem = ['III', 'IV'].includes(verbClass) || infStem.endsWith('a') || infStem.endsWith('i');
    const aorist: FullParadigm = {
        '1sg': `${aoristStem}h`,
        '2sg': isVowelStem ? `${aoristStem}` : `${aoristStem}e`,
        '3sg': isVowelStem ? `${aoristStem}` : `${aoristStem}e`,
        '1du': `${aoristStem}hvě`,
        '2du': `${aoristStem}sta`,
        '3du': `${aoristStem}sta`,
        '1pl': `${aoristStem}hmo`,
        '2pl': `${aoristStem}ste`,
        '3pl': `${aoristStem}šę`,
    };

    // 4. ИМПЕРФЕКТ (Основы на -ах- / -ěах-)
    const impBase = isVowelStem ? infStem : `${infStem}ě`;
    const imperfect: FullParadigm = {
        '1sg': `${impBase}ah`,     '2sg': `${impBase}aše`,    '3sg': `${impBase}aše`,
        '1du': `${impBase}ahvě`,   '2du': `${impBase}ašeta`,  '3du': `${impBase}ašeta`,
        '1pl': `${impBase}ahmo`,   '2pl': `${impBase}ašete`,  '3pl': `${impBase}ahu`,
    };

    // Helper для сборки аналитических форм (Глагол + Причастие)
    const buildAnalytical = (aux: FullParadigm, part: string): FullParadigm => {
        const res = {} as FullParadigm;
        (Object.keys(aux) as Array<keyof FullParadigm>).forEach((key) => {
            res[key] = `${aux[key]} ${part}`;
        });
        return res;
    };

    // 5. ПЕРФЕКТ (jesm + L-participle)
    const perfect = {
        masculine: buildAnalytical(bytiPresent, lParticiple.masculine),
        feminine: buildAnalytical(bytiPresent, lParticiple.feminine),
        neuter: buildAnalytical(bytiPresent, lParticiple.neuter),
        plural: buildAnalytical(bytiPresent, lParticiple.plural_masculine),
    };

    // 6. ПЛЮСКВАМПЕРФЕКТ (běh + L-participle)
    const pluperfect = {
        masculine: buildAnalytical(bytiImperfect, lParticiple.masculine),
        feminine: buildAnalytical(bytiImperfect, lParticiple.feminine),
    };

    // 7. АНАЛИТИЧЕСКОЕ БУДУЩЕЕ (только для несовершенного вида)
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

    // 8. ИМПЕРАТИВ (Повелительное наклонение)
    let impBaseForm = '';

    if (verbClass === 'IV') {
        // Для IV класса (i-основы) императив образуется на -и (-i-)
        impBaseForm = `${presentStem}`; // Напр., говори
    } else {
        // Для классов I, II, III (e-основы) суффикс -ј- замещает тематический -е-
        const hasThematicE = presentStem.endsWith('e');
        const rootWithoutE = hasThematicE ? presentStem.slice(0, -1) : presentStem;

        // Если корень уже оканчивается на -ј (как spasaj), дополнительный суффикс не дублируется
        impBaseForm = rootWithoutE.endsWith('j') ? rootWithoutE : `${rootWithoutE}j`;
    }

    const imperative = {
        '2sg': impBaseForm,               // ИСПРАВЛЕНО: spasaj
        '1du': `${impBaseForm}vě`,         // ИСПРАВЛЕНО: spasajvě
        '2du': `${impBaseForm}ta`,         // ИСПРАВЛЕНО: spasajta
        '1pl': `${impBaseForm}mo`,         // ИСПРАВЛЕНО: spasajmo
        '2pl': `${impBaseForm}te`,         // ИСПРАВЛЕНО: spasajte
    };

    // 9. СОСЛАГАТЕЛЬНОЕ НАКЛОНЕНИЕ (КОНДИЦИОНАЛ)
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
    };
}
