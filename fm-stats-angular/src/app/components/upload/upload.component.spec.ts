import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UploadComponent } from './upload.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

function mockPlayer(overrides: Partial<Player> = {}): Player {
  return {
    uid: 1, name: 'Test Player', age: 25, club: 'Test FC', nationality: 'Swedish',
    position: 'MC', wage: 1000, transferValue: 500000, averageRating: 7.0,
    roles: [], reg: '', inf: '', secondNationality: '', personality: '',
    mediaHandling: '', leftFoot: 'Strong', rightFoot: 'Weak', height: 180,
    oneVsOne: 10, acceleration: 12, aerialAbility: 8, aggression: 11, agility: 13,
    anticipation: 14, balance: 12, bravery: 10, commandOfArea: 5, concentration: 13,
    composure: 12, crossing: 11, decisions: 14, determination: 15, dribbling: 12,
    finishing: 11, firstTouch: 13, flair: 10, handling: 5, heading: 9,
    jumpingReach: 11, kicking: 5, leadership: 8, longShots: 10, marking: 13,
    offTheBall: 12, pace: 13, passing: 14, positioning: 13, reflexes: 5,
    stamina: 14, strength: 11, tackling: 13, teamwork: 14, technique: 12,
    throwing: 5, throwOuts: 5, vision: 13, workRate: 14, corners: 10,
    ...overrides,
  };
}

/**
 * Build a minimal fake DragEvent with a synthetic dataTransfer containing the given file.
 * JSDOM does not expose the DragEvent constructor or DataTransfer, so we create a plain
 * Event and attach the necessary properties manually.
 */
function makeDragEvent(type: string, file?: File): Event {
  const event = new Event(type, { bubbles: true, cancelable: true }) as Event & {
    dataTransfer: { files: FileList } | null;
  };
  if (file) {
    // Build a minimal FileList-like object
    const dt = {
      files: Object.assign([file], { item: (i: number) => [file][i] ?? null }) as unknown as FileList,
    };
    event.dataTransfer = dt;
  } else {
    event.dataTransfer = null;
  }
  return event;
}

describe('UploadComponent', () => {
  let fixture: ComponentFixture<UploadComponent>;
  let component: UploadComponent;
  let element: HTMLElement;
  let httpMock: HttpTestingController;
  let playerService: PlayerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    httpMock = TestBed.inject(HttpTestingController);
    playerService = TestBed.inject(PlayerService);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  describe('existing upload behavior', () => {
    it('calls setPlayers after successful upload', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      // Set selectedFile directly — JSDOM does not support programmatic file input events
      component.selectedFile = new File(['<html></html>'], 'export.html', { type: 'text/html' });
      component.onUpload();

      const req = httpMock.expectOne('/api/players/upload');
      const players = [mockPlayer()];
      req.flush(players);

      expect(spy).toHaveBeenCalledWith(players);
    });

    it('does not call setPlayers when no file selected', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      component.onUpload();
      httpMock.expectNone('/api/players/upload');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('drag-and-drop', () => {
    it('sets isDragOver to true on dragover', () => {
      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(makeDragEvent('dragover'));
      expect(component.isDragOver).toBe(true);
    });

    it('sets isDragOver to false on dragleave', () => {
      component.isDragOver = true;
      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(makeDragEvent('dragleave'));
      expect(component.isDragOver).toBe(false);
    });

    it('triggers upload flow on drop with a valid .html file', () => {
      const spy = vi.spyOn(playerService, 'setPlayers');
      const file = new File(['<html></html>'], 'export.html', { type: 'text/html' });

      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(makeDragEvent('drop', file));
      fixture.detectChanges();

      const req = httpMock.expectOne('/api/players/upload');
      req.flush([mockPlayer()]);
      expect(spy).toHaveBeenCalled();
    });

    it('shows an error on drop with an invalid file type', () => {
      const file = new File(['data'], 'export.csv', { type: 'text/csv' });

      const dropZone = element.querySelector('.upload-drop-zone') as HTMLElement;
      dropZone.dispatchEvent(makeDragEvent('drop', file));
      fixture.detectChanges();

      httpMock.expectNone('/api/players/upload');
      expect(component.errorMessage).toBeTruthy();
      expect(element.querySelector('.upload-error')).not.toBeNull();
    });
  });
});
