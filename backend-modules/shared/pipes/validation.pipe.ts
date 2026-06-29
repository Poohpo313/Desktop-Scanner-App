import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (!metadata.metatype || !this.needsValidation(metadata.metatype)) {
      return value;
    }

    const dtoInstance = plainToInstance(metadata.metatype, value);
    const errors = await validate(dtoInstance as object, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return dtoInstance;
  }

  private needsValidation(metatype: Function): boolean {
    const primitiveTypes: Function[] = [String, Boolean, Number, Array, Object];
    return !primitiveTypes.includes(metatype);
  }
}
