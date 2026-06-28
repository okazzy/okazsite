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
  field: Record<string, string> | undefined,
  langCode: string
): string {
  if (!field) return '';
  if (field[langCode] && field[langCode].trim() !== '') {
    return field[langCode];
  }
  return field['en'] || '';
}
