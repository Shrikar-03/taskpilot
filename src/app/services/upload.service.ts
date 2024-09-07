import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { from } from 'rxjs';
import { switchMap,map,tap,catchError } from 'rxjs/operators';
import { Observable,of,BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service'; // Import AuthService
import { v4 as uuidv4 } from 'uuid';
import { FileUploadNotification } from '../models/file-upload-notification.model';
interface Task {
  id: string;
  title: string;
  assignee: string;
}
@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private storage: AngularFireStorage, private db: AngularFirestore,private firestore:AngularFirestore,private notificationService: NotificationService, private authService: AuthService) {}
  fileDetails: { [taskId: string]: { fileName: string; fileUrl: string } } = {};
  fileDetailsSubject = new BehaviorSubject<{ [taskId: string]: { fileName: string; fileUrl: string } }>(this.fileDetails);
  private notificationSent = new Set<string>();

  

  uploadFile(taskId: string, file: File): Observable<any> {
    const filePath = `uploads/${taskId}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
  
    return task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.firestore.collection('uploads').doc(taskId).set({
            fileUrl: url,
            fileName: file.name
          }, { merge: true }).then(() => {
            this.fileDetails[taskId] = { fileUrl: url, fileName: file.name }; // Update file details locally
            this.fileDetailsSubject.next(this.fileDetails); // Notify observers
  
            // Ensure the notification is sent only once per task
            if (!this.notificationSent.has(taskId)) {
              this.notificationSent.add(taskId); // Mark as sent before calling sendNotification
              this.sendNotification(taskId, file.name).catch(error => {
                console.error('Error sending upload notification:', error);
              });
            }
          });
        });
      })
    );
  }
  
  private sendNotification(taskId: string, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getAdminId().pipe(
        switchMap(adminId =>
          this.getAssigneeName(taskId).pipe(
            switchMap(assigneeName =>
              this.getTaskTitle(taskId).pipe(
                map(taskTitle => ({ adminId, assigneeName, taskTitle }))
              )
            )
          )
        )
      ).subscribe(notificationDetails => {
        const notification: FileUploadNotification = {
          id: uuidv4(),
          fileName: fileName,
          assigneeName: notificationDetails.assigneeName,
          taskTitle: notificationDetails.taskTitle,
          adminId: notificationDetails.adminId || 'Unknown Admin',
          timestamp: new Date(),
          taskId: taskId,
          message: `File ${fileName} uploaded for task ${notificationDetails.taskTitle}`
        };
  
        this.notificationService.addNotification(notification).subscribe(() => {
          console.log('Notification sent successfully');
          resolve();
        }, (error: any) => {
          console.error('Error sending notification: ', error);
          reject(error);
        });
      }, (error: any) => {
        console.error('Error fetching notification details:', error);
        reject(error);
      });
    });
  }

  private getAdminId(): Observable<string> {
    return this.firestore.collection('users', ref => ref.where('role', '==', 'admin')).valueChanges().pipe(
      map((admins: any[]) => {
        const admin = admins[0]; // Assuming there's at least one admin
        return admin ? admin.uid : 'Unknown Admin';
      }),
      catchError(error => {
        console.error('Error fetching admin ID:', error);
        return of('Unknown Admin'); // Fallback to avoid undefined
      })
    );
  }

  private getAssigneeName(taskId: string): Observable<string> {
    return this.firestore.collection('tasks').doc(taskId).valueChanges().pipe(
      map((task) => {
        const t = task as Task; // Explicit type assertion
        return t ? t.assignee : 'Unknown Assignee';
      }),
      catchError(error => {
        console.error('Error fetching assignee name:', error);
        return of('Unknown Assignee'); // Fallback to avoid undefined
      })
    );
  }

  private getTaskTitle(taskId: string): Observable<string> {
    return this.firestore.collection('tasks').doc(taskId).valueChanges().pipe(
      map((task) => {
        const t = task as Task; // Explicit type assertion
        return t ? t.title : 'Unknown Task';
      }),
      catchError(error => {
        console.error('Error fetching task title:', error);
        return of('Unknown Task'); // Fallback to avoid undefined
      })
    );
  }


  getFileDetails(taskId: string): Observable<{ fileUrl: string; fileName: string } | null> {
    if (this.fileDetails[taskId] && this.fileDetails[taskId].fileUrl && this.fileDetails[taskId].fileName) {
      return of(this.fileDetails[taskId]);
    } else {
      return this.db.collection('uploads').doc(taskId).get().pipe(
        map(doc => doc.exists ? doc.data() as { fileUrl: string; fileName: string } : null)
      );
    }
  }

  deleteFile(taskId: string): Observable<void> {
    return new Observable(observer => {
      this.db.collection('uploads').doc(taskId).delete().then(() => {
        delete this.fileDetails[taskId]; // Remove file details locally
        this.fileDetailsSubject.next(this.fileDetails); // Notify observers
        this.notificationSent.delete(taskId); // Reset notification flag for this taskId

        observer.next();
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  getFileDetailsObservable(): Observable<{ [key: string]: { fileUrl: string; fileName: string } }> {
    return this.fileDetailsSubject.asObservable();
  }
}

// import { Injectable } from '@angular/core';
// import { AngularFireStorage } from '@angular/fire/compat/storage';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { finalize } from 'rxjs/operators';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class UploadService {
//   constructor(private storage: AngularFireStorage, private db: AngularFirestore) {}

//   uploadFile(taskId: string, file: File): Observable<any> {
//     const filePath = uploads/${taskId}_${file.name};
//     const fileRef = this.storage.ref(filePath);
//     const task = this.storage.upload(filePath, file);

//     return task.snapshotChanges().pipe(
//       finalize(() => {
//         fileRef.getDownloadURL().subscribe(url => {
//           this.db.collection('uploads').doc(taskId).set({
//             fileUrl: url,
//             fileName: file.name
//           }, { merge: true });
//         });
//       })
//     );
//   }
// }