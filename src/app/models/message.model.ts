export interface Message {
  id?: number;              // ID autogenerado por el backend
  titulo: string;           // Título del mensaje
  subtitulo?: string;       // Subtítulo o año (puede ser opcional)
  textoGrande: string;      // Contenido principal
  createdAt?: string;       // Fecha de creación (opcional)
  updatedAt?: string;       // Fecha de actualización (opcional)
}
