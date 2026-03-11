import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = null;
  }

  onUpload(): void {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.playerService.uploadFile(this.selectedFile).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Upload failed. Please try again.';
      }
    });
  }
}
