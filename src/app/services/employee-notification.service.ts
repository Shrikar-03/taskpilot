import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Notification, Task } from '../models/notifiction.model';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

@Injectable({
  providedIn: 'root'
})
export class EmployeeNotificationService {
  private notificationsCollection = this.firestore.collection<Notification>('employee-notifications');
  private tasksCollection = this.firestore.collection<Task>('tasks');

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  // Fetch notifications for the logged-in user
  getNotificationsForEmployee(): Observable<Notification[]> {
    console.log('Fetching notifications for employee...');
    return this.authService.getUserEmail().pipe(
      switchMap(userEmail => {
        if (!userEmail) {
          console.warn('No user email found');
          return of([]); // No user email found
        }
        console.log('User email:', userEmail);
        return this.firestore.collection<Notification>('employee-notifications', ref =>
          ref.where('userId', '==', userEmail)
        ).snapshotChanges().pipe(
          map(actions => {
            console.log('Notifications fetched:', actions);
            return actions.map(a => {
              const data = a.payload.doc.data() as Notification;
              const id = a.payload.doc.id;
              console.log('Notification data:', data);

              // Convert Firestore Timestamp to Date if needed
              if (data.deadline instanceof Timestamp) {
                data.deadline = data.deadline.toDate();
              }

              return { id, ...data };
            });
          }),
          catchError((error: any) => {
            console.error('Error fetching notifications:', error);
            return of([]); // Return an empty array on error
          })
        );
      })
    );
  }

  // Create notifications based on task deadlines and assignments
  createNotifications(): void {
    console.log('Creating notifications...');
    this.authService.getUserEmail().pipe(
      switchMap(userEmail => {
        if (!userEmail) {
          console.warn('No user email found');
          return of([]); // No user email found
        }
        console.log('User email:', userEmail);
        return this.tasksCollection.snapshotChanges().pipe(
          switchMap(actions => {
            const now = new Date();
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(now.getDate() + 3);

            const batch = this.firestore.firestore.batch();

            actions.forEach(action => {
              const task = action.payload.doc.data() as Task; // Ensure type assertion here
              const deadline = (task.deadline as Timestamp).toDate(); // Convert Firestore Timestamp to Date
              const timeRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24); // Time remaining in days

              console.log('Processing task:', task);
              console.log('Deadline:', deadline);
              console.log('Time remaining:', timeRemaining);

              // Use the assignee property from the task
              const assigneeEmail = task.assignee; // Assuming assignee contains the email

              if (timeRemaining <= 3 || deadline < now) {
                let message = `Task "${task.title}" `;
                if (deadline < now) {
                  message += `is overdue! Deadline was ${deadline.toLocaleDateString()}.`;
                } else {
                  message += `is due in ${Math.ceil(timeRemaining)} days.`;
                }

                const notification: Notification = {
                  message: message,
                  userId: assigneeEmail, // Use the assignee email
                  timestamp: new Date(),
                  title: task.title,
                  priority: task.priority,
                  deadline: deadline,
                  task // Attach task details to notification
                };

                console.log('Creating notification:', notification);

                const notificationRef = this.notificationsCollection.doc();
                batch.set(notificationRef.ref, notification);
              }
            });

            return from(batch.commit());
          })
        );
      })
    ).subscribe(
      () => console.log('Notifications created successfully.'),
      error => console.error('Error creating notifications:', error)
    );
  }
}
