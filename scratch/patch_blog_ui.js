const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/blog/[slug]/page.tsx', 'utf8');

// Add showVideoModal state
content = content.replace(
  /const \[firebaseVideo, setFirebaseVideo\] = useState<any>\(null\);/,
  `const [firebaseVideo, setFirebaseVideo] = useState<any>(null);\n  const [showVideoModal, setShowVideoModal] = useState(false);`
);

// We need to handle escape key for modal if possible, but for simplicity we'll just allow click outside and X button.
// Replace the VideoList render with the custom block
content = content.replace(
  /\{firebaseVideo && \([\s\S]*?<VideoList videos=\{\[firebaseVideo\]\} locale=\{locale\} \/>[\s\S]*?<\/div>\n\s*\)\}/,
  `{firebaseVideo && (
        <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
          <div 
             onClick={() => setShowVideoModal(true)}
             style={{
               cursor: 'pointer',
               borderRadius: '16px',
               overflow: 'hidden',
               border: '1px solid var(--color-border)',
               background: 'var(--color-surface-elevated)',
               position: 'relative',
               transition: 'transform 0.3s ease, box-shadow 0.3s ease',
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-4px)';
               e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = 'none';
             }}
          >
             <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
               <img 
                 src={getLocalizedText(firebaseVideo.imageUrl, locale)} 
                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                 alt="Thumbnail" 
               />
               <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', transition: 'transform 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                 >
                    <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', fill: '#fff', marginLeft: '4px' }}>
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                 </div>
               </div>
             </div>
             <div style={{ padding: '1.5rem', textAlign: 'center' }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                 {locale === 'ar' ? 'شاهد: ' : 'Watch: '}
                 {getLocalizedText(firebaseVideo.title, locale)}
               </h3>
             </div>
          </div>

          {showVideoModal && (
            <div className="video-modal-backdrop" onClick={(e) => { if(e.target === e.currentTarget) setShowVideoModal(false); }}>
               <div className="video-modal">
                 <button className="video-modal__close" onClick={() => setShowVideoModal(false)}>✕</button>
                 <div className="video-modal__player-wrapper">
                   <video 
                     className="video-modal__player" 
                     src={getLocalizedText(firebaseVideo.videoUrl, locale)} 
                     controls autoPlay playsInline 
                     poster={getLocalizedText(firebaseVideo.imageUrl, locale) || undefined}
                   />
                 </div>
               </div>
            </div>
          )}
        </div>
      )}`
);

fs.writeFileSync('src/app/[locale]/blog/[slug]/page.tsx', content);
