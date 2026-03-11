import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { PlayerTableComponent } from './components/player-table/player-table.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'players', component: PlayerTableComponent },
];
