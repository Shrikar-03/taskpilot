import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp
export interface Notification {
    id?: string;
    message: string;
    userId: string;
    timestamp: Date;
    title: string;
    priority: string;
    deadline: Date; // Ensure this is a JavaScript Date object
    task?: Task; // Optional
  }
  
  
export interface Task {
  title: string;
  deadline: Timestamp; // Use Firestore Timestamp
  priority: string;
  assignee: string;
  assigneeEmail?: string; // Assuming this is an email or user ID
}
