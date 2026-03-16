import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RoleInfo } from '../../models/role-group.model';

function normalizeForSearch(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

@Component({
  selector: 'app-role-picker-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './role-picker-modal.component.html',
  styleUrl: './role-picker-modal.component.scss',
})
export class RolePickerModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() selectedRole: string | null = null;
  @Output() roleSelected = new EventEmitter<string | null>();

  private _roles = signal<RoleInfo[]>([]);

  @Input() set roles(val: RoleInfo[]) {
    this._roles.set(val);
  }
  get roles(): RoleInfo[] {
    return this._roles();
  }

  searchTerm = signal('');

  filteredRoles = computed(() => {
    const term = normalizeForSearch(this.searchTerm());
    const roleList = this._roles();
    if (!term) return roleList;
    return roleList.filter(r => normalizeForSearch(r.roleName).includes(term));
  });

  selectRole(role: RoleInfo): void {
    this.roleSelected.emit(role.shortRoleName);
    this.visibleChange.emit(false);
  }

  clearSelection(): void {
    this.roleSelected.emit(null);
    this.visibleChange.emit(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onDialogHide(): void {
    this.visibleChange.emit(false);
    this.searchTerm.set('');
  }
}
