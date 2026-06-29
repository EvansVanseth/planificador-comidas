import { DomainError } from '@/domain/shared/errors/domain-error';

export class Id {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Id {
    // Regex para validar UUID v4 (estándar más común)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      throw new DomainError('El ID proporcionado no es un UUID válido.');
    }

    return new Id(value);
  }

}