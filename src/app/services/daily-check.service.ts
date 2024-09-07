import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from, of, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Notification, Task } from '../models/notifiction.model';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DailyCheckService {
  private tasksCollection = this.firestore.collection<Task>('tasks');
  private notificationsCollection = this.firestore.collection<Notification>('employee-notifications');

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {
    this.startDailyCheck();
  }

  private startDailyCheck(): void {
    // Set interval for daily check (24 hours)
    timer(0, 24 * 60 * 60 * 1000).subscribe(() => {
      this.performDailyCheck();
    });
  }

  private performDailyCheck(): void {
    console.log('Performing daily check for task deadlines...');

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

              if (timeRemaining <= 3 || deadline < now) {
                let message = `Task "${task.title}" `;
                if (deadline < now) {
                  message += `is overdue! Deadline was ${deadline.toLocaleDateString()}.`;
                } else {
                  message += `is due in ${Math.ceil(timeRemaining)} days.`;
                }

                // Ensure assigneeEmail is a string and not undefined
                const assigneeEmail = task.assigneeEmail ?? ''; // Default to empty string if undefined
                const notification: Notification = {
                    message: message,
                    userId: task.assignee || '', // Ensure this is correctly populated
                    timestamp: new Date(),
                    title: task.title,
                    priority: task.priority,
                    deadline: deadline,
                    task 
                  };
                  

                console.log('Creating notification:', notification);

                const notificationRef = this.notificationsCollection.doc();
                batch.set(notificationRef.ref, notification);
              }
            });

            return from(batch.commit());
          }),
          catchError(error => {
            console.error('Error performing daily check:', error);
            return of([]); // Return empty observable on error
          })
        );
      })
    ).subscribe(
      () => console.log('Daily check completed successfully.'),
      error => console.error('Error completing daily check:', error)
    );
  }
}
