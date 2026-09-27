import { db } from '../src/lib/firebase/config';
import { collectionGroup, getDocs } from 'firebase/firestore';

async function main() {
  const snap = await getDocs(collectionGroup(db, 'videos'));
  console.log("Total videos found:", snap.docs.length);
  snap.docs.forEach(doc => {
    if(doc.id === 'zzzzzzzzzzzzzzzzzzzx') {
      console.log("Found target video!", doc.id, doc.data());
    }
  });
}

main().catch(console.error);
