import { heuristicStem } from './heuristicStem';
import { PosType } from './pos';
import { GrammaticalCase } from './case';

/**
 * Результат парсинга addition-поля лексемы.
 *
 * Поле addition в CSV содержит грамматическую информацию в скобках.
 * Форматы: (a, b; c) — секции с запятыми и точкой с запятой для аномалий флексий,
 * (+2) — управляемый падеж, (-ogo) — аномалия склонения, # — пропуск слова.
 *
 * Для глаголов секции с ; дают: sections[0] → secondaryStem (основа презенса),
 * sections[1] → tertiaryStem (основа l-причастия, извлекается через extractPastStem).
 */
export interface AdditionParseResult {
  /** Основа презенса / secondary stem (для глаголов — из первой секции) */
  secondaryStem: string | null;
  /** Основа l-причастия (для глаголов — из второй секции, через extractPastStem) */
  tertiaryStem: string | null;
  /** Аномалии флексий (нестандартные окончания) */
  anomalies: AdditionAnomaly[];
  /** Управляемый падеж: 2=GEN, 3=DAT, 4=ACC, 5=INS, 6=LOC. Из (+N) маркера */
  governsCase: number | null;
  /** true если есть аномалии флексий */
  hasAnomalies: boolean;
  /** true если слово помечено # (пропущено) */
  isOmitted: boolean;
}

/** Маппинг числового управляющего падежа из (+N) в GrammaticalCase */
export const GOVERNED_CASE_MAP: Record<number, GrammaticalCase> = {
  2: GrammaticalCase.GEN,
  3: GrammaticalCase.DAT,
  4: GrammaticalCase.ACC,
  5: GrammaticalCase.INS,
  6: GrammaticalCase.LOC,
};

/**
 * Конвертирует числовой управляющий падеж (2-6) в GrammaticalCase enum.
 * Используется при сохранении governsCase из addition-поля.
 */
export function governsCaseToGrammaticalCase(n: number | null): GrammaticalCase | null {
  if (n === null || n === undefined) return null;
  return GOVERNED_CASE_MAP[n] || null;
}

export interface AdditionAnomaly {
  inflection: string;
  grammeme: string;
}

const FLEETING_VOWELS = new Set(['ě', 'ė', 'e', 'ь', 'ъ']);

function extractPastStem(raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned.endsWith('l')) return cleaned;
  const withoutL = cleaned.slice(0, -1);
  if (withoutL.length > 0 && FLEETING_VOWELS.has(withoutL[withoutL.length - 1])) {
    return withoutL.slice(0, -1);
  }
  return withoutL;
}

const SECTION_GRAMMEMES_VERB = ['PRES', 'L_PART', 'FUT'];
const SECTION_GRAMMEME_DEFAULT = 'FORM';

/**
 * Парсит addition-поле из CSV.
 *
 * Форматы:
 *  - `#` — слово пропущено (isOmitted: true)
 *  - `(+2)..(+6)` — управляемый падеж (governsCase), стриппится из хвоста
 *  - `(-ogo)` — аномалия флексии (маппится через ANOMALY_GRAMMEME_MAP)
 *  - `(a, b; c, d)` — multi-section: для глаголов sections[0]→PRES, [1]→L_PART, [2]→FUT
 *  - `(a, b)` — comma-separated: несколько форм одной аномалии
 *  - `(stem)` — для глаголов: secondaryStem; для прочих: аномалия
 */
export function parseAddition(addition: string | null, pos?: string | null): AdditionParseResult {
  const result: AdditionParseResult = {
    secondaryStem: null,
    tertiaryStem: null,
    anomalies: [],
    governsCase: null,
    hasAnomalies: false,
    isOmitted: false,
  };

  if (!addition) return result;

  const trimmed = addition.trim();

  if (trimmed === '#') {
    result.isOmitted = true;
    return result;
  }

  let mainPart = trimmed;
  const governsCaseMatch = trimmed.match(/\(\+(\d)\)\s*$/);
  if (governsCaseMatch) {
    result.governsCase = parseInt(governsCaseMatch[1], 10);
    mainPart = trimmed.slice(0, governsCaseMatch.index).trim();
  }

  if (!mainPart.startsWith('(') || !mainPart.endsWith(')')) return result;

  const inner = mainPart.slice(1, -1);

  if (inner.startsWith('+')) {
    const numMatch = inner.match(/^\+(\d)$/);
    if (numMatch) {
      result.governsCase = parseInt(numMatch[1], 10);
    }
    return result;
  }

  if (inner.startsWith('-')) {
    const grammeme = mapAnomalyGrammeme(inner);
    result.anomalies.push({ inflection: inner, grammeme });
    result.hasAnomalies = true;
    return result;
  }

  if (inner.includes(';')) {
    const sections = inner.split(';').map(s => s.trim());
    const isVerb = pos?.toUpperCase() === PosType.VERB;

    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      const forms = section.split(',').map(f => f.trim()).filter(Boolean);
      if (forms.length === 0) continue;
      if (forms.length === 1 && forms[0] === pos) continue;

      const grammeme = isVerb && si < SECTION_GRAMMEMES_VERB.length
        ? SECTION_GRAMMEMES_VERB[si]
        : SECTION_GRAMMEME_DEFAULT;

      for (const form of forms) {
        if (form.includes('/')) {
          const subForms = form.split('/').map(f => f.trim()).filter(Boolean);
          for (const sf of subForms) {
            result.anomalies.push({ inflection: sf, grammeme });
          }
        } else {
          result.anomalies.push({ inflection: form, grammeme });
        }
      }
    }

    result.hasAnomalies = true;

    if (isVerb && sections.length > 0) {
      const firstForms = sections[0].split(',').map(f => f.trim()).filter(Boolean);
      if (firstForms.length > 0) {
        const firstForm = firstForms[0].split('/')[0].trim();
        result.secondaryStem = heuristicStem(firstForm, pos);
      }
    }

    if (isVerb && sections.length > 1) {
      const secondForms = sections[1].split(',').map(f => f.trim()).filter(Boolean);
      if (secondForms.length > 0) {
        const secondForm = secondForms[0].split('/')[0].trim();
        result.tertiaryStem = extractPastStem(secondForm);
      }
    }

    return result;
  }

  if (inner.includes(',')) {
    const forms = inner.split(',').map(f => f.trim()).filter(Boolean);
    for (const form of forms) {
      result.anomalies.push({
        inflection: form,
        grammeme: 'FORM',
      });
    }
    result.hasAnomalies = true;
    return result;
  }

  const singleForm = inner.trim();
  if (pos?.toUpperCase() === PosType.VERB) {
    result.secondaryStem = heuristicStem(singleForm, pos);
    result.hasAnomalies = false;
  } else {
    result.anomalies.push({
      inflection: singleForm,
      grammeme: 'FORM',
    });
    result.hasAnomalies = true;
  }

  return result;
}

const ANOMALY_GRAMMEME_MAP: Record<string, string> = {
  '-ogo': 'MASC_GEN_SG',
  '-ego': 'MASC_GEN_SG',
  '-yh': 'PL_GEN',
  '-yje': 'ADV_COMP',
};

function mapAnomalyGrammeme(inflection: string): string {
  return ANOMALY_GRAMMEME_MAP[inflection] || 'ANOMALY';
}