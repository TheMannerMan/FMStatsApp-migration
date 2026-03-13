import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  private playerService = inject(PlayerService);
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  isDragOver = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.errorMessage = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.html')) {
      this.errorMessage = 'Please drop an HTML file (.html).';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
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
