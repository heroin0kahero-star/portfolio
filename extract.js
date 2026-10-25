const fs = require('fs');
const hero = fs.readFileSync('src/components/sections/HeroSection.tsx','utf8');
const cap = fs.readFileSync('src/components/sections/CapabilitiesSection.tsx','utf8');
console.log(hero.match(/https?:\/\/[^'\"]+\.mp4[^'\"]*/g));
console.log(cap.match(/https?:\/\/[^'\"]+\.mp4[^'\"]*/g));
