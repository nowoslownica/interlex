import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CSV_PATH = join(__dirname, '..', 'meanings_definitions.csv');

function pick(arr: string[], index: number): string {
  return arr[index % arr.length];
}

function fill(tpl: string, word: string, root: string): string {
  return tpl.replace(/WORD/g, word).replace(/ROOT/g, root);
}

const DEFS: Record<string, { def: string[]; ex: string[] }> = {
  nik: {
    def: [
      'Osoba, ktora jest profesionalno svęzana s ROOTom',
      'Clovek, ktory dělaje ili upravlja ROOT',
      'Ten, ktory se zańmaje ROOTom',
      'Osoba, ktora ima odnošenje k ROOTu',
    ],
    ex: [
      'On jest doby **WORD** i dělaje svoju rabotu dobro.',
      'Kazdy **WORD** v nasej firme ima svoje obovezky.',
    ],
  },
  telj: {
    def: ['Clovek, ktory dělaje ROOT', 'Dejatelj v oblasty ROOTa', 'Osoba, ktora provodi ROOT'],
    ex: ['**WORD** jest izvestny v svojej oblasty.', 'On rabota kako **WORD** uz mnogo let.'],
  },
  ist: {
    def: ['Specialist v oblasty ROOTa', 'Osoba, ktora ima znanje v ROOTe', 'Profesional v ROOTe'],
    ex: ['**WORD** izucil svoju specialnost v universitetě.', 'Izvestny **WORD** napisal knigu o ROOTe.'],
  },
  ar: {
    def: ['Majstor, ktory profesionalno rabota s ROOTom', 'Osoba, ktora dělaje ROOT kako remeslo'],
    ex: ['**WORD** dělaje svoju rabotu s majstorstvom.', 'Kazdy **WORD** v nasem cehu jest profesional.'],
  },
  ec: {
    def: ['Clovek, ktory ima svojstvo ROOTa', 'Osoba, ktora proishodit iz ROOTa'],
    ex: ['**WORD** jest izvestny v nasej obscine.', 'On jest **WORD** i gordi se tim.'],
  },
  ostj: {
    def: ['Svojstvo ili kvalitet byti ROOTym', 'Abstraktna kategorija, vyrazajuca stanje ROOTa'],
    ex: ['**WORD** jest vazna kvaliteta kazdogo cloveka.', 'Oni cenet **WORD** v svojih odnosenjah.'],
  },
  stvo: {
    def: ['Stanje ili skup svęzany s ROOTom', 'Socialny fenomen svęzany s ROOTom'],
    ex: ['**WORD** ima davnu tradiciju v nasej kulture.', 'Oni organizovali **WORD** v svojem regione.'],
  },
  cija: {
    def: ['Proces ili sistem svęzany s ROOTom', 'Formalny proces v oblasty ROOTa'],
    ex: ['**WORD** byla provedena po vsih pravylah.', 'Proces **WORDi** trval dlgoje vreme.'],
  },
  ija: {
    def: ['Abstraktny pojętje svęzane s ROOTom', 'Naučna ili politična oblast ROOTa'],
    ex: ['**WORD** jest vazna čest nasej kultury.', 'Oni izucajut **WORD** v univerzitetě.'],
  },
  ba: {
    def: ['Proces ili rezultat dejstvija svęzanogo s ROOTom', 'Aktivnost v kontekstě ROOTa'],
    ex: ['**WORD** jest vazna v praktičnoj rabotě.', 'Oni provedut **WORD** regularno.'],
  },
  anje: {
    def: ['Proces dělovanja, ktory jest svęzany s ROOTom', 'Dejstvije ili jego rezultat'],
    ex: ['**WORD** jest vazny proces v nasej rabotě.', 'Proces **WORDa** trval veke casov.'],
  },
  enje: {
    def: ['Proces dejstvija svęzanogo s ROOTom', 'Rezultat dělovanja'],
    ex: ['**WORD** bylo izpolneno uspešno.', 'Proces **WORDa** jest slozny.'],
  },
  ina: {
    def: ['Objekt ili substancija svęzana s ROOTom', 'Rastjenje ili pojav svęzany s ROOTom'],
    ex: ['**WORD** rastet v nasem sadu.', 'Ona kupila **WORD** na trgu.'],
  },
  ica: {
    def: ['Maly objekt ili osoba svęzana s ROOTom', 'Feminitiv ili mali predmet'],
    ex: ['**WORD** jest ocen lepa.', 'Ona nosi **WORD** v ručkě.'],
  },
  ka: {
    def: ['Maly objekt ili feminitiv svęzany s ROOTom', 'Predmet s svojstvom ROOTa'],
    ex: ['**WORD** jest na stolě.', 'Ona dala mi **WORD** na pametku.'],
  },
  ny: {
    def: ['Ktory ima svojstvo ROOTa', 'Odnosecy se k ROOTu', 'Ktory jest ROOTny'],
    ex: ['To jest **WORD** objekt s vaznymi svojstvami.', 'Oni imajut **WORD** tradiciju.'],
  },
  sky: {
    def: ['Odnosecy se k ROOTu', 'Prinadlezny k ROOTu ili jego kulture'],
    ex: ['**WORD** tradicija jest dobro izvestna.', 'To jest **WORD** produkt.'],
  },
  ovy: {
    def: ['Scinieny iz ROOTa', 'Imajuci svojstvo ROOTa'],
    ex: ['**WORD** material jest trvanlivy.', 'Oni kupili **WORD** produkt.'],
  },
  ivy: {
    def: ['Imajuci sklonnost k ROOTu', 'Ktory rado dělaje ROOT'],
    ex: ['Ona jest ocenj **WORD** i iniciativna.', '**WORD** clovek jest rad v obscestvě.'],
  },
  y: {
    def: ['Ktory ima svojstvo ROOTa', 'Ktory jest charakterizovany ROOTom'],
    ex: ['**WORD** element jest vazny.', 'To jest **WORD** objekt.'],
  },
  ati: {
    def: ['Ciniti ili provoditi ROOT', 'Ispolnjati dejstvije svęzano s ROOTom'],
    ex: ['Oni rado **WORD** v svojem volnom vremeni.', 'Ona umeje **WORD** od detstva.'],
  },
  iti: {
    def: ['Ciniti dejstvije svęzano s ROOTom', 'Ispolnjati ROOTenje'],
    ex: ['On **WORD** kazdy denj s radostju.', 'Ona naucila **WORD** v molodosti.'],
  },
  ovati: {
    def: ['Provoditi proces ROOTovanja', 'Ispolnjati dejstvije reguljarno'],
    ex: ['Oni **WORD** svoju rabotu profesionalno.', 'Specialisty **WORD** dokumentaciju.'],
  },
  eti: {
    def: ['Nahoditi se v stanju ROOTa', 'Proizvoditi dejstvije svęzano s ROOTom'],
    ex: ['On **WORD** i ne obratit vnimanja.', 'Ona načela **WORD** vcera.'],
  },
  nuti: {
    def: ['Izvršiti dejstvije v jedinom momentu', 'Svršiti ili proizvesti ROOT'],
    ex: ['On **WORD** i prodolžil dalej.', 'Ona **WORD** v posledny moment.'],
  },
  adv_o: {
    def: ['Narcie: v ROToj sposob', 'Narcie: s ROToj kvalitetoju'],
    ex: ['On dělaje to **WORD** i bez problemov.', 'To jest **WORD** vazno.'],
  },
  generic: {
    def: ['Objekt ili pojętje, ktory jest svęzany s ROOTom', 'Predmet ili koncept oznaceny slovom WORD'],
    ex: ['**WORD** jest vazny v nasej kulture.', 'Oni izucajut **WORD** v skole.'],
  },
  multi: {
    def: ['Slovosočetanje, označajuče konkretny pojętje', 'Frazeologiceska jedinica'],
    ex: ['**WORD** jest izvestny pojętje.', 'Oni izucajut **WORD** v kontekstě.'],
  },
  det: {
    def: ['Cislitelno, označajuče kolicestvo ili čislo', 'Cislitelnoje slovo'],
    ex: ['**WORD** jest vazno čislo.', 'Oni izbrali **WORD** kako reiultat.'],
  },
  prep: {
    def: ['Predlog, vyražajuci prostranstveny ili vremenny vztah', 'Sluzebnoje slovo'],
    ex: ['On stoit **WORD** domom.', 'Idi **WORD** nego.'],
  },
  conj: {
    def: ['Spojka, svezujuca slova ili vety', 'Spojka, sojedinjajuca časti reci'],
    ex: ['On **WORD** ona pridut.', 'To **WORD** ono.'],
  },
  pron: {
    def: ['Mestoimenje, ukazujuce na osobu ili predmet', 'Mestoimenje lično'],
    ex: ['**WORD** to jest.', 'To jest **WORD**.'],
  },
  interj: {
    def: ['Meždometje, vyrazajuce emocije ili reagovanje', 'Meždometje'],
    ex: ['**WORD!** On skazal.', '**WORD**, ovo jest divno.'],
  },
};

