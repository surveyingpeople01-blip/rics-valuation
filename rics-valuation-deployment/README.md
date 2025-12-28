# RICS Red Book Valuation Application

A professional web-based valuation reporting system compliant with RICS Red Book standards for property valuations in London.

![RICS Valuation Application](logo.jpg)

## Features

### Dashboard
- **Tile and List Views** - Toggle between visual card layout and compact list view
- **Advanced Filtering** - Filter reports by date range, status, and search terms
- **Calendar Date Picker** - Select single dates or date ranges with Flatpickr integration
- **Status Management** - Change report status directly from dashboard (Working, Complete, Archive)
- **Export PDF** - Generate PDF reports directly from the dashboard

### Valuation Form (6-Step Process)
1. **Property Details** - Address, type, tenure, construction details
2. **Inspection Details** - Date, condition, observations
3. **Comparable Properties** - Add up to 5 comparable sales with automatic valuation calculation
4. **Market Analysis** - Market conditions and trends
5. **Valuation Summary** - Final valuation with methodology
6. **Review & Generate** - Review all details and generate professional PDF report

### Key Capabilities
- **Photo Upload** - Add property photos to reports
- **PDF Generation** - Professional RICS-compliant PDF reports with cover page and logo
- **Data Persistence** - All data stored locally using browser localStorage
- **Status Tracking** - Track report progress through workflow stages
- **Auto-save** - Automatic draft saving as you work

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Generation**: jsPDF library
- **Date Picker**: Flatpickr
- **Storage**: Browser localStorage (client-side only)
- **Styling**: Custom CSS with CSS variables for theming

## Installation & Setup

### Local Development

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin`

### GitHub Pages Deployment

1. Create a new GitHub repository
2. Push all files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select "main" branch as source
5. Your site will be live at `https://<username>.github.io/<repo-name>/`

### Traditional Web Hosting

1. Upload all files to your web server via FTP/SFTP
2. Ensure the following files are in the root directory:
   - `index.html`
   - `login.html`
   - `app.js`
   - `enhancements.js`
   - `styles.css`
   - `overrides.css`
   - `logo.jpg`
   - All library files (jspdf, flatpickr, etc.)
3. Access via your domain: `https://yourdomain.com/`

## File Structure

```
giant-hubble/
├── index.html              # Main application page
├── login.html              # Login page
├── app.js                  # Core application logic
├── enhancements.js         # Dashboard enhancements
├── styles.css              # Main stylesheet
├── overrides.css           # Custom style overrides
├── logo.jpg                # Company logo
├── jspdf.umd.min.js       # PDF generation library
├── html2canvas.min.js     # HTML to canvas conversion
└── README.md              # This file
```

## Usage

### Creating a New Valuation

1. Login to the application
2. Click "New Valuation" button
3. Complete all 6 steps of the valuation form
4. Review and generate PDF report

### Managing Reports

- **View**: Click "Edit" to view/edit a report
- **Delete**: Click "Delete" to remove a report
- **Change Status**: Use dropdown on each report card
- **Filter**: Use search box, date picker, or status filter
- **Export**: Click "Export PDF" to download report

### Changing Status

Reports can have three statuses:
- **Working** (Yellow) - Report in progress
- **Complete** (Green) - Report finished
- **Archive** (Gray) - Report archived

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Fast and responsive
- ✅ Works offline
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete all reports

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## Customization

### Branding
- Replace `logo.jpg` with your company logo
- Update colors in `styles.css` (CSS variables section)
- Modify company name in `login.html` and `index.html`

### Authentication
Default credentials are hardcoded in `login.html`. For production use, implement proper authentication.

## Known Limitations

- Client-side only (no backend database)
- Single-user (no multi-user support)
- Basic authentication (not production-ready)
- Data not synced across devices

## Future Enhancements

- Backend database integration
- Multi-user support with proper authentication
- Cloud storage for photos
- Email report delivery
- Mobile app version

## License

Proprietary - All rights reserved

## Support

For support or questions, contact your system administrator.

---

**Version**: 1.0  
**Last Updated**: December 2025  
**RICS Compliance**: Red Book 2024
