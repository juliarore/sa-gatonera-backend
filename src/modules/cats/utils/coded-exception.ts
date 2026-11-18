import { HttpException } from '@nestjs/common';
import { CatErrorCode } from '../enums';

export function coded(
  Exception: new (response: object) => HttpException,
  message: string,
  code: CatErrorCode,
): HttpException {
  const statusCode = new Exception({}).getStatus();
  return new Exception({ statusCode, message, code });
}
