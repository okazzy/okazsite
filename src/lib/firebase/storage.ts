import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  if (!file) throw new Error('No file provided');
  
  // Generate a unique file name to prevent overwriting
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
