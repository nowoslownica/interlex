export interface RelationConfig {
  label: string
  labelSingle: string
  labelSingleShort: string
  tableName: string
  navHref: string
  featureKey: string
  color: string
  description: string
}

export type RelationType =
  | "hypernyms"
  | "hyponyms"
  | "meronyms"
  | "holonyms"
  | "related-words"
  | "causes"
  | "effects"
  | "premises"
  | "conclusions"

export const RELATION_CONFIG: Record<RelationType, RelationConfig> = {
  hypernyms: {
    label: "Гиперонимы",
    labelSingle: "гипероним",
    labelSingleShort: "гип.",
    tableName: "hypernyms",
    navHref: "/admin/relations/hypernyms",
    featureKey: "hypernyms_edit",
    color: "blue",
    description: "привязать родовые понятия (IS-A parent)",
  },
  hyponyms: {
    label: "Гипонимы",
    labelSingle: "гипоним",
    labelSingleShort: "ип.",
    tableName: "hyponyms",
    navHref: "/admin/relations/hyponyms",
    featureKey: "hyponyms_edit",
    color: "purple",
    description: "привязать видовые понятия (IS-A child)",
  },
  meronyms: {
    label: "Меронимы",
    labelSingle: "мероним",
    labelSingleShort: "мер.",
    tableName: "meronyms",
    navHref: "/admin/relations/meronyms",
    featureKey: "meronyms_edit",
    color: "green",
    description: "привязать части (part-of)",
  },
  holonyms: {
    label: "Холонимы",
    labelSingle: "холоним",
    labelSingleShort: "хол.",
    tableName: "holonyms",
    navHref: "/admin/relations/holonyms",
    featureKey: "holonyms_edit",
    color: "orange",
    description: "привязать целое (has-part)",
  },
  "related-words": {
    label: "Связанные слова",
    labelSingle: "связанное",
    labelSingleShort: "свз.",
    tableName: "related_words",
    navHref: "/admin/relations/related-words",
    featureKey: "related_words_edit",
    color: "slate",
    description: "привязать связанные понятия",
  },
  causes: {
    label: "Причины",
    labelSingle: "причина",
    labelSingleShort: "прч.",
    tableName: "causes",
    navHref: "/admin/relations/causes",
    featureKey: "causes_edit",
    color: "amber",
    description: "глагольные причины",
  },
  effects: {
    label: "Следствия",
    labelSingle: "следствие",
    labelSingleShort: "слд.",
    tableName: "effects",
    navHref: "/admin/relations/effects",
    featureKey: "effects_edit",
    color: "rose",
    description: "глагольные следствия",
  },
  premises: {
    label: "Предпосылки",
    labelSingle: "предпосылка",
    labelSingleShort: "прд.",
    tableName: "premises",
    navHref: "/admin/relations/premises",
    featureKey: "premises_edit",
    color: "teal",
    description: "глагольные предпосылки",
  },
  conclusions: {
    label: "Заключения",
    labelSingle: "заключение",
    labelSingleShort: "зкл.",
    tableName: "conclusions",
    navHref: "/admin/relations/conclusions",
    featureKey: "conclusions_edit",
    color: "indigo",
    description: "глагольные заключения",
  },
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "bg-blue-500/5", text: "text-blue-600", border: "border-blue-500/20" },
  purple: { bg: "bg-purple-500/5", text: "text-purple-600", border: "border-purple-500/20" },
  green: { bg: "bg-green-500/5", text: "text-green-600", border: "border-green-500/20" },
  orange: { bg: "bg-orange-500/5", text: "text-orange-600", border: "border-orange-500/20" },
  slate: { bg: "bg-slate-500/5", text: "text-slate-600", border: "border-slate-500/20" },
  amber: { bg: "bg-amber-500/5", text: "text-amber-600", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/5", text: "text-rose-600", border: "border-rose-500/20" },
  teal: { bg: "bg-teal-500/5", text: "text-teal-600", border: "border-teal-500/20" },
  indigo: { bg: "bg-indigo-500/5", text: "text-indigo-600", border: "border-indigo-500/20" },
}

export function getRelationColors(colorName: string) {
  return COLOR_MAP[colorName] || COLOR_MAP.blue
}

export function isValidRelationType(type: string): type is RelationType {
  return type in RELATION_CONFIG
}