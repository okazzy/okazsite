const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/blog/[slug]/page.tsx', 'utf8');

content = content.replace(
  /if \(data\.firebaseVideoId\) \{\n\s*const videos = await getFavoriteVideos\(\[data\.firebaseVideoId\]\);\n\s*if \(videos\.length > 0\) setFirebaseVideo\(videos\[0\]\);\n\s*\}/,
  `if (data.firebaseVideoId && data.firebaseVideoId.trim() !== '') {
          const trimmedId = data.firebaseVideoId.trim();
          console.log("Fetching video for ID:", trimmedId);
          const videos = await getFavoriteVideos([trimmedId]);
          console.log("Found videos:", videos.length);
          if (videos.length > 0) setFirebaseVideo(videos[0]);
        }`
);

fs.writeFileSync('src/app/[locale]/blog/[slug]/page.tsx', content);
