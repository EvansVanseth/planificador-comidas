import { NullError } from '@/domain/shared/errors/null-type-error' 
import { OutRangeError } from '@/domain/shared/errors/ranges-error';

export class Name {
  readonly value: string;
  
  // Configuramos reglas de negocio como constantes estáticas
  static readonly MIN_LENGTH = 3;
  static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(name: string, value: string): Name {
    const trimmedValue = value.trim();

    if (trimmedValue === '') {
      throw new NullError(name);
    }

    if (trimmedValue.length < Name.MIN_LENGTH || trimmedValue.length > Name.MAX_LENGTH) {
      throw new OutRangeError(`cantidad de caracteres de (${name})`, Name.MIN_LENGTH, Name.MAX_LENGTH);
    }

    return new Name(trimmedValue);
  }
}