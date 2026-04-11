import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { FormationPickerComponent } from './formation-picker.component';
import { FORMATION_SLUGS } from '../../models/formations-catalog';

describe('FormationPickerComponent', () => {
  let fixture: ComponentFixture<FormationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationPickerComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationPickerComponent);
    fixture.detectChanges();
  });

  it('renders 10 formation cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.formation-card');
    expect(cards.length).toBe(10);
  });

  it('each card links to /best-eleven/:slug', () => {
    const links = fixture.nativeElement.querySelectorAll('a.formation-card');
    expect(links.length).toBe(10);
    FORMATION_SLUGS.forEach((slug, i) => {
      expect(decodeURIComponent(links[i].getAttribute('href'))).toBe(`/best-eleven/${slug}`);
    });
  });

  it('all 10 formation names visible in text', () => {
    const text: string = fixture.nativeElement.textContent;
    FORMATION_SLUGS.forEach(slug => {
      expect(text).toContain(slug);
    });
  });
});
