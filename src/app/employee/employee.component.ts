import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map,switchMap } from 'rxjs/operators';
import { Task } from '../models/employee.model';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { EmployeeService } from '../services/employee.service';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../upload/upload.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { DialogData } from '../dialog-data.model';
import { TaskNotif } from '../task-notif.model';
import { UploadService } from '../services/upload.service';
@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  icons = [
    { symbol: '🏠', label: 'Home', route: '/' },
    { symbol: '📋', label: 'Tasks', route: '/tasks' },
    { symbol: '📊', label: 'Performance', route: '/performance' },
    { symbol: '🔔', label: 'Employee Notifications', route: '/employee-notification' },
    { symbol: '👤', label: 'Sign-out', route: '/auth' }
  ];
  
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchQuery = '';
  searchInProgress = false;
  isDarkTheme = false;
  themeIcon = '🌞';
  isSidebarCollapsed = false;
  isMarkAsDoneModalVisible = false;
  taskToComplete: Task | null = null;
  tasks$: Observable<Task[]>;
  isConfirmationModalVisible = false;
  actionToConfirm: (() => void) | undefined;
 notifications: any[] = [];


  fileDetails: { [taskId: string]: { fileName: string, fileUrl: string } | null } = {};

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private employeeService: EmployeeService,
    private firestore: AngularFirestore,
    public dialog: MatDialog,
    private uploadService: UploadService
  ) {
    this.tasks$ = this.firestore.collection<Task>('tasks').valueChanges({ idField: 'id' }).pipe(
      map(tasks => {
        this.tasks = tasks.map(task => ({
          ...task,
          startDate: task.startDate ? new Date((task.startDate as any).seconds * 1000) : null,
          deadline: task.deadline ? new Date((task.deadline as any).seconds * 1000) : null
        }));
        return this.tasks;
      })
    );
  }

  ngOnInit(): void {
    this.loadTasks();

    this.uploadService.getFileDetailsObservable().subscribe(details => {
      this.fileDetails = details;
    });
  }
  

  loadTasks(): void {
    this.employeeService.getTasksForEmployee().subscribe(
      tasks => {
        this.tasks = tasks.map(task => ({
          ...task,
          startDate: task.startDate ? (task.startDate as any).toDate() : null,
          deadline: task.deadline ? (task.deadline as any).toDate() : null
        }));
        this.applySearchFilter();
        this.loadFileDetails(); // Apply the filter initially
      },
      error => {
        console.error('Error fetching tasks: ', error);
      }
    );
  }

  applySearchFilter(): void {
    const lowerCaseQuery = this.searchQuery.toLowerCase().trim();
    if (lowerCaseQuery === '') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseQuery) ||
        (task.assignee && task.assignee.toLowerCase().includes(lowerCaseQuery))
      );
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
  }

  onSearchInput(): void {
    this.searchInProgress = true;
    this.applySearchFilter();
  }

  submitSearch(): void {
    this.searchInProgress = false;
    this.applySearchFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchInProgress = false;
    this.applySearchFilter();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  confirmMarkAsDone(task: Task): void {
    this.taskToComplete = { ...task };
    this.isMarkAsDoneModalVisible = true;
  }

  toggleMarkAsDone(task: Task): void {
    if (!task) {
      console.error('No task to update.');
      return;
    }

    this.isMarkAsDoneModalVisible = false;

    console.log('Updating status for task:', task);
    const newStatus = task.status === 'completed' ? this.getOriginalStatus(task) : 'completed';
    console.log('New task status:', newStatus);

    this.employeeService.updateTaskStatus(task.id, newStatus).then(() => {
      console.log('Task status updated in database');
      this.loadTasks(); // Reload tasks to reflect the status change
    }).catch(error => {
      console.error('Error updating task status:', error);
    });
  }

  getOriginalStatus(task: Task): string {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadline && today > deadline) {
      return 'past deadline';
    } else if (startDate && today >= startDate) {
      return 'in progress';
    } else {
      return 'not started';
    }
  }

  closeMarkAsDoneModal(): void {
    this.isMarkAsDoneModalVisible = false;
    this.taskToComplete = null;
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expanded');
    }
  }

  getTaskStatus(task: Task): string {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const deadline = task.deadline ? new Date(task.deadline) : null;
  
    if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Strip time component
    }
    if (deadline) {
      deadline.setHours(0, 0, 0, 0); // Strip time component
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time component
  
    console.log(`Computing status for task: ${task.title}`);
    console.log(`Start Date: ${startDate}, Deadline: ${deadline}, Today: ${today}`);
  
    if (task.status === 'completed') {
      return 'Completed';
    } else if (deadline && today > deadline) {
      return 'Past deadline';
    } else if (startDate && today >= startDate) {
      return 'In progress';
    } else {
      return 'Not started';
    }
  }
  loadNotifications() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      // After rendering, remove notifications from Firestore
      notifications.forEach(notification => {
        this.notificationService.removeNotification(notification.id).subscribe();
      });
    });
  }



  loadFileDetails() {
    this.tasks.forEach(task => {
      this.uploadService.getFileDetails(task.id).subscribe(details => {
        if (details) {
          this.fileDetails[task.id] = details;
        } else {
          this.fileDetails[task.id] = null;
        }
      });
    });
  }

  openFileUpload(taskId: string) {
    const dialogRef = this.dialog.open(UploadComponent, {
      width: '400px',
      data: { taskId: taskId, isDarkTheme: this.isDarkTheme } // Pass isDarkTheme to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'uploaded') {
        this.uploadService.getFileDetails(taskId).subscribe(details => {
          if (details) {
            this.fileDetails[taskId] = details;
          } else {
            this.fileDetails[taskId] = null;
          }
        });
      }
    });
  }

  confirmDeleteFile(taskId: string) {
    this.openConfirmationModal(() => this.deleteFile(taskId));
  }

  deleteFile(taskId: string) {
    this.uploadService.deleteFile(taskId).subscribe(() => {
      this.fileDetails[taskId] = null;
      console.log('File deleted successfully');

      this.notificationService.deleteNotificationForTask(taskId).subscribe(() => {
        console.log('Notifications cleared for task:', taskId);
      }, error => {
        console.error('Error clearing notifications: ', error);
      });
    }, error => {
      console.error('Error deleting file: ', error);
    });
  }

 
  openConfirmationModal(action: () => void) {
    this.actionToConfirm = action;
    this.isConfirmationModalVisible = true;
  }

  closeConfirmationModal() {
    this.isConfirmationModalVisible = false;
  }

  confirmAction() {
    if (this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.closeConfirmationModal();
  }
}
//   deleteFile(taskId: string): void {
//     console.log('delete called');
//     delete this.fileDetails[taskId]; // Remove file details for the task
//   }
// }
















