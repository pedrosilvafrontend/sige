import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Permission } from '@models';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@services';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly API_URL = `${environment.baseUrl}/permissions`;
  permissions = new BehaviorSubject<Permission[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.authService.user$.subscribe(user => {
      this.getAll(user.role);
    })
  }

  private getAll(role?: string): void {
    if(!role) {
      return;
    }
    this.http.get<Permission[]>(this.API_URL, { params: { role } }).subscribe(permissions => {
      this.permissions.next(permissions);
      console.warn('GET ALL PERMISSIONS', permissions);
      return permissions;
    })
  }

  getByResource(role: string, resource: string) {
    return this.http.get<Permissions[]>(`${this.API_URL}/permissions/${role}/${resource}`);
  }
}