const SUFFIXES: Array<{ suffix: string; key: string; minLen: number }> = [
  { suffix: 'nik', key: 'nik', minLen: 5 },
  { suffix: 'telj', key: 'telj', minLen: 6 },
  { suffix: 'tel', key: 'telj', minLen: 5 },
  { suffix: 'ist', key: 'ist', minLen: 5 },
  { suffix: 'ar', key: 'ar', minLen: 4 },
  { suffix: 'ec', key: 'ec', minLen: 4 },
  { suffix: 'ba', key: 'ba', minLen: 4 },
  { suffix: 'ostj', key: 'ostj', minLen: 6 },
  { suffix: 'os\'c', key: 'ostj', minLen: 6 },
  { suffix: 'stvo', key: 'stvo', minLen: 6 },
  { suffix: 'cija', key: 'cija', minLen: 6 },
  { suffix: 'ija', key: 'ija', minLen: 5 },
  { suffix: 'iia', key: 'ija', minLen: 5 },
  { suffix: 'anje', key: 'anje', minLen: 5 },
  { suffix: 'enje', key: 'enje', minLen: 5 },
  { suffix: 'nije', key: 'enje', minLen: 5 },
  { suffix: 'ina', key: 'ina', minLen: 5 },
  { suffix: 'ica', key: 'ica', minLen: 5 },
  { suffix: 'ka', key: 'ka', minLen: 4 },
  { suffix: 'liwy', key: 'ivy', minLen: 6 },
  { suffix: 'ivy', key: 'ivy', minLen: 5 },
  { suffix: 'ovy', key: 'ovy', minLen: 5 },
  { suffix: 'sky', key: 'sky', minLen: 5 },
  { suffix: 'ny', key: 'ny', minLen: 4 },
  { suffix: 'y', key: 'y', minLen: 3 },
  { suffix: 'ovati', key: 'ovati', minLen: 7 },
  { suffix: 'nuti', key: 'nuti', minLen: 6 },
  { suffix: 'ati', key: 'ati', minLen: 5 },
  { suffix: 'iti', key: 'iti', minLen: 5 },
  { suffix: 'eti', key: 'eti', minLen: 5 },
];

