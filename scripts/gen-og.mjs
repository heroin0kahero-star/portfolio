import { createWriteStream } from 'node:fs';
import zlib from 'node:zlib';

const W = 1200;
const H = 630;

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC-32 table (IEEE polynomial)
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Color corners (RRGGBB)
const tl = [10, 10, 10];   // #0a0a0a
const bl = [26, 26, 46];   // #1a1a2e
const br = [94, 114, 228]; // #5e72e4

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type: truecolor RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter method
ihdr[12] = 0; // interlace

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  const rowStart = y * (1 + W * 3);
  raw[rowStart] = 0; // filter: none
  const t = y / (H - 1);
  for (let x = 0; x < W; x++) {
    const s = x / (W - 1);
    for (let c = 0; c < 3; c++) {
      const bottom = bl[c] + (br[c] - bl[c]) * s;
      const value = tl[c] * (1 - t) + bottom * t;
      raw[rowStart + 1 + x * 3 + c] = Math.max(0, Math.min(255, Math.round(value)));
    }
  }
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

createWriteStream(new URL('../public/og-image.png', import.meta.url)).write(png);
console.log('Generated public/og-image.png (%d bytes)', png.length);