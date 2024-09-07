// import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore'; // AngularFire compatibility import
// import { Observable, from } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { AuthService } from '../auth.service'; // Import AuthService
// import { FileUploadNotification } from '../file-upload-notification.model';
// import firebase from 'firebase/compat/app'; // Import Firebase for types
// import 'firebase/compat/firestore'; // Import Firestore functionalities

// @Injectable({
//   providedIn: 'root'
// })
// export class NotificationService {
//   constructor(private firestore: AngularFirestore, private authService: AuthService) {}

//   getNotifications(): Observable<FileUploadNotification[]> {
//     return this.firestore.collection<FileUploadNotification>('notifications', ref =>
//       ref.orderBy('timestamp', 'desc') // Ensure notifications are ordered by timestamp in descending order
//     ).valueChanges().pipe(
//       map((notifications: FileUploadNotification[]) => {
//         // Convert timestamp to Date if it's a Firestore Timestamp
//         const transformedNotifications = notifications.map(notification => ({
//           ...notification,
//           timestamp: notification.timestamp instanceof firebase.firestore.Timestamp
//             ? notification.timestamp.toDate()
//             : new Date(notification.timestamp) // Handle cases where timestamp might already be a Date
//         }));

//         console.log('Transformed notifications:', transformedNotifications); // Debugging line
//         return transformedNotifications;
//       })
//     );
//   }

//   addNotification(notification: FileUploadNotification): Observable<void> {
//     const notificationId = notification.id;
//     return from(this.firestore.collection('notifications').doc(notificationId).set(notification)).pipe(
//       map(() => void 0) // Convert the result to void
//     );
//   }
  

//   clearNotifications(): Observable<void> {
//     return from(this.firestore.collection('notifications').get().toPromise()).pipe(
//       map(snapshot => {
//         if (snapshot) {
//           const batch = this.firestore.firestore.batch();
//           snapshot.forEach(doc => batch.delete(doc.ref));
//           return batch.commit();
//         }
//         return Promise.resolve();
//       }),
//       map(() => void 0) // Convert the result to void
//     );
//   }
//   deleteNotificationForTask(taskId: string): Observable<void> {
//     return this.firestore.collection<FileUploadNotification>('notifications', ref =>
//       ref.where('taskId', '==', taskId)
//     ).get().pipe(
//       map(querySnapshot => {
//         if (!querySnapshot.empty) {
//           const batch = this.firestore.firestore.batch();
//           querySnapshot.forEach(doc => batch.delete(doc.ref));
//           return batch.commit();
//         }
//         return Promise.resolve();
//       }),
//       map(() => void 0) // Convert the result to void
//     );
//   }
  
// }




interface NotificationData {
  fileName: string;
  assigneeName: string;
  taskTitle: string;
  adminId: string;
  timestamp: Date;
  taskId: string;
  message: string;
}




import 'firebase/firestore';
import { Timestamp } from '@angular/fire/firestore'; // Import Timestamp if not already done



import { map,tap } from 'rxjs/operators';
import { AuthService } from './auth.service'; // Import AuthService
import { FileUploadNotification } from '../models/file-upload-notification.model';
import firebase from 'firebase/compat/app'; // Import Firebase for types
import 'firebase/compat/firestore'; // Import Firestore functionalities
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private firestore: AngularFirestore) {}
  
  private localNotificationsKey = 'notifications_cache'; // Key for local storage
  private maxNotifications = 10; // Maximum number of notifications to retain
  private lastClearedKey = 'last_cleared_notifications';


  // addNotification(notification: any): Observable<void> {
  //   return new Observable<void>(observer => {
  //     this.firestore.collection('notifications').add(notification).then(() => {
  //       observer.next();
  //       observer.complete();
  //     }).catch((error) => {
  //       console.error('Error adding notification: ', error);
  //       observer.error(error);
  //     });
  //   });
  // }
 
  getNotifications(): Observable<any[]> {
    return this.firestore.collection('notifications', ref => ref.orderBy('timestamp', 'desc')).get().pipe(
      map(querySnapshot => {
        const notifications = querySnapshot.docs.map(doc => {
          const data = doc.data() as NotificationData;
  
          // Check if the timestamp is a Firestore Timestamp and convert it
          if (data.timestamp instanceof Timestamp) {
            data.timestamp = data.timestamp.toDate();
          }
  
          return {
            id: doc.id,
            ...data
          };
        });
  
        // Filter to keep only the latest notification per task and file
        const uniqueNotifications = this.filterLatestNotifications(notifications);
  
        this.storeNotificationsLocally(uniqueNotifications); // Store in local storage
        
        // Delete notifications from Firestore
        this.clearFirestoreNotifications(uniqueNotifications.map(notif => notif.id));
        
        return uniqueNotifications;
      })
    );
  }
  
  // Helper function to filter the latest notification for each task and file
  private filterLatestNotifications(notifications: any[]): any[] {
    const latestNotifications = new Map<string, any>();
  
    notifications.forEach(notification => {
      const key = `${notification.taskId}-${notification.fileName}`;
      if (!latestNotifications.has(key) || latestNotifications.get(key).timestamp < notification.timestamp) {
        latestNotifications.set(key, notification);
      }
    });
  
    return Array.from(latestNotifications.values());
  }
  
  
  
  // Store notifications in local storage
