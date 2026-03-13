import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Checkbox } from 'primeng/checkbox';
import { RoleFilterComponent } from './role-filter.component';
import { PlayerService } from '../../services/player.service';

const MOCK_ROLES = {
  'Goalkeeper': [
    { shortRoleName: 'GKD', roleName: 'Goalkeeper Defend', positions: ['GK'] },
    { shortRoleName: 'SKD', roleName: 'Sweeper Keeper Defend', positions: ['GK'] }
  ]
};

describe('RoleFilterComponent', () => {
  let fixture: ComponentFixture<RoleFilterComponent>;
  let component: RoleFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFilterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();

    const svc = TestBed.inject(PlayerService);
    svc.roles.set(MOCK_ROLES);
    svc.activeRoles.set(new Set(['GKD', 'SKD']));

    fixture = TestBed.createComponent(RoleFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.flushEffects();
  });

  // Spec requirement 4: PrimeNG onChange binding
  describe('PrimeNG p-checkbox onChange binding', () => {
    it('calls toggleRole with shortRoleName and checked=false when unchecking a role', () => {
      const spy = vi.spyOn(component, 'toggleRole');
      fixture.detectChanges();
      TestBed.flushEffects();

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      const gkdCb = checkboxes.find(cb => cb.componentInstance.inputId === 'GKD');
      expect(gkdCb).toBeTruthy();

      gkdCb!.componentInstance.onChange.emit({ checked: false, originalEvent: new MouseEvent('click') });

      expect(spy).toHaveBeenCalledWith('GKD', false);
    });

    it('calls toggleRole with shortRoleName and checked=true when checking a role', () => {
      const svc = TestBed.inject(PlayerService);
      svc.activeRoles.set(new Set());
      const spy = vi.spyOn(component, 'toggleRole');
      fixture.detectChanges();
      TestBed.flushEffects();

      const checkboxes = fixture.debugElement.queryAll(By.directive(Checkbox));
      const skdCb = checkboxes.find(cb => cb.componentInstance.inputId === 'SKD');
      expect(skdCb).toBeTruthy();

      skdCb!.componentInstance.onChange.emit({ checked: true, originalEvent: new MouseEvent('click') });

      expect(spy).toHaveBeenCalledWith('SKD', true);
    });
  });

  describe('mobile drawer toggle', () => {
    it('toggleDrawer flips drawerVisible', () => {
      expect(component.drawerVisible).toBe(false);
      component.toggleDrawer();
      expect(component.drawerVisible).toBe(true);
      component.toggleDrawer();
      expect(component.drawerVisible).toBe(false);
    });
  });
});
