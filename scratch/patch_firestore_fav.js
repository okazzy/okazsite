const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase/firestore.ts', 'utf8');

content = content.replace(
  /const allVideos = snap\.docs\n\s*\.map\(\(d\) => parseVideo\(d\.id, d\.data\(\) as Record<string, unknown>\)\)\n\s*\.filter\(\(v\) => !v\.hide\)\n\s*\.filter\(\(v\) => videoIds\.includes\(\v.videoId\)\);/g,
  `const allVideos = snap.docs
    .filter(d => {
      const vId = d.data().videoId || d.id;
      return videoIds.includes(d.id) || videoIds.includes(vId);
    })
    .map((d) => parseVideo(d.id, d.data() as Record<string, unknown>))
    .filter((v) => !v.hide);`
);

fs.writeFileSync('src/lib/firebase/firestore.ts', content);