function getRoot(word: string): string {
  const lower = word.toLowerCase();
  for (const { suffix, key } of SUFFIXES) {
    if (lower.endsWith(suffix) && lower.length >= suffix.length + 2) {
      if (suffix === 'y' && ['ny', 'sky', 'ivy', 'ovy', 'liwy', 'ky'].some((s) => lower.endsWith(s) && s !== 'y')) {
        continue;
      }
      return lower.slice(0, -suffix.length);
    }
  }
  return lower.slice(0, Math.min(lower.length, 4));
}

function resolve(word: string): { def: string; ex: string } {
  const lower = word.toLowerCase().trim();
  const cap = word.charAt(0).toUpperCase() + word.slice(1);

  if (lower.includes(' ')) {
    const tpl = DEFS.multi;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  const shortWords: string[] = [
    'jedan', 'jeden', 'dva', 'tri', 'cetyri', 'cetvere', 'pet', 'sest', 'sedm', 'osem', 'devet', 'deset',
    'sto', 'tysec', 'tysuc',
  ];
  if (shortWords.includes(lower)) {
    const tpl = DEFS.det;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  const preps = ['v', 'vo', 'na', 'po', 'pod', 'nad', 'iz', 'izpod', 'do', 'od', 'u', 'za', 'pred',
    'medzu', 'mimo', 'k', 'ke', 'bez', 'prez', 'crez', 'dla', 'dlja', 'radi', 'okolo', 'bliz',
    'protiv', 'posle', 'posle', 'pri', 'skrze', 'su', 'so'];
  if (preps.includes(lower)) {
    const tpl = DEFS.prep;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  const conj = ['i', 'a', 'ale', 'no', 'abo', 'ili', 'da', 'ze', 'bo', 'jer', 'poneze', 'zato',
    'tako', 'takze', 'tez', 'jednako', 'koli', 'nez', 'nego', 'kogda', 'kedy', 'gdy', 'ako',
    'jesli', 'by', 'aby', 'kako', 'jakoby', 'jako'];
  if (conj.includes(lower)) {
    const tpl = DEFS.conj;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  const prons = ['ja', 'ty', 'my', 'vy', 'on', 'ona', 'ono', 'oni', 'one', 'se', 'svoj', 'moj', 'tvoj',
    'nas', 'vas', 'cto', 'sto', 'kto', 'nikto', 'necto', 'nekto', 'kojy', 'kaky', 'cij', 'sam'];
  if (prons.includes(lower)) {
    const tpl = DEFS.pron;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  const interjs = ['ah', 'oh', 'eh', 'oj', 'aj', 'hej', 'nu', 'hura', 'bravo', 'bis', 'dosti', 'stop'];
  if (interjs.includes(lower)) {
    const tpl = DEFS.interj;
    return { def: fill(pick(tpl.def, word.length), cap, ''), ex: fill(pick(tpl.ex, word.length), cap, '') };
  }

  if (lower.endsWith('o') && lower.length > 2 && !lower.endsWith('stvo') && !lower.endsWith('sko')) {
    const root = lower.slice(0, -1);
    const tpl = DEFS.adv_o;
    return { def: fill(pick(tpl.def, word.length), cap, root), ex: fill(pick(tpl.ex, word.length), word, root) };
  }

  for (const { suffix, key } of SUFFIXES) {
    if (lower.endsWith(suffix) && lower.length >= suffix.length + 2) {
      if (suffix === 'y' && ['ny', 'sky', 'ivy', 'ovy', 'liwy', 'ky'].some((s) => lower.endsWith(s) && s !== 'y')) {
        continue;
      }
      const root = lower.slice(0, -suffix.length);
      const tpl = DEFS[key];
      if (tpl) {
        return { def: fill(pick(tpl.def, word.length), cap, root), ex: fill(pick(tpl.ex, word.length), word, root) };
      }
    }
  }

  const root = lower.slice(0, Math.min(lower.length, 4));
  const tpl = DEFS.generic;
  return { def: fill(pick(tpl.def, word.length), cap, root), ex: fill(pick(tpl.ex, word.length), cap, root) };
}

function escapeCsv(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function main() {
  const lines = readFileSync(CSV_PATH, 'utf-8').split('\n');
  const outputLines: string[] = [lines[0]];
  let generated = 0;
  let existing = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = line.split(';');

    if (parts.length >= 4 && parts[2]?.trim()) {
      outputLines.push(line);
      existing++;
      continue;
    }

    if (parts.length === 3) {
      const mid = parts[0];
      const raw = parts[1];
      const ex = parts[2] || '';
      const commaIdx = raw.indexOf(',');
      const word = commaIdx > 0 ? raw.slice(0, commaIdx).trim() : raw.trim();
      const def = commaIdx > 0 ? raw.slice(commaIdx + 1).trim() : '';
      outputLines.push(`${mid};${word};${escapeCsv(def)};${escapeCsv(ex)}`);
      continue;
    }

    if (parts.length === 2) {
      const mid = parts[0];
      const word = parts[1].trim();
      const result = resolve(word);
      outputLines.push(`${mid};${word};${escapeCsv(result.def)};${escapeCsv(result.ex)}`);
      generated++;
    }
  }

  writeFileSync(CSV_PATH, outputLines.join('\n') + '\n', 'utf-8');
  console.log(`Done. Existing: ${existing}, Generated: ${generated}, Total: ${outputLines.length - 1}`);
}

main();