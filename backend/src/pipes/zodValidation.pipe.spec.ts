import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { ZodValidationPipe } from './zodValidation.pipe';
import { z } from 'zod/v4';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;
  const mockMetadata: ArgumentMetadata = {
    type: 'body',
    metatype: String,
    data: '',
  };

  beforeEach(() => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().int().positive(),
    });
    pipe = new ZodValidationPipe(schema);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return validated data when valid', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const result = pipe.transform(validData, mockMetadata);

      expect(result).toEqual(validData);
    });

    it('should throw BadRequestException when data is invalid', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        age: 30,
      };

      expect(() => pipe.transform(invalidData, mockMetadata)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when required fields are missing', () => {
      const incompleteData = {
        name: 'John Doe',
      };

      expect(() => pipe.transform(incompleteData, mockMetadata)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when data type is wrong', () => {
      const wrongTypeData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 'thirty', // should be number
      };

      expect(() => pipe.transform(wrongTypeData, mockMetadata)).toThrow(
        BadRequestException,
      );
    });

    it('should handle nested objects', () => {
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });
      const nestedPipe = new ZodValidationPipe(nestedSchema);

      const validNestedData = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const result = nestedPipe.transform(validNestedData, mockMetadata);

      expect(result).toEqual(validNestedData);
    });
  });
});

