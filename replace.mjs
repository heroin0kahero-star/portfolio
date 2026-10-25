import fs from 'fs';
let c = fs.readFileSync('src/components/sections/HeroSection.tsx','utf8');
c = c.replace(/https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[^\s'"]+\.mp4/g, '/videos/hero/hero.mp4');
fs.writeFileSync('src/components/sections/HeroSection.tsx', c);
let d = fs.readFileSync('src/components/sections/CapabilitiesSection.tsx','utf8');
d = d.replace(/https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/[^\s'"]+\.mp4/g, '/videos/hero/capabilities.mp4');
fs.writeFileSync('src/components/sections/CapabilitiesSection.tsx', d);
console.log('done');
