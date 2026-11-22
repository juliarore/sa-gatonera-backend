import { HttpException } from '@nestjs/common';

export function coded(
  Exception: new (response: object) => HttpException,
  message: string,
  code: string,
): HttpException {
  const statusCode = new Exception({}).getStatus();
  return new Exception({ statusCode, message, code });
}
