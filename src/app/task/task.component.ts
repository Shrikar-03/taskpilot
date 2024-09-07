import { MatDialog } from '@angular/material/dialog'; 
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Component, OnInit,Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map,switchMap } from 'rxjs/operators';
import { Task } from '../task.model.js';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service.js'
import { first } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { v4 as uuidv4 } from 'uuid';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { deadlineBeforeStartDateValidator ,startDateNotInPastValidator} from '../validator.js';
import { EmployeeNotificationService } from '../services/employee-notification.service';

interface AttachmentData {
  filePath: string;
  fileName: string;
  taskId: string;
}
interface AttachmentFile {
  name: string;
  url: string;
}



@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  icons = [
    { symbol: '🏠', label: 'Home', route: '/' },
    { symbol: '📋', label: 'Tasks', route: '/tasks' },
    { symbol: '📊', label: 'Performance', route: '/performance' },
    { symbol: '🔔', label: 'Notifications', route: '/notifications' },
    { symbol: '👤', label: 'Sign-out', route: '/auth' }
  ];
  isModalOpen: boolean = false;
  selectedTaskId: string | null = null;
  taskFiles: { fileName: string, fileUrl: string }[] = [];
  

  


  taskForm: FormGroup;
  tasks$: Observable<Task[]>;
  filteredTasks: Task[] = [];
  allTasks: Task[] = []; // To store all tasks from Firestore
  isTaskFormVisible = false;
  isDeleteModalVisible = false;
  isDarkTheme = false;
  isSidebarCollapsed = false;
  themeIcon = '🌞';
  searchQuery = '';
  searchInProgress = false;
  editTaskId: string | null = null;
  deleteTaskId: string | null = null;
  assignees$: Observable<{ name: string, email: string }[]> = new Observable();
  constructor(private employeeNotificationService: EmployeeNotificationService,private notificationService: NotificationService,private fb: FormBuilder, private router: Router, private taskService: TaskService,private firestore: AngularFirestore,private dialog: MatDialog, private storage: AngularFireStorage) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      assignee: ['Nothing selected',Validators.required],
      priority: ['low', Validators.required],
      startDate: ['', [Validators.required, startDateNotInPastValidator()]],
      deadline: ['', Validators.required]
    }, { validators:deadlineBeforeStartDateValidator() });

    this.tasks$ = this.firestore.collection<Task>('tasks').valueChanges({ idField: 'id' }).pipe(
      map(tasks => {
        // Store all tasks for resetting filteredTasks
        this.allTasks = tasks.map(task => ({
          ...task,
          startDate: task.startDate ? new Date((task.startDate as any).seconds * 1000) : null,
          deadline: task.deadline ? new Date((task.deadline as any).seconds * 1000) : null
        }));
        return this.allTasks;
      })
    );
  }
  

  ngOnInit(): void {
    this.loadTasks();
    this.loadAssignees();
    // this.fetchFileDetails();
  }

  
  loadTasks(): void {
    this.tasks$.subscribe(tasks => {
      this.filteredTasks = tasks; // Initialize filteredTasks with all tasks
      this.applySearchFilter();
      
    });
  }
  loadAssignees(): void {
    this.assignees$ = this.firestore.collection<{ name: string, email: string }>('employees').valueChanges();
  }

  applySearchFilter(): void {
    const lowerCaseQuery = this.searchQuery.toLowerCase().trim();
  
    if (lowerCaseQuery === '') {
      // If searchQuery is empty or only whitespace, show all tasks
      this.filteredTasks = [...this.allTasks];
    } else {
      // Apply search filter based on searchQuery
      this.filteredTasks = this.allTasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseQuery) ||
        (task.assignee && task.assignee.toLowerCase().includes(lowerCaseQuery))
      );
    }
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expanded');
    }
  }
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
  }

  showTaskForm(task?: Task): void {
    if (task) {
      this.editTaskId = task.id;
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        priority: task.priority,
        startDate: task.startDate ? this.formatDate(task.startDate) : null,
        deadline: task.deadline ? this.formatDate(task.deadline) : null
      });
    } else {
      this.editTaskId = null;
      this.taskForm.reset();
    }
    this.isTaskFormVisible = true;
  }
  
  closeTaskForm(): void {
    this.isTaskFormVisible = false;
    this.editTaskId = null;
  }

  saveTask(): void {
    if (this.taskForm.valid) {
      const taskData: Task = {
        ...this.taskForm.value,
        startDate: new Date(this.taskForm.value.startDate),
        deadline: new Date(this.taskForm.value.deadline),
        status: this.getTaskStatus(this.taskForm.value) // Compute status
      };
  
      const assigneeEmail = this.taskForm.value.assignee;
  
      this.assignees$.pipe(
        map(assignees => assignees.find(a => a.email === assigneeEmail)),
        first()
      ).subscribe(assignee => {
        if (assignee) {
          const assigneeName = assignee.name;
  
          if (this.editTaskId) {
            // Update existing task in 'tasks' collection
            taskData.id = this.editTaskId;
            this.taskService.updateTask(taskData)
              .then(() => this.taskService.updateTaskAssignment(taskData.id, assigneeEmail, assigneeName))
              .then(() => {
                this.loadTasks();
                this.employeeNotificationService.createNotifications(); // Create notifications
              })
              .catch(error => console.error('Error updating task and assignment:', error))
              .finally(() => this.closeTaskForm());
          } else {
            // Add new task to 'tasks' collection
            this.taskService.addTask(taskData, assigneeEmail, assigneeName)
              .then(() => {
                this.loadTasks();
                this.employeeNotificationService.createNotifications(); // Create notifications
              })
              .catch(error => console.error('Error adding task:', error))
              .finally(() => this.closeTaskForm());
          }
        } else {
          console.error('Assignee not found for email:', assigneeEmail);
          this.closeTaskForm();
        }
      }, error => {
        console.error('Error fetching assignee:', error);
        this.closeTaskForm(); // Close form even on error
      });
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
  

  editTask(task: Task): void {
    this.showTaskForm(task);
  }

  confirmDelete(taskId: string): void {
    this.isDeleteModalVisible = true;
    this.deleteTaskId = taskId;
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
    this.deleteTaskId = null;
  }

  deleteTask(taskId: string): void {
    if (taskId) {
      this.taskService.deleteTask(taskId).then(() => {
        this.closeDeleteModal();
        this.loadTasks();
      }).catch(error => {
        console.error('Error deleting task and related task assignment:', error);
      });
    }
  }
  
  onSearchInput(): void {
    // Track if the search input is in progress (typing)
    this.searchInProgress = true;
    this.applySearchFilter();
  }

  submitSearch(): void {
    // Track that search is completed (submitting)
    this.searchInProgress = false;
    this.applySearchFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchInProgress = false;
    this.applySearchFilter();
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
    assignTask(task: Task, assigneeEmail: string, assigneeName: string): void {
      this.taskService.assignTask(task, assigneeEmail, assigneeName).then(() => {
        console.log('Task assigned to:', assigneeName);
      }).catch(error => {
        console.error('Error assigning task:', error);
      });
    }
  
  updateTaskAssignment(task: Task, assigneeEmail: string, assigneeName: string): void {
    if (task.id) {
      this.taskService.updateTaskAssignment(task.id, assigneeEmail, assigneeName).then(() => {
        console.log('Task assignment updated for:', assigneeName);
      }).catch(error => {
        console.error('Error updating task assignment:', error);
      });
    }
    
  }
  openAttachmentModal(taskId: string): void {
    this.selectedTaskId = taskId;
    this.taskService.getFilesForTask(taskId).subscribe(files => {
      this.taskFiles = files;
      this.isModalOpen = true;
    });
  }
  openNotifications(): void {
    this.router.navigate(['/notifications']);
  
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.taskFiles = [];
    this.selectedTaskId = null;
   }
  // markAsDone(task: Task) {
  //   task.status = 'completed';
  //   this.notificationService.addNotification({
  //     id: this.generateUniqueId(),
  //     taskId: task.id,
  //     message: `Task ${task.title} marked as done.`,
  //     date: new Date(),
  //     type: 'admin'
  //   });
  // }

  // markAsInProgress(task: Task) {
  //   task.status = 'in-progress';
  //   this.notificationService.addNotification({
  //     id: this.generateUniqueId(),
  //     taskId: task.id,
  //     message: `Task ${task.title} is back in progress.`,
  //     date: new Date(),
  //     type: 'admin'
  //   });
  // }

  // private generateUniqueId(): string {
  //   return Math.random().toString(36).substr(2, 9);
  // }


}
  








