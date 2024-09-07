// import { Component, Inject, Input } from '@angular/core';
// import { UploadService } from '../upload.service';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { DialogData } from '../dialog-data.model';

// @Component({
//   selector: 'app-upload',
//   templateUrl: './upload.component.html',
//   styleUrls: ['./upload.component.css']
// })
// export class UploadComponent {
//   @Input() taskId!: string;
//   files: File[] = [];
//   isDragover = false;
//   isDarkTheme = false; // Default to light theme
//   themeIcon = '🌞'; // Default theme icon


//   constructor(
//     private uploadService: UploadService,
//     public dialogRef: MatDialogRef<UploadComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData
//   ) {
//     this.taskId = data.taskId;
//     this.isDarkTheme = data.isDarkTheme;
//   }

//   onDragOver(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragover = true;
//     if (event.dataTransfer) {
//       event.dataTransfer.dropEffect = 'copy';
//     }
//   }
//   toggleTheme(): void {
//     this.isDarkTheme = !this.isDarkTheme;
//     this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
//   }


//   onDragLeave(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragover = false;
//   }

//   onFileDropped(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     if (event.dataTransfer && event.dataTransfer.files) {
//       this.files = Array.from(event.dataTransfer.files);
//     }
//     this.isDragover = false;
//   }

//   onFileSelected(event: Event) {
//     const target = event.target as HTMLInputElement;
//     if (target.files && target.files.length > 0) {
//       this.files = Array.from(target.files);
//     }
//   }

//   saveFiles() {
//     this.files.forEach(file => {
//       this.uploadService.uploadFile(this.taskId, file).subscribe();
//     });
//     this.closeModal();
//   }

//   closeModal() {
//     this.dialogRef.close();
//   }
// }





// import { Component, Inject, Input } from '@angular/core';
// import { UploadService } from '../upload.service';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { DialogData } from '../dialog-data.model';

// @Component({
//   selector: 'app-upload',
//   templateUrl: './upload.component.html',
//   styleUrls: ['./upload.component.css']
// })
// export class UploadComponent {
//   @Input() taskId!: string;
//   files: File[] = [];
//   isDragover = false;
//   isDarkTheme = false; // Default to light theme
//   themeIcon = '🌞'; // Default theme icon

//   constructor(
//     private uploadService: UploadService,
//     public dialogRef: MatDialogRef<UploadComponent>,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData
//   ) {
//     this.taskId = data.taskId;
//     this.isDarkTheme = data.isDarkTheme;
//   }

//   onDragOver(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragover = true;
//     if (event.dataTransfer) {
//       event.dataTransfer.dropEffect = 'copy';
//     }
//   }

//   toggleTheme(): void {
//     this.isDarkTheme = !this.isDarkTheme;
//     this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
//   }

//   onDragLeave(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     this.isDragover = false;
//   }

//   onFileDropped(event: DragEvent) {
//     event.preventDefault();
//     event.stopPropagation();
//     if (event.dataTransfer && event.dataTransfer.files) {
//       this.files = Array.from(event.dataTransfer.files);
//     }
//     this.isDragover = false;
//   }

//   onFileSelected(event: Event) {
//     const target = event.target as HTMLInputElement;
//     if (target.files && target.files.length > 0) {
//       this.files = Array.from(target.files);
//     }
//   }

//   saveFiles() {
//     this.files.forEach(file => {
//       this.uploadService.uploadFile(this.taskId, file).subscribe();
//     });
//     this.dialogRef.close('uploaded');
//   }

//   closeModal() {
//     this.dialogRef.close();
//   }
// }















import { Component, Inject, Input } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../dialog-data.model';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {
  @Input() taskId!: string;
  files: File[] = [];
  isDragover = false;
  isDarkTheme = false; // Default to light theme
  themeIcon = '🌞'; // Default theme icon
  uploading = false; // Add a flag to prevent multiple uploads

  constructor(
    private uploadService: UploadService,
    private notificationService: NotificationService, // Inject the notification service
    public dialogRef: MatDialogRef<UploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.taskId = data.taskId;
    this.isDarkTheme = data.isDarkTheme;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files) {
      this.files = Array.from(event.dataTransfer.files);
    }
    this.isDragover = false;
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.files = Array.from(target.files);
    }
  }

  saveFiles() {
    if (this.uploading || this.files.length === 0) return; // Prevent multiple uploads

    this.uploading = true;
    const uploadObservables = this.files.map(file => this.uploadService.uploadFile(this.taskId, file));

    // Use forkJoin to wait for all uploads to complete
    forkJoin(uploadObservables).subscribe({
      next: () => {
        // No need to add a notification manually here since it's handled in `uploadFile`
        this.dialogRef.close('uploaded');
      },
      error: (error: any) => {
        console.error('Error uploading files: ', error);
        this.uploading = false;
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }
}
