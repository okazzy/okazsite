const fs = require('fs');
let content = fs.readFileSync('src/app/[locale]/admin/page.tsx', 'utf8');

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

fs.writeFileSync('src/app/[locale]/admin/page.tsx', content);
