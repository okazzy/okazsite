const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

content = content.replace(/const \[migrating, setMigrating\] = useState\(false\);\n\s*const \[migrationStatus, setMigrationStatus\] = useState\(''\);/, '');
content = content.replace(/const handleMigrate = async \(\) => {[\s\S]*?};\n\n/, '');
content = content.replace(/<button className="btn-secondary" onClick={handleMigrate} disabled={migrating}>\s*\{migrating \? 'Importing\.\.\.' : 'Import WordPress XML Posts'\}\s*<\/button>/, '');
content = content.replace(/\{migrationStatus && <p style=\{\{ color: 'var\(--color-primary\)' \}\}>\{migrationStatus\}<\/p>\}/, '');

// update postToSave
content = content.replace(
  /youtubeUrl: currentPost\.youtubeUrl \|\| \{ en: '', ar: '' \},/,
  `youtubeUrl: currentPost.youtubeUrl || { en: '', ar: '' },
      firebaseVideoId: currentPost.firebaseVideoId || '',`
);

// update form fields
content = content.replace(
  /<\/form>/,
  `
          <div className="form-row">
            <label>Firebase Video Doc ID (Optional)
              <input type="text" placeholder="e.g. 5x8g9... (Firestore Document ID)" value={currentPost.firebaseVideoId || ''} onChange={e => setCurrentPost({...currentPost, firebaseVideoId: e.target.value})} />
            </label>
            <label>Status
              <select value={currentPost.status || 'publish'} onChange={e => setCurrentPost({...currentPost, status: e.target.value as 'publish' | 'draft'})}>
                <option value="publish">Publish</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Post</button>
          </div>
        </form>`
);

content = content.replace(/<div className="form-actions">[\s\S]*?<button type="submit" className="btn-primary">Save Post<\/button>\s*<\/div>\s*<\/form>/, '</form>');

fs.writeFileSync('src/app/[locale]/admin/page.tsx', content);
