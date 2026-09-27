export interface TrackModel {
  trackId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  imageUrl: Record<string, string>;
  audioUrl: Record<string, string>;
  orderId: number;
  isPremium: boolean;
  categoryId?: string;
  subcategoryId?: string;
  hide?: boolean;
}
