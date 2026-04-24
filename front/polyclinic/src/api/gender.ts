// Тип пола, который приходит с бэка
export type Gender = 'MALE' | 'FEMALE' | null | undefined

// Преобразование значения пола в русский текст
export function formatGender(gender: Gender): string {
  if (!gender) return '—'

  return gender === 'MALE'
    ? 'Мужской'
    : 'Женский'
}

// Опции для селектов / радио-кнопок
export const genderOptions = [
  { value: 'MALE', label: 'Мужской' },
  { value: 'FEMALE', label: 'Женский' },
]
