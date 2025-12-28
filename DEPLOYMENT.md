# RICS Red Book Valuation - Deployment Guide

## Required Files for Deployment

The following files MUST be uploaded to your web server:

### Core Application Files
- `index.html` - Main application page (31.9 KB)
- `login.html` - Login page (8.1 KB)
- `app.js` - Core application logic (46.8 KB)
- `enhancements.js` - Dashboard features (7.3 KB)
- `styles.css` - Main stylesheet (26.1 KB)
- `overrides.css` - Custom overrides (4.5 KB)
- `logo.jpg` - Company logo (33.6 KB)

### Library Files (Required)
You need to include these JavaScript libraries. They should already be in your project:
- `jspdf.umd.min.js` - PDF generation
- `html2canvas.min.js` - HTML to canvas conversion
- `pdf-cover.js` - PDF cover page generation (13.7 KB)

**Note**: If the jsPDF and html2canvas files are not present, the application currently loads them from CDN links in the HTML files, so they will work automatically.

### Files to EXCLUDE
Do NOT upload these files (they are backups and development files):
- `app_backup.js`
- `app_backup_20251224_004618.js`
- `app_broken.js`
- `enhancements_backup_20251224_004652.js`
- `index_backup_20251224_004651.html`
- `overrides_backup_20251224_004648.css`
- `layout-fix.css` (not used)
- `.gitignore` (optional, only needed for Git)
- `README.md` (optional, for documentation only)

---

## Deployment Methods

### Method 1: GitHub Pages (Free Hosting)

#### Prerequisites
- GitHub account (free at https://github.com/signup)
- Git installed OR use GitHub web interface

#### Option A: Using Git Command Line

1. **Install Git** (if not already installed)
   - Download from: https://git-scm.com/download/win
   - Run installer with default settings

2. **Open PowerShell in your project folder**
   ```powershell
   cd "c:\Users\Ross\.gemini\antigravity\playground\giant-hubble"
   ```

3. **Initialize Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - RICS Valuation Application"
   ```

4. **Create GitHub repository**
   - Go to https://github.com/new
   - Repository name: `rics-valuation` (or your choice)
   - Make it Public
   - Do NOT initialize with README (we already have one)
   - Click "Create repository"

5. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/rics-valuation.git
   git branch -M main
   git push -u origin main
   ```

6. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `(root)`
   - Click Save

7. **Access your live site**
   - URL: `https://YOUR-USERNAME.github.io/rics-valuation/`
   - Wait 1-2 minutes for deployment
   - Login with: admin / admin

#### Option B: Using GitHub Web Interface (No Git Required)

1. **Create new repository on GitHub**
   - Go to https://github.com/new
   - Name: `rics-valuation`
   - Public repository
   - Click "Create repository"

2. **Upload files**
   - Click "uploading an existing file"
   - Drag and drop ALL required files (see list above)
   - Exclude backup files
   - Commit message: "Initial commit"
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Settings → Pages
   - Source: main branch
   - Save

4. **Access live site**
   - `https://YOUR-USERNAME.github.io/rics-valuation/`

---

### Method 2: Traditional Web Hosting (FTP Upload)

#### Prerequisites
- Web hosting account with FTP access
- FTP client (FileZilla recommended: https://filezilla-project.org/)

#### Steps

1. **Prepare files**
   - Copy all required files to a clean folder
   - Verify no backup files are included

2. **Connect via FTP**
   - Open FileZilla (or your FTP client)
   - Host: Your hosting provider's FTP server (e.g., `ftp.yourdomain.com`)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or as specified by host)
   - Click "Quickconnect"

3. **Upload files**
   - Navigate to your public web directory (usually `public_html` or `www`)
   - Upload ALL required files to this directory
   - Maintain the flat file structure (all files in root)

4. **Set permissions** (if needed)
   - Right-click each file → File permissions
   - Set to 644 (readable by all, writable by owner)

5. **Test your site**
   - Visit: `https://yourdomain.com/`
   - Should redirect to login page
   - Login with: admin / admin

#### Common Hosting Providers

**cPanel Hosting:**
- Use File Manager in cPanel
- Upload to `public_html` folder
- Or use FTP as described above

**Shared Hosting (GoDaddy, Bluehost, etc.):**
- Use their file manager or FTP
- Upload to root web directory

---

## Post-Deployment Checklist

After deploying, verify the following:

- [ ] Login page loads correctly
- [ ] Can login with admin/admin
- [ ] Dashboard displays properly
- [ ] Can create new valuation
- [ ] All 6 steps of form work
- [ ] Can save and edit reports
- [ ] Can delete reports
- [ ] PDF generation works
- [ ] Date picker functions
- [ ] Status dropdowns work
- [ ] Search and filters work
- [ ] Logo displays correctly
- [ ] Logout button works

---

## Troubleshooting

### Issue: Login page doesn't load
- **Check**: All HTML files uploaded correctly
- **Check**: File names are exact (case-sensitive on some servers)

### Issue: Styling looks broken
- **Check**: CSS files uploaded
- **Check**: File paths in HTML are correct (should be relative)

### Issue: PDF generation fails
- **Check**: jsPDF library is loaded (check browser console)
- **Check**: Internet connection (if using CDN links)

### Issue: Logo doesn't display
- **Check**: `logo.jpg` uploaded to same directory
- **Check**: File name is exactly `logo.jpg` (case-sensitive)

### Issue: Data not saving
- **Check**: Browser localStorage is enabled
- **Check**: Not in private/incognito mode
- **Note**: Data is browser-specific and local only

---

## Security Recommendations

### For Production Use:

1. **Change default credentials**
   - Edit `login.html`
   - Replace hardcoded admin/admin with secure credentials
   - Consider implementing proper authentication

2. **Use HTTPS**
   - GitHub Pages: Automatic HTTPS ✓
   - Traditional hosting: Enable SSL certificate

3. **Add backend database**
   - Current version uses localStorage only
   - For multi-user, implement server-side storage

4. **Implement user management**
   - Add proper login system
   - User roles and permissions
   - Session management

---

## Custom Domain Setup

### GitHub Pages with Custom Domain

1. Add CNAME file to repository with your domain
2. Configure DNS with your domain registrar:
   - Add A records pointing to GitHub's IPs
   - Or add CNAME record pointing to `username.github.io`
3. Enable HTTPS in GitHub Pages settings

### Traditional Hosting

- Domain automatically works if files are in root directory
- Configure via your hosting provider's control panel

---

## Support

For technical issues:
- Check browser console for errors (F12)
- Verify all files uploaded correctly
- Test in different browsers
- Clear browser cache and try again

---

**Deployment Guide Version**: 1.0  
**Last Updated**: December 2025
