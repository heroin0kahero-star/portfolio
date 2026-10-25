import https from 'https';
import fs from 'fs';
function download(url, dest){
  return new Promise((resolve,reject)=>{
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Failed: ' + res.statusCode + ' ' + url));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}
Promise.all([
  download('https://d8j0ntlcm91z4.cloudfront.net/Suman_Portfolio_Video.webm', 'public/videos/hero/hero.webm'),
  download('https://d8j0ntlcm91z4.cloudfront.net/Suman_Portfolio_Video.mp4', 'public/videos/hero/hero.mp4'),
  download('https://d8j0ntlcm91z4.cloudfront.net/Capabilities.mp4', 'public/videos/hero/capabilities.mp4')
]).then(() => { console.log('done'); process.exit(0); }).catch(e => { console.error(e.message); process.exit(1); });