// import { Component, OnInit } from '@angular/core';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { Task } from '../employee.model';
// import { Router } from '@angular/router';
// import { EmployeeService } from '../employee.service';
// import { AuthService } from '../auth.service';
// import { MatDialog } from '@angular/material/dialog';
// import { UploadComponent } from '../upload/upload.component';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { DialogData } from '../dialog-data.model';

// import { v4 as uuidv4 } from 'uuid';

// @Component({
//   selector: 'app-employee',
//   templateUrl: './employee.component.html',
//   styleUrls: ['./employee.component.css']
// })
// export class EmployeeComponent implements OnInit {
//   icons = [
//     { symbol: '🏠', label: 'Home', route: '/home' },
//     { symbol: '📋', label: 'Tasks', route: '/tasks' },
//     { symbol: '📊', label: 'Performance', route: '/performance' },
//     { symbol: '🔔', label: 'Notifications', route: '/notifications' },
//     { symbol: '👤', label: 'Profile', route: '/profile' }
//   ];
//   tasks: Task[] = [];
//   filteredTasks: Task[] = [];
//   searchQuery = '';
//   searchInProgress = false;
//   isDarkTheme = false;
//   themeIcon = '🌞';
//   isSidebarCollapsed = false;
//   isMarkAsDoneModalVisible = false;
//   taskToComplete: Task | null = null;
//   tasks$: Observable<Task[]>;

//   constructor(
//     private router: Router,
//     private employeeService: EmployeeService,
//     private firestore: AngularFirestore,
//     public dialog: MatDialog,
//     private notificationService: NotificationService
//   ) {
//     this.tasks$ = this.firestore.collection<Task>('tasks').valueChanges({ idField: 'id' }).pipe(
//       map(tasks => {
//         this.tasks = tasks.map(task => ({
//           ...task,
//           startDate: task.startDate ? new Date((task.startDate as any).seconds * 1000) : null,
//           deadline: task.deadline ? new Date((task.deadline as any).seconds * 1000) : null
//         }));
//         return this.tasks;
//       })
//     );
//   }

//   ngOnInit(): void {
//     this.loadTasks();
//   }

