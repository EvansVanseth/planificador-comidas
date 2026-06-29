// Creamos una clase generica para errores de la app que podremos usar en un futuro para centralizar sistemas de vigilancia

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}