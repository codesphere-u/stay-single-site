// App icons drawn in code and encoded as PNG with Node's built-in zlib — no image tools needed.
// The mark is the brand's full stop: an ember dot on midnight.
import zlib from 'node:zlib';

const INK = [0x0e, 0x0e, 0x10];
const EMBER = [0xff, 0x5a, 0x1f];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

// Coverage of a pixel by a shape, from a 4×4 grid of samples (smooth edges).
function coverage(x, y, inside) {
  let hits = 0;
  for (let sy = 0; sy < 4; sy++) {
    for (let sx = 0; sx < 4; sx++) if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) hits++;
  }
  return hits / 16;
}

// `maskable` icons fill the whole square (the platform crops them) and keep the dot inside the safe zone.
export function iconPng(size, { maskable = false } = {}) {
  const radius = maskable ? 0 : size * 0.22;
  const dot = size * (maskable ? 0.16 : 0.2);
  const centre = size / 2;
  const inSquare = (x, y) => {
    if (!radius) return true;
    const cx = Math.min(Math.max(x, radius), size - radius);
    const cy = Math.min(Math.max(y, radius), size - radius);
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
  };
  const inDot = (x, y) => (x - centre) ** 2 + (y - centre) ** 2 <= dot ** 2;

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let x = 0; x < size; x++) {
      const square = coverage(x, y, inSquare);
      const ember = square ? coverage(x, y, inDot) : 0;
      const offset = 1 + x * 4;
      for (let c = 0; c < 3; c++) row[offset + c] = Math.round(INK[c] * (1 - ember) + EMBER[c] * ember);
      row[offset + 3] = Math.round(square * 255);
    }
    rows.push(row);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Every icon the site publishes, by path.
export function siteIcons() {
  return new Map([
    ['icons/icon-192.png', iconPng(192)],
    ['icons/icon-512.png', iconPng(512)],
    ['icons/maskable-512.png', iconPng(512, { maskable: true })],
    ['icons/apple-touch-icon.png', iconPng(180, { maskable: true })]
  ]);
}
