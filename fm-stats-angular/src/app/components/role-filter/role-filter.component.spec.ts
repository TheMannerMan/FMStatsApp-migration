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
  playerService.setActiveRoles(activeRoles);

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

    it('indeterminate is false when no roles in a non-empty group are active', async () => {
      const { component } = await setupComponent(testRoles, new Set());
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.indeterminate).toBe(false);
    });

    it('allChecked is false for an empty group (no roles in that position)', async () => {
      const { component } = await setupComponent({});
      const gkGroup = component.roleGroups().find(g => g.groupName === 'Goalkeeper')!;
      expect(gkGroup.allChecked).toBe(false);
    });
  });

  describe('role label display', () => {
    it('displays the full role name as the label text, not the abbreviation', async () => {
      const { fixture } = await setupComponent(testRoles);
      const labels = fixture.nativeElement.querySelectorAll('label.role-label');
      const labelTexts = Array.from<Element>(labels).map(el => el.textContent?.trim());
      expect(labelTexts).toContain('Goalkeeper');
      expect(labelTexts).toContain('Sweeper Keeper');
      expect(labelTexts).not.toContain('GK');
      expect(labelTexts).not.toContain('SK');
    });

    it('does not display abbreviations as label text', async () => {
      const { fixture } = await setupComponent(testRoles);
      const labels = fixture.nativeElement.querySelectorAll('label.role-label');
      const labelTexts = Array.from<Element>(labels).map(el => el.textContent?.trim());
      expect(labelTexts).not.toContain('BBM');
      expect(labelTexts).not.toContain('DLP');
      expect(labelTexts).not.toContain('AF');
      expect(labelTexts).not.toContain('CD');
    });

    it('toggling a role checkbox by full name adds shortRoleName to active roles', async () => {
      const { fixture, component } = await setupComponent(testRoles);
      const checkboxes = fixture.nativeElement.querySelectorAll('label.role-label input[type="checkbox"]');
      // First checkbox corresponds to first role in first group (GK)
      const firstCheckbox = checkboxes[0] as HTMLInputElement;
      firstCheckbox.checked = true;
      firstCheckbox.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect((component as any).activeRoles().has('GK')).toBe(true);
    });
  });

  describe('alphabetical order', () => {
    it('renders roles within each group sorted alphabetically by roleName', async () => {
      const unsortedRoles: RoleGroup = {
        Goalkeeper: [],
        Defender: [],
        Midfielder: [
          { roleName: 'Segundo Volante', shortRoleName: 'SV', positions: ['MC'] },
          { roleName: 'Ball-Winning Midfielder', shortRoleName: 'BWM', positions: ['MC'] },
          { roleName: 'Advanced Playmaker', shortRoleName: 'AP', positions: ['MC'] },
        ],
        Forward: [],
      };
      const { fixture } = await setupComponent(unsortedRoles);
      const labels = Array.from<Element>(
        fixture.nativeElement.querySelectorAll('label.role-label')
      ).map(el => el.textContent?.trim());
      expect(labels).toEqual(['Advanced Playmaker', 'Ball-Winning Midfielder', 'Segundo Volante']);
    });

    it('handles roles with missing roleName without throwing', async () => {
      const rolesWithMissing: RoleGroup = {
        Goalkeeper: [
          { roleName: '', shortRoleName: 'X', positions: ['GK'] },
          { roleName: 'Goalkeeper', shortRoleName: 'GK', positions: ['GK'] },
        ],
        Defender: [], Midfielder: [], Forward: [],
      };
      const { fixture } = await setupComponent(rolesWithMissing);
      expect(fixture.nativeElement).not.toBeNull();
    });
  });

  describe('search input', () => {
    it('renders a search input at the top of the component', async () => {
      const { fixture } = await setupComponent(testRoles);
      const input = fixture.nativeElement.querySelector('input[type="search"], input.role-search-input');
      expect(input).not.toBeNull();
    });

    it('filters displayed roles to those whose roleName contains the search term (case-insensitive)', async () => {
      const { fixture, component } = await setupComponent(testRoles);
      (component as any).searchTerm.set('wing');
      fixture.detectChanges();
      const labels = Array.from<Element>(
        fixture.nativeElement.querySelectorAll('label.role-label')
      ).map(el => el.textContent?.trim());
      // testRoles has no "wing" role — all labels gone
      expect(labels.length).toBe(0);
    });

    it('filters roles matching partial name case-insensitively', async () => {
      const rolesWithWing: RoleGroup = {
        ...testRoles,
        Midfielder: [
          { roleName: 'Wide Midfielder', shortRoleName: 'WM', positions: ['ML', 'MR'] },
          { roleName: 'Box to Box', shortRoleName: 'BBM', positions: ['MC'] },
        ],
      };
      const { fixture, component } = await setupComponent(rolesWithWing);
      (component as any).searchTerm.set('wide');
      fixture.detectChanges();
      const labels = Array.from<Element>(
        fixture.nativeElement.querySelectorAll('label.role-label')
      ).map(el => el.textContent?.trim());
      expect(labels).toContain('Wide Midfielder');
      expect(labels).not.toContain('Box to Box');
    });

    it('hides position group panels that have no matching roles when search is active', async () => {
      const { fixture, component } = await setupComponent(testRoles);
      // "Goalkeeper" only matches GK group roles — Midfielder has no "goalkeeper" role
      (component as any).searchTerm.set('goalkeeper');
      fixture.detectChanges();
      const panels = fixture.nativeElement.querySelectorAll('p-accordion-panel');
      // Only Goalkeeper group matches
      expect(panels.length).toBe(1);
    });

    it('restores all groups and roles when search is cleared', async () => {
      const { fixture, component } = await setupComponent(testRoles);
      (component as any).searchTerm.set('goalkeeper');
      fixture.detectChanges();
      (component as any).searchTerm.set('');
      fixture.detectChanges();
      const panels = fixture.nativeElement.querySelectorAll('p-accordion-panel');
      expect(panels.length).toBe(4);
    });

    it('shows no accordion panels when no roles match the search term', async () => {
      const { fixture, component } = await setupComponent(testRoles);
      (component as any).searchTerm.set('xyznotarole');
      fixture.detectChanges();
      const panels = fixture.nativeElement.querySelectorAll('p-accordion-panel');
      expect(panels.length).toBe(0);
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
