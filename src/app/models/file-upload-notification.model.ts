// file-upload-notification.model.ts
export interface FileUploadNotification {
    id: string;
    fileName: string;
    assigneeName: string;
    taskTitle: string;
    adminId: string;
    timestamp: Date;
    taskId?: string; // Optional taskId
    message?: string; // Optional message property
  }
  