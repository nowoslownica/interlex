import {init} from "@/lib/sqlite";
import {fetchSymmetricSemanticRelations} from "@/lib/relations";
import {fetchTranslationsForLexeme} from "@/lib/translations";

export const getItem = async (id: string) => {
  const db = await init();

  const data = db.prepare('select * from lexemes where id = ?').get(id) as any;

  const allophones = db.prepare(`
    SELECT la.value, af.code AS flavorCode, la.type
    FROM lexeme_allophones la
    JOIN allophone_flavors af ON af.id = la.flavorId
    WHERE la.lexemeId = ?
  `).all(id) as { value: string; flavorCode: string; type: string }[];

  const word = allophones.find(a => a.flavorCode === 'CORE' && a.type === 'standard') || null;
  const isv = word?.value;
  const nsl = allophones.find(a => a.flavorCode === 'NSL' && a.type === 'standard')?.value;

  const roots = db.prepare(`
    select * from morphemes where id IN (select morphemeId from lexemes_morphemes where lexemeId = ?)
  `).all(id);

  const meanings = db.prepare('select * from meanings where lexemeId = ?').all(id) as any[];

  const meaningIds = meanings.map(m => m.id);

  let synonymsByMeaning: Record<number, any[]> = {};
  let antonymsByMeaning: Record<number, any[]> = {};

  if (meaningIds.length > 0) {
    const synonymMap = fetchSymmetricSemanticRelations(db, 'synonym', meaningIds);
    for (const [meaningId, related] of synonymMap) {
      synonymsByMeaning[meaningId] = related.map((r) => ({
        sourceMeaningId: meaningId,
        targetMeaningId: r.otherMeaningId,
        targetMeaning: r.otherMeaning,
        targetWord: r.otherWord,
        targetWordId: r.otherWordId,
      }));
    }

    const antonymMap = fetchSymmetricSemanticRelations(db, 'antonym', meaningIds);
    for (const [meaningId, related] of antonymMap) {
      antonymsByMeaning[meaningId] = related.map((r) => ({
        sourceMeaningId: meaningId,
        targetMeaningId: r.otherMeaningId,
        targetMeaning: r.otherMeaning,
        targetWord: r.otherWord,
        targetWordId: r.otherWordId,
      }));
    }
  }

  const meaningsWithRelations = meanings.map(m => ({
    ...m,
    synonyms: synonymsByMeaning[m.id] || [],
    antonyms: antonymsByMeaning[m.id] || [],
  }));

  const byLang = fetchTranslationsForLexeme(db, parseInt(id, 10));
  const emptyArr: never[] = [];
  const ru = byLang.ru ?? emptyArr;
  const en = byLang.en ?? emptyArr;
  const uk = byLang.uk ?? emptyArr;
  const be = byLang.be ?? emptyArr;
  const bg = byLang.bg ?? emptyArr;
  const sr = byLang.sr ?? emptyArr;
  const mk = byLang.mk ?? emptyArr;
  const hr = byLang.hr ?? emptyArr;
  const sl = byLang.sl ?? emptyArr;
  const pl = byLang.pl ?? emptyArr;
  const cs = byLang.cs ?? emptyArr;
  const sk = byLang.sk ?? emptyArr;
  const de = byLang.de ?? emptyArr;
  const nl = byLang.nl ?? emptyArr;
  const eo = byLang.eo ?? emptyArr;
  const cu = byLang.cu ?? emptyArr;
  const hsb = byLang.hsb ?? emptyArr;
  const dsb = byLang.dsb ?? emptyArr;

  return {
    ...data,
    word,
    isv,
    nsl,
    allophones,
    meanings: meaningsWithRelations,
    en,
    ru,
    uk,
    be,
    bg,
    sr,
    hr,
    mk,
    sl,
    pl,
    cs,
    sk,
    de,
    nl,
    eo,
    cu,
    hsb,
    dsb,
    roots,
  };
};