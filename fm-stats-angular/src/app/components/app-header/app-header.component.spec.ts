import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppHeaderComponent } from './app-header.component';

describe('AppHeaderComponent', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AppHeaderComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the app title "FM Stats"', () => {
    expect(element.textContent).toContain('FM Stats');
  });

  it('has a nav link to /upload', () => {
    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/upload');
  });

  it('has a nav link to /players', () => {
    const links = element.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map(a => a.getAttribute('routerLink'));
    expect(hrefs).toContain('/players');
  });
});
