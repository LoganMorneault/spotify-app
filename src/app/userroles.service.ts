import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRolesService {
  private url: string = "http://localhost:4000/api"

  constructor(private http: HttpClient) { }

  public getAllUserRoles = () => {
    return this.http.get(`${this.url}/userroles`);
  }

  public getUserRolesByID = (uid: string) => {
    return this.http.get(`${this.url}/userroles/${uid}`);
  }

  public updateUserRoles = (uid: string, newVal: object) => {
    return this.http.put(`${this.url}/userroles/${uid}`, newVal);
  }

  public createUserRoles = (newVal: object) => {
    return this.http.post(`${this.url}/userroles`, newVal);
  }

  public deleteUserRoles = (uid: string) => {
    return this.http.delete(`${this.url}/userroles/${uid}`);
  }
}
