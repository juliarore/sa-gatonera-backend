const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWith(buffer: Buffer, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

export function detectImageExtension(
  buffer: Buffer,
): 'jpg' | 'png' | 'webp' | null {
  if (startsWith(buffer, JPEG_SIGNATURE)) {
    return 'jpg';
  }
  if (startsWith(buffer, PNG_SIGNATURE)) {
    return 'png';
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}