// Store notifications in local storage with a limit of 10
private storeNotificationsLocally(notifications: any[]): void {
  const limitedNotifications = notifications.slice(0, 10);
  localStorage.setItem(this.localNotificationsKey, JSON.stringify(limitedNotifications));
}

  // Retrieve notifications from local storage
  getCachedNotifications(): any[] {
    const notifications = localStorage.getItem(this.localNotificationsKey);
    return notifications ? JSON.parse(notifications) : [];
  }

  // Delete notifications from Firestore
  private clearFirestoreNotifications(notificationIds: string[]): void {
    const batch = this.firestore.firestore.batch();
    notificationIds.forEach(id => {
      const docRef = this.firestore.collection('notifications').doc(id).ref;
      batch.delete(docRef);
    });
    batch.commit().then(() => {
      console.log('Notifications cleared from Firestore');
    }).catch(error => {
      console.error('Error clearing notifications from Firestore:', error);
    });
  }
  clearNotifications(): Observable<void> {
    const lastClearedDate = this.getLastClearedDate();
    const now = new Date();
    
    if (now.getDate() !== lastClearedDate.getDate() || now.getMonth() !== lastClearedDate.getMonth() || now.getFullYear() !== lastClearedDate.getFullYear()) {
      // Only clear if it's a new day
      const batch = this.firestore.firestore.batch();
      
      return from(this.firestore.collection('notifications').get().toPromise().then(snapshot => {
        if (snapshot) {
          snapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          return batch.commit();
        } else {
          return Promise.resolve(); // No documents to delete
        }
      }).then(() => {
        this.setLastClearedDate(now); // Update the last cleared date
        console.log('Notifications cleared from Firestore');
      }).catch(error => {
        console.error('Error clearing notifications: ', error);
      }));
    } else {
      return new Observable<void>(observer => {
        observer.next();
        observer.complete();
      });
    }
  }
  
  

  // Adding new notification
  addNotification(notification: any): Observable<void> {
    return from(this.firestore.collection('notifications').add(notification)).pipe(
      map(() => {
        this.cleanupNotifications(); // Clean up older notifications after adding new one
      })
    );
  }
  

  // Clean up older notifications in Firestore
  private cleanupNotifications(): void {
    this.firestore.collection('notifications', ref => ref.orderBy('timestamp', 'desc').limit(this.maxNotifications + 1)).get().pipe(
      map(querySnapshot => {
        const notificationIds = querySnapshot.docs.map(doc => doc.id);
        if (querySnapshot.size > this.maxNotifications) {
          const oldestNotifications = notificationIds.slice(this.maxNotifications);
          this.clearFirestoreNotifications(oldestNotifications); // Delete older notifications
        }
      })
    ).subscribe();
  }
  

  removeNotification(id: string): Observable<void> {
    return new Observable<void>(observer => {
      this.firestore.collection('notifications').doc(id).delete().then(() => {
        observer.next();
        observer.complete();
      }).catch((error) => {
        console.error('Error removing notification: ', error);
        observer.error(error);
      });
    });
  }

  deleteNotificationForTask(taskId: string): Observable<void> {
    return new Observable<void>(observer => {
      this.firestore.collection('notifications', ref =>
        ref.where('taskId', '==', taskId)
      ).get().pipe(
        map(querySnapshot => {
          if (!querySnapshot.empty) {
            const batch = this.firestore.firestore.batch();
            querySnapshot.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
          }
          return Promise.resolve();
        })
      ).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (error) => {
          console.error('Error clearing notifications: ', error);
          observer.error(error);
        }
      });
    });
  }
  private getLastClearedDate(): Date {
    const lastCleared = localStorage.getItem(this.lastClearedKey);
    return lastCleared ? new Date(lastCleared) : new Date(0); // Default to epoch if not found
  }
  
  // Method to set the last cleared date
  private setLastClearedDate(date: Date): void {
    localStorage.setItem(this.lastClearedKey, date.toISOString());
  }
}
