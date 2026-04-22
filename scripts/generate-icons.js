// Run once: node scripts/generate-icons.js
// Generates solid-color PNG icons for PWA manifest

const fs = require('fs')
const zlib = require('zlib')

function makeCrcTable() {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
}

const crcTable = makeCrcTable()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const b of buf) crc = (crc >>> 8) ^ crcTable[(crc ^ b) & 0xFF]
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const t = Buffer.from(type)
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(d.length)
  const body = Buffer.concat([t, d])
  const c = Buffer.alloc(4)
  c.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, c])
}

function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB

  // Raw scanlines: filter_byte(0) + RGB * width, repeated height times
  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const rowOffset = y * (1 + size * 3)
    raw[rowOffset] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const px = rowOffset + 1 + x * 3
      raw[px] = r
      raw[px + 1] = g
      raw[px + 2] = b
    }
  }

  const compressed = zlib.deflateSync(raw)

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

fs.mkdirSync('public/icons', { recursive: true })

// #1a1a2e — Nucleo brand dark navy
fs.writeFileSync('public/icons/icon-192.png', createPNG(192, 0x1a, 0x1a, 0x2e))
fs.writeFileSync('public/icons/icon-512.png', createPNG(512, 0x1a, 0x1a, 0x2e))

console.log('Icons generated: public/icons/icon-192.png, public/icons/icon-512.png')
