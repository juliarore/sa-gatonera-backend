import {
  JPEG_SIGNATURE,
  PNG_SIGNATURE,
} from '../constants/image-signatures.constants';

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
