export interface Personaje {
  id?: number;
  nombre: string;
  apellido: string;
  descripcion: string;
  estado: string;
  entidadOGrupo?: string;
  paisOLugarOrigen?: string;
  imagen?: string; // <-- Agrega esta línea
  imagenUrl?: string; // para uso en frontend
  createdAt?: string;
  padreId?: number;
  madreId?: number;
  relacionId?: number;
  enemigos?: string; // JSON string de IDs de enemigos
  amistades?: string; // JSON string de IDs de amistades
}
