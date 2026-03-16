import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { PlayerTableComponent } from './components/player-table/player-table.component';
import { BestElevenComponent } from './components/best-eleven/best-eleven.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'players', component: PlayerTableComponent },
  { path: 'best-eleven', component: BestElevenComponent },
];
