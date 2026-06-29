import { NullError } from '@/domain/shared/errors/null-type-error';

export class TagDimension {
  readonly value: String;
  private static readonly FIELD_NAME = 'etiqueta de dimension';

  private constructor(value: String) {
    this.value = value;
  }

  public static create(value: String): TagDimension {
    if (value.trim() === '') {
      throw new NullError (this.FIELD_NAME);
    }

    return new TagDimension(value);
  }

}