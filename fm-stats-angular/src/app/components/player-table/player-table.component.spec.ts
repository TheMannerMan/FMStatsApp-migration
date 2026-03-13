import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { Table } from 'primeng/table';
import { PlayerTableComponent } from './player-table.component';

describe('PlayerTableComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerTableComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();
  });

  describe('getRoleScoreClass', () => {
    let component: PlayerTableComponent;

    beforeEach(() => {
      component = TestBed.createComponent(PlayerTableComponent).componentInstance;
    });

    it('returns score-high for score >= 8.0', () => {
      expect(component.getRoleScoreClass(8.0)).toBe('score-high');
      expect(component.getRoleScoreClass(10.0)).toBe('score-high');
    });

    it('returns score-medium for score 6.0 to 7.9', () => {
      expect(component.getRoleScoreClass(6.0)).toBe('score-medium');
      expect(component.getRoleScoreClass(7.0)).toBe('score-medium');
      expect(component.getRoleScoreClass(7.99)).toBe('score-medium');
    });

    it('returns score-low for score < 6.0', () => {
      expect(component.getRoleScoreClass(5.9)).toBe('score-low');
      expect(component.getRoleScoreClass(0)).toBe('score-low');
    });
  });

  describe('table styleClass', () => {
    it('includes p-datatable-striped and p-datatable-gridlines', () => {
      const fixture = TestBed.createComponent(PlayerTableComponent);
      fixture.detectChanges();
      TestBed.flushEffects();
      const tableDebug = fixture.debugElement.query(By.directive(Table));
      expect(tableDebug.componentInstance.styleClass).toContain('p-datatable-striped');
      expect(tableDebug.componentInstance.styleClass).toContain('p-datatable-gridlines');
    });
  });
});
