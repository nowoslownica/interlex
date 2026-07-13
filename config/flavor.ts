export const FLAVOR_CODES = ["CORE", "NSL", "EAST", "WEST", "SOUTH"] as const

export type Flavor = (typeof FLAVOR_CODES)[number]

export const FLAVOR_METADATA: Record<Flavor, { label: string; labelRu: string }> = {
  CORE: { label: "CORE (Medžuslovjansky)", labelRu: "CORE (Меджусловянский)" },
  NSL:  { label: "NSL (Novoslovjansky)",   labelRu: "NSL (Новославянский)" },
  EAST: { label: "EAST (Vostočny)",        labelRu: "EAST (Восточный)" },
  WEST: { label: "WEST (Zapadny)",         labelRu: "WEST (Западный)" },
  SOUTH: { label: "SOUTH (Južny)",         labelRu: "SOUTH (Южный)" },
}

export function getFlavorLabel(code: string): string {
  if (isFlavor(code)) {
    return FLAVOR_METADATA[code].label
  }
  return code
}

export function isFlavor(code: string): code is Flavor {
  return FLAVOR_CODES.includes(code as Flavor)
}