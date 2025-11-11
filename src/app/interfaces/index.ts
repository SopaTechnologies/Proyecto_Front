export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
  message: string,
  meta: T;
  Ilo: ILoginResponse[]
}

export interface IUser {
  id?: number;
  username?: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  status?: boolean;
  photo?: string;
  authorities?: IAuthority[];
  role?: IRole
}

export interface IUser2 {
  id?: number;
  username?: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  status?: boolean;
  photo?: string;
  authorities?: IAuthority[];
  role?: IRole2
}

export interface IRole2 {
  
  name : string;
  
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRoleType {
  admin = "ROLE_ADMIN",
  user = "ROLE_USER",
  superAdmin = 'SUPER_ADMIN'
}
export interface IRole {
  createdAt: string;
  description: string;
  id: number;
  name : string;
  updatedAt: string;
}

export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?:number;
}

export interface IGenre {
  id?: number;
  name: string;
  id_usuario_creador?: number;
  fecha_creacion?: string;
}