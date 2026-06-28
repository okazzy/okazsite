import { Timestamp } from 'firebase/firestore';

export interface UserModel {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  isPremium: boolean;
  isGuest: boolean;
  favorites: string[];
  favoriteVideos: string[];
  dailyPlays: number;
  lastPlayedDate?: Timestamp;
}
