export interface HistoriaModel {
  id: number;
  titulo: string;

  // lo que ya tenías
  content?: string | null;

  // NUEVO: propiedades que vienen del backend / que quieres mostrar
  description?: string;
  genero?: string;          // o generoNombre si luego el backend lo cambia
  contieneJuego?: boolean;  // true / false
}

export interface CrearHistoriaModel {
  titulo: string;
  description: string;
  genero: string;
  contieneJuego: boolean;
}
