import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { RoleGroup } from '../models/role-group.model';

const STORAGE_KEY = 'uploaded_players';

interface StoredState {
  players: Player[];
  activeRoles: string[];
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private activeRolesSubject = new BehaviorSubject<Set<string>>(new Set());

  players$ = this.playersSubject.asObservable();
  activeRoles$ = this.activeRolesSubject.asObservable();
  roles = signal<RoleGroup>({});

  constructor(private http: HttpClient) {
    this.rehydrate();
  }

  private rehydrate(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!this.isValidStoredState(parsed)) return;
      this.playersSubject.next(parsed.players);
      this.activeRolesSubject.next(new Set(parsed.activeRoles));
    } catch {
      // Silently discard corrupt or unreadable data
    }
  }

  private isValidStoredState(value: unknown): value is StoredState {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return Array.isArray(v['players']) && Array.isArray(v['activeRoles']);
  }

  private persist(): void {
    try {
      const state: StoredState = {
        players: this.playersSubject.value,
        activeRoles: [...this.activeRolesSubject.value],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Gracefully degrade (QuotaExceededError, private browsing, etc.)
    }
  }

  setPlayers(players: Player[]): void {
    const allRoles = new Set(players.flatMap(p => p.roles.map(r => r.shortRoleName)));
    this.playersSubject.next(players);
    this.activeRolesSubject.next(allRoles);
    this.persist();
  }

  removePlayer(uid: number): void {
    const updated = this.playersSubject.value.filter(p => p.uid !== uid);
    this.playersSubject.next(updated);
    this.persist();
  }

  setActiveRoles(roles: Set<string>): void {
    this.activeRolesSubject.next(roles);
    this.persist();
  }

  uploadFile(file: File): Observable<Player[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Player[]>('/api/players/upload', formData);
  }

  loadRoles(): void {
    this.http.get<RoleGroup>('/api/roles').subscribe({
      next: roles => this.roles.set(roles),
      error: err => console.error('Failed to load roles:', err),
    });
  }
}
