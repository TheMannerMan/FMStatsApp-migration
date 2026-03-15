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
});
