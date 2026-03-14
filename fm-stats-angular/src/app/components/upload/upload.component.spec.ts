import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UploadComponent } from './upload.component';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';

function mockPlayer(uid = 1): Player {
  return {
    uid, name: 'Test', age: 25, club: 'FC Test', nationality: 'Swedish',
    secondNationality: '', position: 'ST', personality: 'Determined',
    mediaHandling: 'Reserved', averageRating: 7.5, wage: 5000,
    transferValue: 1000000, leftFoot: 'Strong', rightFoot: 'Weak',
    height: 180, reg: '', inf: '',
    oneVsOne: 14, acceleration: 15, aerialAbility: 10, aggression: 12,
    agility: 14, anticipation: 13, balance: 14, bravery: 12,
    commandOfArea: 10, concentration: 13, composure: 14, crossing: 10,
    decisions: 13, determination: 15, dribbling: 12, finishing: 14,
    firstTouch: 13, flair: 12, handling: 8, heading: 12,
    jumpingReach: 13, kicking: 8, leadership: 10, longShots: 11,
    marking: 9, offTheBall: 14, pace: 15, passing: 11,
    positioning: 13, reflexes: 9, stamina: 14, strength: 13,
    tackling: 9, teamwork: 13, technique: 13, throwing: 8,
    throwOuts: 8, vision: 12, workRate: 14, corners: 9,
    roles: [{ roleName: 'Striker', shortRoleName: 'ST', position: 'ST', roleScore: 8.5 }],
  };
}

describe('UploadComponent', () => {
  let setPlayersSpy: ReturnType<typeof vi.fn>;
  let uploadFileSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    setPlayersSpy = vi.fn();
    uploadFileSpy = vi.fn();

    const mockPlayerService = {
      players$: of([] as Player[]),
      activeRoles$: of(new Set<string>()),
      roles: signal({}),
      setPlayers: setPlayersSpy,
      uploadFile: uploadFileSpy,
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: PlayerService, useValue: mockPlayerService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('calls setPlayers with the API response after a successful upload', async () => {
    const mockPlayers = [mockPlayer()];
    uploadFileSpy.mockReturnValue(of(mockPlayers));

    const fixture = TestBed.createComponent(UploadComponent);
    const component = fixture.componentInstance;
    component.selectedFile = new File(['data'], 'squad.html');
    component.onUpload();

    expect(setPlayersSpy).toHaveBeenCalledWith(mockPlayers);
  });

  it('does not call setPlayers when no file is selected', () => {
    uploadFileSpy.mockReturnValue(of([]));

    const fixture = TestBed.createComponent(UploadComponent);
    const component = fixture.componentInstance;
    component.selectedFile = null;
    component.onUpload();

    expect(setPlayersSpy).not.toHaveBeenCalled();
  });
});
