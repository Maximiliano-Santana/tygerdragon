export type Benefit = {
  id: string
  label: string
  category: string
}

export const BENEFIT_CATALOG: Benefit[] = [
  // Acceso
  { id: 'weights',            label: 'Sala de pesas',                   category: 'Acceso' },
  { id: 'cardio',             label: 'Área de cardio',                  category: 'Acceso' },
  { id: 'classes',            label: 'Clases grupales',                 category: 'Acceso' },
  { id: 'yoga',               label: 'Yoga / Pilates',                  category: 'Acceso' },
  { id: 'spinning',           label: 'Spinning',                        category: 'Acceso' },
  { id: 'pool',               label: 'Alberca',                         category: 'Acceso' },
  { id: 'sauna',              label: 'Sauna / Vapor',                   category: 'Acceso' },
  { id: 'access_24',          label: 'Acceso 24/7',                     category: 'Acceso' },
  // Entrenamiento
  { id: 'trainer_monthly',    label: 'Entrenador personal (1/mes)',      category: 'Entrenamiento' },
  { id: 'trainer_unlimited',  label: 'Entrenador personal ilimitado',   category: 'Entrenamiento' },
  { id: 'assessment',         label: 'Evaluación física inicial',       category: 'Entrenamiento' },
  { id: 'nutrition',          label: 'Plan nutricional',                category: 'Entrenamiento' },
  // Extras
  { id: 'locker',             label: 'Casillero incluido',              category: 'Extras' },
  { id: 'parking',            label: 'Estacionamiento',                 category: 'Extras' },
  { id: 'guest',              label: 'Invitado por mes',                category: 'Extras' },
  { id: 'towel',              label: 'Toalla incluida',                 category: 'Extras' },
]

export const BENEFIT_CATEGORIES = [...new Set(BENEFIT_CATALOG.map(b => b.category))]

export function getBenefitLabel(id: string): string {
  return BENEFIT_CATALOG.find(b => b.id === id)?.label ?? id
}
