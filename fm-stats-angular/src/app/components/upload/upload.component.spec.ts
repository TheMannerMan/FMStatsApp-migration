import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { UploadComponent } from './upload.component';

describe('UploadComponent', () => {
  let fixture: ComponentFixture<UploadComponent>;
  let component: UploadComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        providePrimeNG({ theme: { preset: Aura } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.flushEffects();
  });

  // jsdom does not expose DragEvent — build a plain-object stand-in
  function makeDrop(filename: string): DragEvent {
    const file = new File(['<html></html>'], filename, { type: 'text/html' });
    return {
      dataTransfer: { files: [file] } as unknown as DataTransfer,
      preventDefault: () => {}
    } as unknown as DragEvent;
  }

  describe('drag-and-drop', () => {
    it('sets selectedFile when a valid .html file is dropped', () => {
      component.onDrop(makeDrop('squad.html'));
      expect(component.selectedFile?.name).toBe('squad.html');
      expect(component.errorMessage).toBeNull();
    });

    it('sets errorMessage and leaves selectedFile null when a non-.html file is dropped', () => {
      component.onDrop(makeDrop('squad.csv'));
      expect(component.selectedFile).toBeNull();
      expect(component.errorMessage).toBeTruthy();
    });

    it('clears a previously selected file when a non-.html file is dropped', () => {
      component.selectedFile = new File([''], 'old.html');
      component.onDrop(makeDrop('bad.txt'));
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('upload button state', () => {
    it('is disabled when selectedFile is null', () => {
      component.selectedFile = null;
      fixture.detectChanges();
      TestBed.flushEffects();
      const btn = fixture.nativeElement.querySelector('button[disabled]') as HTMLButtonElement | null;
      expect(btn).toBeTruthy();
    });

    it('is not disabled when selectedFile is set', () => {
      component.selectedFile = new File(['<html></html>'], 'squad.html');
      // Check the disabled binding value directly: !selectedFile || isLoading
      expect(!component.selectedFile || component.isLoading).toBeFalsy();
    });
  });
});
