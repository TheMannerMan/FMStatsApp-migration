import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RolePickerModalComponent } from './role-picker-modal.component';
import { RoleInfo } from '../../models/role-group.model';

const makeRoles = (): RoleInfo[] => [
  { roleName: 'Central Defender', shortRoleName: 'CD', positions: ['DC'] },
  { roleName: 'Wing-Back', shortRoleName: 'WB', positions: ['DL', 'DR'] },
  { roleName: 'Sweeper Keeper', shortRoleName: 'SK', positions: ['GK'] },
];

describe('RolePickerModalComponent', () => {
  let fixture: ComponentFixture<RolePickerModalComponent>;
  let component: RolePickerModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePickerModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RolePickerModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ── filteredRoles computed ───────────────────────────────────────────────

  it('filteredRoles returns all roles when search is empty', () => {
    component.roles = makeRoles();
    fixture.detectChanges();

    expect(component.filteredRoles().length).toBe(3);
    expect(component.filteredRoles().map(r => r.roleName)).toContain('Central Defender');
    expect(component.filteredRoles().map(r => r.roleName)).toContain('Wing-Back');
    expect(component.filteredRoles().map(r => r.roleName)).toContain('Sweeper Keeper');
  });

  it('filters roles case-insensitively — lowercase search', () => {
    component.roles = makeRoles();
    component.searchTerm.set('central');
    fixture.detectChanges();

    const filtered = component.filteredRoles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].roleName).toBe('Central Defender');
  });

  it('filters roles case-insensitively — uppercase search', () => {
    component.roles = makeRoles();
    component.searchTerm.set('WING');
    fixture.detectChanges();

    const filtered = component.filteredRoles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].shortRoleName).toBe('WB');
  });

  it('filters roles stripping accents from search term', () => {
    const roles: RoleInfo[] = [
      ...makeRoles(),
      { roleName: 'Björn Sweeper', shortRoleName: 'BS', positions: ['GK'] },
    ];
    component.roles = roles;
    component.searchTerm.set('bjorn');
    fixture.detectChanges();

    const filtered = component.filteredRoles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].shortRoleName).toBe('BS');
  });

  it('filters roles stripping accents from roleName', () => {
    const roles: RoleInfo[] = [
      ...makeRoles(),
      { roleName: 'Björn Sweeper', shortRoleName: 'BS', positions: ['GK'] },
    ];
    component.roles = roles;
    component.searchTerm.set('Bjorn Sweeper');
    fixture.detectChanges();

    const filtered = component.filteredRoles();
    expect(filtered.length).toBe(1);
    expect(filtered[0].shortRoleName).toBe('BS');
  });

  it('filteredRoles returns empty array when no roles match', () => {
    component.roles = makeRoles();
    component.searchTerm.set('zzznomatch');
    fixture.detectChanges();

    expect(component.filteredRoles().length).toBe(0);
  });

  // ── Event emissions ──────────────────────────────────────────────────────

  it('selectRole emits shortRoleName via roleSelected', () => {
    const emitted: (string | null)[] = [];
    component.roleSelected.subscribe(v => emitted.push(v));

    component.selectRole({ roleName: 'Central Defender', shortRoleName: 'CD', positions: ['DC'] });

    expect(emitted).toEqual(['CD']);
  });

  it('selectRole emits false via visibleChange', () => {
    const emitted: boolean[] = [];
    component.visibleChange.subscribe(v => emitted.push(v));

    component.selectRole({ roleName: 'Central Defender', shortRoleName: 'CD', positions: ['DC'] });

    expect(emitted).toEqual([false]);
  });

  it('clearSelection emits null via roleSelected', () => {
    const emitted: (string | null)[] = [];
    component.roleSelected.subscribe(v => emitted.push(v));

    component.clearSelection();

    expect(emitted).toEqual([null]);
  });

  it('clearSelection emits false via visibleChange', () => {
    const emitted: boolean[] = [];
    component.visibleChange.subscribe(v => emitted.push(v));

    component.clearSelection();

    expect(emitted).toEqual([false]);
  });

  // ── DOM rendering ────────────────────────────────────────────────────────

  it('shows full roleName in DOM when visible', () => {
    component.roles = makeRoles();
    component.visible = true;
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('Central Defender');
    expect(allContent).toContain('Wing-Back');
    expect(allContent).toContain('Sweeper Keeper');
  });

  it('shows "No roles found" in DOM when search has no results and visible', () => {
    component.roles = makeRoles();
    component.visible = true;
    component.searchTerm.set('zzznomatch');
    fixture.detectChanges();

    const allContent = document.body.textContent ?? '';
    expect(allContent).toContain('No roles found');
  });
});