//   loadTasks(): void {
//     this.employeeService.getTasksForEmployee().subscribe(
//       tasks => {
//         this.tasks = tasks.map(task => ({
//           ...task,
//           startDate: task.startDate ? (task.startDate as any).toDate() : null,
//           deadline: task.deadline ? (task.deadline as any).toDate() : null
//         }));
//         this.applySearchFilter(); // Apply the filter initially
//       },
//       error => {
//         console.error('Error fetching tasks: ', error);
//       }
//     );
//   }

//   applySearchFilter(): void {
//     const lowerCaseQuery = this.searchQuery.toLowerCase().trim();
//     if (lowerCaseQuery === '') {
//       this.filteredTasks = [...this.tasks];
//     } else {
//       this.filteredTasks = this.tasks.filter(task =>
//         task.title.toLowerCase().includes(lowerCaseQuery) ||
//         (task.assignee && task.assignee.toLowerCase().includes(lowerCaseQuery))
//       );
//     }
//   }

//   toggleTheme(): void {
//     this.isDarkTheme = !this.isDarkTheme;
//     this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
//   }

//   onSearchInput(): void {
//     this.searchInProgress = true;
//     this.applySearchFilter();
//   }

//   submitSearch(): void {
//     this.searchInProgress = false;
//     this.applySearchFilter();
//   }

//   clearSearch(): void {
//     this.searchQuery = '';
//     this.searchInProgress = false;
//     this.applySearchFilter();
//   }

//   navigate(route: string): void {
//     this.router.navigate([route]);
//   }

//   confirmMarkAsDone(task: Task): void {
//     this.taskToComplete = { ...task };
//     this.isMarkAsDoneModalVisible = true;
//   }

//   toggleMarkAsDone(task: Task): void {
//     if (!task) {
//       console.error('No task to update.');
//       return;
//     }

//     this.isMarkAsDoneModalVisible = false;

//     const newStatus = task.status === 'completed' ? this.getOriginalStatus(task) : 'completed';
//     this.employeeService.updateTaskStatus(task.id, newStatus).then(() => {
//       this.loadTasks(); // Reload tasks to reflect the status change

//       // Add notifications
//       if (newStatus === 'completed') {
//         this.notificationService.addNotification({
//           id: uuidv4(),
//           taskId: task.id,
//           assignee: task.assignee,
//           message: `Task completed: ${task.title}`,
//           date: new Date(),
//           read: false,
//           type: 'taskCompleted'
//         });
//       } else {
//         this.notificationService.addNotification({
//           id: uuidv4(),
//           taskId: task.id,
//           assignee: task.assignee,
//           message: `Task is back in progress: ${task.title}`,
//           date: new Date(),
//           read: false,
//           type: 'taskInProgress'
//         });
//       }
//     }).catch(error => {
//       console.error('Error updating task status:', error);
//     });
//   }

//   getOriginalStatus(task: Task): string {
//     const startDate = task.startDate ? new Date(task.startDate) : null;
//     const deadline = task.deadline ? new Date(task.deadline) : null;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (deadline && today > deadline) {
//       return 'past deadline';
//     } else if (startDate && today >= startDate) {
//       return 'in progress';
//     } else {
//       return 'not started';
//     }
//   }

//   closeMarkAsDoneModal(): void {
//     this.isMarkAsDoneModalVisible = false;
//     this.taskToComplete = null;
//   }

//   toggleSidebar(): void {
//     const sidebar = document.querySelector('.sidebar');
//     if (sidebar) {
//       sidebar.classList.toggle('expanded');
//     }
//   }

//   getTaskStatus(task: Task): string {
//     const startDate = task.startDate ? new Date(task.startDate) : null;
//     const deadline = task.deadline ? new Date(task.deadline) : null;

//     if (startDate) {
//       startDate.setHours(0, 0, 0, 0); // Strip time component
//     }
//     if (deadline) {
//       deadline.setHours(0, 0, 0, 0); // Strip time component
//     }

//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Strip time component

//     if (task.status === 'completed') {
//       return 'Completed';
//     } else if (deadline && today > deadline) {
//       return 'Past deadline';
//     } else if (startDate && today >= startDate) {
//       return 'In progress';
//     } else {
//       return 'Not started';
//     }
//   }

//   openFileUpload(taskId: string): void {
//     this.dialog.open(UploadComponent, {
//       width: '600px',
//       data: { 
//         taskId: taskId,
//         isDarkTheme: this.isDarkTheme
//       } as DialogData // Cast data to DialogData type
//     });
//   }
// }
