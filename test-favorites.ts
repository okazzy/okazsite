import { initializeApp } from 'firebase/app';
import { getFirestore, collectionGroup, getDocs, collection } from 'firebase/firestore';

const app = initializeApp({ projectId: 'okaz-68c33' });
const db = getFirestore(app);

async function run() {
  const users = await getDocs(collection(db, 'users'));
  users.docs.forEach(u => {
    const favs = u.data().favorites || [];
    if (favs.length > 0) {
      console.log(`User ${u.id} favorites:`, favs);
    }
  });
  console.log("Done checking users.");
}
run();
