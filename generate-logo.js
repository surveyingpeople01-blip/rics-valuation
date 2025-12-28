const fs = require('fs');
const b64 = fs.readFileSync('logo.jpg').toString('base64');
fs.writeFileSync('logo-data.js', 'const LOGO_BASE64 = "data:image/jpeg;base64,' + b64 + '";');
console.log('logo-data.js created successfully');
