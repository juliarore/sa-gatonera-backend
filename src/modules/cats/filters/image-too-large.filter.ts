import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  PayloadTooLargeException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { MAX_IMAGE_MB } from '../cat-images.service';

@Catch(PayloadTooLargeException)
export class ImageTooLargeFilter extends BaseExceptionFilter {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    super.catch(
      new BadRequestException(`The image must not exceed ${MAX_IMAGE_MB} MB`),
      host,
    );
  }
}
