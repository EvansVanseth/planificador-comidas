// Creamos una clase generica para errores del dominio que podremos usar en un futuro para centralizar sistemas de vigilancia

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}