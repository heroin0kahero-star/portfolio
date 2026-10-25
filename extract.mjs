import fs from 'fs';
const hero = fs.readFileSync('src/components/sections/HeroSection.tsx','utf8');
const cap = fs.readFileSync('src/components/sections/CapabilitiesSection.tsx','utf8');
const hm = hero.match(/https?:\/\/[^'"]+\.mp4[^'"]*/g);
const cm = cap.match(/https?:\/\/[^'"]+\.mp4[^'"]*/g);
console.log(hm);
console.log(cm);
