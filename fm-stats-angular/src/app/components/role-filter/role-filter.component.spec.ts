import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { describe, it, expect, beforeEach } from 'vitest';
import { RoleFilterComponent } from './role-filter.component';
import { PlayerService } from '../../services/player.service';
import { RoleGroup } from '../../models/role-group.model';

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const;

const testRoles: RoleGroup = {
  Goalkeeper: [
    { roleName: 'Goalkeeper', shortRoleName: 'GK', positions: ['GK'] },
    { roleName: 'Sweeper Keeper', shortRoleName: 'SK', positions: ['GK'] },
  ],
  Defender: [
    { roleName: 'Central Defender', shortRoleName: 'CD', positions: ['DC'] },
  ],
  Midfielder: [
    { roleName: 'Box to Box', shortRoleName: 'BBM', positions: ['MC'] },
    { roleName: 'Deep Lying Playmaker', shortRoleName: 'DLP', positions: ['MC', 'DM'] },
  ],
  Forward: [
    { roleName: 'Advanced Forward', shortRoleName: 'AF', positions: ['ST'] },
  ],
};

async function setupComponent(roles: RoleGroup, activeRoles: Set<string> = new Set()) {
  await TestBed.configureTestingModule({
    imports: [RoleFilterComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideNoopAnimations(),
      providePrimeNG({ theme: { preset: Aura } }),
    ],
  }).compileComponents();

  const playerService = TestBed.inject(PlayerService);
  playerService.roles.set(roles);
  (playerService as any).activeRolesSubject.next(activeRoles);

  const fixture = TestBed.createComponent(RoleFilterComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, playerService };
}

describe('RoleFilterComponent', () => {
  describe('renders without errors', () => {
    it('renders without errors when roles signal is empty {}', async () => {
      const { fixture } = await setupComponent({});
      expect(fixture.nativeElement).not.toBeNull();
    });
  });

  describe('roleGroups()', () => {
    it('always returns exactly 4 groups', async () => {
      const { component } = await setupComponent({});
      expect(component.roleGroups().length).toBe(4);
    });

    it('groups appear in order: Goalkeeper, Defender, Midfielder, Forward', async () => {
      const { component } = await setupComponent({});
      const names = component.roleGroups().map(g => g.groupName);
      expect(names).toEqual(['Goalkeeper', 'Defender', 'Midfielder', 'Forward']);
    });

    it('returns groups with empty roles array for positions not present in data', async () => {
      const { component } = await setupComponent({ Goalkeeper: testRoles['Goalkeeper'] });
      const groups = component.roleGroups();
      expect(groups.find(g => g.groupName === 'Goalkeeper')!.roles.length).toBe(2);
      expect(groups.find(g => g.groupName === 'Defender')!.roles.length).toBe(0);
      expect(groups.find(g => g.groupName === 'Midfielder')!.roles.length).toBe(0);
      expect(groups.find(g => g.groupName === 'Forward')!.roles.length).toBe(0);
    });

    it('allChecked is true when all roles in a position are active', async () => {
      const { component } = await setupComponent(testRoles, new Set(['GK', 'SK']));
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.allChecked).toBe(true);
    });

    it('allChecked is false when no roles are active', async () => {
      const { component } = await setupComponent(testRoles, new Set());
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.allChecked).toBe(false);
    });

    it('indeterminate is true when some (but not all) roles in a position are active', async () => {
      const { component } = await setupComponent(testRoles, new Set(['GK']));
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.indeterminate).toBe(true);
    });

    it('indeterminate is false when all roles in a position are active', async () => {
      const { component } = await setupComponent(testRoles, new Set(['GK', 'SK']));
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.indeterminate).toBe(false);
    });

    it('allChecked is false for an empty group (no roles in that position)', async () => {
      const { component } = await setupComponent({});
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.allChecked).toBe(false);
    });
  });

  describe('accordion structure', () => {
    it('renders a p-accordion element', async () => {
      const { fixture } = await setupComponent(testRoles);
      const accordion = fixture.nativeElement.querySelector('p-accordion');
      expect(accordion).not.toBeNull();
    });

    it('renders four accordion panels', async () => {
      const { fixture } = await setupComponent(testRoles);
      const panels = fixture.nativeElement.querySelectorAll('p-accordion-panel');
      expect(panels.length).toBe(4);
    });

    it('renders four accordion panels even when roles is empty {}', async () => {
      const { fixture } = await setupComponent({});
      const panels = fixture.nativeElement.querySelectorAll('p-accordion-panel');
      expect(panels.length).toBe(4);
    });
  });
});
