export interface VideoModel {
  videoId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  imageUrl: Record<string, string>;
  videoUrl: Record<string, string>;
  orderId: number;
  isPremium: boolean;
  isPractice: boolean;
  hide?: boolean;
}
