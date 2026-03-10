import { Component, inject, computed } from '@angular/core';
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
  playerService = inject(PlayerService);

  // Get the grouped roles from the service
  roleGroups = computed(() => {
    const roles = this.playerService.roles();
    return Object.entries(roles).map(([groupName, roleList]) => ({
      groupName,
      roles: roleList,
      // A group is "checked" if ALL its roles are in activeRoles
      allChecked: roleList.every(r => this.playerService.activeRoles().has(r.shortRoleName)),
      // A group is "indeterminate" if SOME (but not all) roles are in activeRoles
      indeterminate: roleList.some(r => this.playerService.activeRoles().has(r.shortRoleName)) &&
                     !roleList.every(r => this.playerService.activeRoles().has(r.shortRoleName))
    }));
  });

  toggleGroup(groupName: string, checked: boolean): void {
    const roles = this.playerService.roles();
    const groupRoles = roles[groupName] ?? [];
    const current = new Set(this.playerService.activeRoles());

    for (const role of groupRoles) {
      if (checked) {
        current.add(role.shortRoleName);
      } else {
        current.delete(role.shortRoleName);
      }
    }

    this.playerService.activeRoles.set(current);
  }

  toggleRole(shortRoleName: string, checked: boolean): void {
    const current = new Set(this.playerService.activeRoles());
    if (checked) {
      current.add(shortRoleName);
    } else {
      current.delete(shortRoleName);
    }
    this.playerService.activeRoles.set(current);
  }
}
