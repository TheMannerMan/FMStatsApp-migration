import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-role-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-filter.component.html',
  styleUrl: './role-filter.component.scss'
})
export class RoleFilterComponent {
  protected playerService = inject(PlayerService);
  protected activeRoles = toSignal(this.playerService.activeRoles$, { initialValue: new Set<string>() });

  roleGroups = computed(() => {
    const roles = this.playerService.roles();
    return Object.entries(roles).map(([groupName, roleList]) => ({
      groupName,
      roles: roleList,
      allChecked: roleList.every(r => this.activeRoles().has(r.shortRoleName)),
      indeterminate:
        roleList.some(r => this.activeRoles().has(r.shortRoleName)) &&
        !roleList.every(r => this.activeRoles().has(r.shortRoleName)),
    }));
  });

  onGroupChange(groupName: string, event: Event): void {
    this.toggleGroup(groupName, (event.target as HTMLInputElement).checked);
  }

  onRoleChange(shortRoleName: string, event: Event): void {
    this.toggleRole(shortRoleName, (event.target as HTMLInputElement).checked);
  }

  toggleGroup(groupName: string, checked: boolean): void {
    const roles = this.playerService.roles();
    const groupRoles = roles[groupName] ?? [];
    const current = new Set(this.activeRoles());

    for (const role of groupRoles) {
      if (checked) {
        current.add(role.shortRoleName);
      } else {
        current.delete(role.shortRoleName);
      }
    }

    this.playerService.setActiveRoles(current);
  }

  toggleRole(shortRoleName: string, checked: boolean): void {
    const current = new Set(this.activeRoles());
    if (checked) {
      current.add(shortRoleName);
    } else {
      current.delete(shortRoleName);
    }
    this.playerService.setActiveRoles(current);
  }
}
