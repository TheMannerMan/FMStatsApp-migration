import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Player } from '../models/player.model';
import { RoleGroup } from '../models/role-group.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  players = signal<Player[]>([]);
  roles = signal<RoleGroup>({});
  activeRoles = signal<Set<string>>(new Set());

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<Player[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Player[]>('/api/players/upload', formData).pipe(
      tap(players => this.players.set(players))
    );
  }

  loadRoles(): void {
    this.http.get<RoleGroup>('/api/roles').subscribe(roles => {
      this.roles.set(roles);
      // Initialize activeRoles with all role short names
      const allRoleNames = Object.values(roles)
        .flat()
        .map(r => r.shortRoleName);
      this.activeRoles.set(new Set(allRoleNames));
    });
  }
}
