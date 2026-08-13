export interface CategoryModel {
  id: string;
  title: Record<string, string>;
  imageUrl: string;
  orderId: number;
}

export interface SubcategoryModel {
  id: string;
  title: Record<string, string>;
  imageUrl: string;
  orderId: number;
}

export function getLocalizedText(
  field: any,
  langCode: string
): string {
  if (!field) return '';
  // If the user accidentally saved a plain string instead of a map
  if (typeof field === 'string') return field;

  const val = field[langCode];
  if (typeof val === 'string' && val.trim() !== '') {
    return val;
  }
  
  const enVal = field['en'];
  if (typeof enVal === 'string') return enVal;
  
  return '';
}
