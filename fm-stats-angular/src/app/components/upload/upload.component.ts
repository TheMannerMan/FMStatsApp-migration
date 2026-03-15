import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = false;
  isDragOver = false;
  errorMessage: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = null;
    if (this.selectedFile) {
      this.onUpload();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (!file) return;
    if (!file.name.endsWith('.html') && file.type !== 'text/html') {
      this.errorMessage = 'Invalid file type. Please upload an HTML export from Football Manager.';
      return;
    }
    this.selectedFile = file;
    this.errorMessage = null;
    this.onUpload();
  }

  onUpload(): void {
    if (!this.selectedFile || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.playerService.uploadFile(this.selectedFile).subscribe({
      next: (players) => {
        this.playerService.setPlayers(players);
        this.isLoading = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Upload failed. Please try again.';
      },
    });
  }
}
