import { inject, Injectable } from "@angular/core";
import {
  IAuthority,
  ILoginResponse,
  IResponse,
  IRoleType,
  IUser,
} from "../interfaces";
import { Observable, firstValueFrom, of, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { throwError, catchError } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private accessToken!: string;
  private expiresIn!: number;
  private user: IUser = { email: "", authorities: [] };
  private http: HttpClient = inject(HttpClient);

  constructor() {
    this.load();
  }

  public save(): void {
    if (this.user) localStorage.setItem("auth_user", JSON.stringify(this.user));

    if (this.accessToken)
      localStorage.setItem("access_token", JSON.stringify(this.accessToken));

    if (this.expiresIn)
      localStorage.setItem("expiresIn", JSON.stringify(this.expiresIn));
  }

  private load(): void {
    let token = localStorage.getItem("access_token");
    if (token) this.accessToken = token;
    let exp = localStorage.getItem("expiresIn");
    if (exp) this.expiresIn = JSON.parse(exp);
    const user = localStorage.getItem("auth_user");
    if (user) this.user = JSON.parse(user);
  }

  public getUser(): IUser | undefined {
    return this.user;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public check(): boolean {
    if (!this.accessToken) {
      return false;
    } else {
      return true;
    }
  }

  public login(credentials: {
    email: string;
    password: string;
  }): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>("auth/login", credentials).pipe(
      tap((response: any) => {
        this.accessToken = response.token;
        this.user.email = credentials.email;
        this.expiresIn = response.expiresIn;
        this.user = response.authUser;
        this.save();
      })
    );
  }

  public hasRole(role: string): boolean {
    const hasInAuthorities = this.user.authorities
      ? this.user.authorities.some((authority) => authority.authority == role)
      : false;

    const hasInRole = this.user.role?.name === role;

    return hasInAuthorities || !!hasInRole;
  }

  public isSuperAdmin(): boolean {
    const hasInAuthorities = this.user.authorities
      ? this.user.authorities.some(
          (authority) => authority.authority == IRoleType.superAdmin
        )
      : false;

    const hasInRole = this.user.role?.name === IRoleType.superAdmin;

    return hasInAuthorities || !!hasInRole;
  }

  public hasAnyRole(roles: any[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  public getPermittedRoutes(routes: any[]): any[] {
    let permittedRoutes: any[] = [];
    for (const route of routes) {
      if (route.data && route.data.authorities) {
        if (this.hasAnyRole(route.data.authorities)) {
          permittedRoutes.unshift(route);
        }
      }
    }
    return permittedRoutes;
  }

  public signup(user: IUser): Observable<any> {
    return this.http.post("users/addUser", user);
  }

  public pass (user: {email: string; password: string}): Observable<any>{
    return this.http.put(`users/pass/${user.email}`, user);
  }

  public logout() {
    this.accessToken = "";
    localStorage.removeItem("access_token");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("auth_user");
  }

  public getUserAuthorities(): IAuthority[] | undefined {
    return this.getUser()?.authorities ? this.getUser()?.authorities : [];
  }

  public areActionsAvailable(routeAuthorities: string[]): boolean {
    let allowedUser: boolean = false;
    let isAdmin: boolean = false;

    let userAuthorities = this.getUserAuthorities();

    for (const authority of routeAuthorities) {
      if (userAuthorities?.some((item) => item.authority == authority)) {
        allowedUser = userAuthorities?.some(
          (item) => item.authority == authority
        );
      }
      if (allowedUser) break;
    }

    if (
      userAuthorities?.some(
        (item) =>
          item.authority == IRoleType.admin ||
          item.authority == IRoleType.superAdmin
      )
    ) {
      isAdmin = userAuthorities?.some(
        (item) =>
          item.authority == IRoleType.admin ||
          item.authority == IRoleType.superAdmin
      );
    }

    if (
      this.user.role &&
      (this.user.role.name == IRoleType.admin ||
        this.user.role.name == IRoleType.superAdmin)
    ) {
      isAdmin = true;
      allowedUser = routeAuthorities.includes(this.user.role.name);
    }

    return allowedUser && isAdmin;
  }

  loginWithGoogle(userData: any): Observable<any> {
    return this.http.post("auth/oauth2/google", userData);
  }
}
