import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule, CheckboxChangeEvent } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-role-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, PanelModule, DrawerModule, ButtonModule],
  templateUrl: './role-filter.component.html',
  styleUrl: './role-filter.component.scss'
})
export class RoleFilterComponent {
  protected playerService = inject(PlayerService);

  drawerVisible = false;

  roleGroups = computed(() => {
    const roles = this.playerService.roles();
    return Object.entries(roles).map(([groupName, roleList]) => ({
      groupName,
      roles: roleList,
      allChecked: roleList.every(r => this.playerService.activeRoles().has(r.shortRoleName)),
      indeterminate: roleList.some(r => this.playerService.activeRoles().has(r.shortRoleName)) &&
                     !roleList.every(r => this.playerService.activeRoles().has(r.shortRoleName))
    }));
  });

  toggleDrawer(): void {
    this.drawerVisible = !this.drawerVisible;
  }

  onGroupChange(groupName: string, event: CheckboxChangeEvent): void {
    this.toggleGroup(groupName, !!event.checked);
  }

  onRoleChange(shortRoleName: string, event: CheckboxChangeEvent): void {
    this.toggleRole(shortRoleName, !!event.checked);
  }

  toggleGroup(groupName: string, checked: boolean): void {
    const roles = this.playerService.roles();
    const groupRoles = roles[groupName] ?? [];
    const current = new Set(this.playerService.activeRoles());
    for (const role of groupRoles) {
      checked ? current.add(role.shortRoleName) : current.delete(role.shortRoleName);
    }
    this.playerService.activeRoles.set(current);
  }

  toggleRole(shortRoleName: string, checked: boolean): void {
    const current = new Set(this.playerService.activeRoles());
    checked ? current.add(shortRoleName) : current.delete(shortRoleName);
    this.playerService.activeRoles.set(current);
  }
}
