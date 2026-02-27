export type Benefit = {
  id: string
  label: string
  category: string
}

export const BENEFIT_CATALOG: Benefit[] = [
  { id: 'nutrition',          label: 'Nutrición',                       category: 'Servicios' },
  { id: 'training',           label: 'Entrenamiento',                   category: 'Servicios' },
  { id: 'weights',            label: 'Pesas',                           category: 'Servicios' },
  { id: 'cardio',             label: 'Cardio',                          category: 'Servicios' },
  { id: 'routine',            label: 'Rutina',                          category: 'Servicios' },
  { id: 'physical_therapy',   label: 'Terapia Física',                  category: 'Servicios' },
]

export const BENEFIT_CATEGORIES = [...new Set(BENEFIT_CATALOG.map(b => b.category))]

export function getBenefitLabel(id: string): string {
  return BENEFIT_CATALOG.find(b => b.id === id)?.label ?? id
}
