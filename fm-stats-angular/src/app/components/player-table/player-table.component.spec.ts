import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerTableComponent } from './player-table.component';

describe('PlayerTableComponent', () => {
  let fixture: ComponentFixture<PlayerTableComponent>;
  let component: PlayerTableComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTableComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        providePrimeNG({ theme: { preset: Aura } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerTableComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders a filter toggle button', () => {
    const btn = element.querySelector('.filter-toggle-btn');
    expect(btn).not.toBeNull();
  });

  it('filterDrawerVisible is false initially', () => {
    expect(component.filterDrawerVisible).toBe(false);
  });

  it('toggles filterDrawerVisible when filter button is clicked', () => {
    const btn = element.querySelector('.filter-toggle-btn') as HTMLElement;
    btn.click();
    expect(component.filterDrawerVisible).toBe(true);
    btn.click();
    expect(component.filterDrawerVisible).toBe(false);
  });

  describe('customSort', () => {
    function row(name: string, age: number, scores: Record<string, number | null>) {
      return {
        name,
        age,
        roles: Object.entries(scores)
          .filter(([, v]) => v !== null)
          .map(([shortRoleName, roleScore]) => ({
            roleName: shortRoleName,
            shortRoleName,
            position: shortRoleName,
            roleScore: roleScore as number,
          })),
      };
    }

    it('sorts by a basic column ascending', () => {
      const data = [row('B', 30, {}), row('A', 20, {}), row('C', 25, {})];
      component.customSort({ data, field: 'age', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts by a basic column descending', () => {
      const data = [row('B', 30, {}), row('A', 20, {}), row('C', 25, {})];
      component.customSort({ data, field: 'age', order: -1 });
      expect(data.map(p => p.name)).toEqual(['B', 'C', 'A']);
    });

    it('sorts by a role column ascending using role score', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: 8.5 }),
        row('C', 25, { ST: 7.0 }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts by a role column descending using role score', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: 8.5 }),
        row('C', 25, { ST: 7.0 }),
      ];
      component.customSort({ data, field: 'ST', order: -1 });
      expect(data.map(p => p.name)).toEqual(['B', 'C', 'A']);
    });

    it('sorts players with null role scores to the bottom on ascending sort', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: 8.5 }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'C', 'B']);
    });

    it('sorts players with null role scores to the bottom on descending sort', () => {
      const data = [
        row('A', 25, { ST: 5.5 }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: 8.5 }),
      ];
      component.customSort({ data, field: 'ST', order: -1 });
      expect(data.map(p => p.name)).toEqual(['C', 'A', 'B']);
    });

    it('is a no-op when all role scores for the column are null', () => {
      const data = [
        row('A', 25, { ST: null }),
        row('B', 25, { ST: null }),
        row('C', 25, { ST: null }),
      ];
      component.customSort({ data, field: 'ST', order: 1 });
      expect(data.map(p => p.name)).toEqual(['A', 'B', 'C']);
    });
  });
});
