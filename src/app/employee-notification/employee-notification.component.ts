// import { Component, OnInit } from '@angular/core';
// import { EmployeeNotificationService } from '../services/employee-notification.service';
// import { Notification } from '../models/notifiction.model';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-employee-notification',
//   templateUrl: './employee-notification.component.html',
//   styleUrls: ['./employee-notification.component.css']
// })
// export class EmployeeNotificationComponent implements OnInit {
//   notifications: Notification[] = [];
  // icons = [
  //   { symbol: '🏠', label: 'Home', route: '/' },
  //   { symbol: '📋', label: 'Tasks', route: '/task' },
  //   { symbol: '📊', label: 'Performance', route: '/performance' },
  //   { symbol: '🔔', label: 'Notifications', route: '/notifications' },
  //   { symbol: '👤', label: 'Sign-out', route: '/auth' }
  // ];
  // isDarkTheme = false;
  // themeIcon = '🌞';
  // isSidebarCollapsed = false;


//   constructor(private employeeNotificationService: EmployeeNotificationService,private router:Router) {}

//   ngOnInit(): void {
//     console.log('EmployeeNotificationComponent initialized');
//     this.loadNotifications();
//   }

//   loadNotifications(): void {
//     console.log('Loading notifications...');
//     this.employeeNotificationService.getNotificationsForEmployee().subscribe(notifications => {
//       console.log('Notifications received:', notifications);
//       this.notifications = notifications;
//     }, error => {
//       console.error('Error loading notifications:', error);
//     });
//   }
//   toggleTheme(): void {
//     this.isDarkTheme = !this.isDarkTheme;
//     this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
//   }

//   navigate(route: string): void {
//     this.router.navigate([route]);
//   }

//   toggleSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     if (sidebar) {
//       sidebar.classList.toggle('expanded');
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { EmployeeNotificationService } from '../services/employee-notification.service';
import { Notification } from '../models/notifiction.model';
import { Timestamp } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-notification',
  templateUrl: './employee-notification.component.html',
  styleUrls: ['./employee-notification.component.css']
})
export class EmployeeNotificationComponent implements OnInit {
  notifications: Notification[] = [];
  icons = [
    { symbol: '🏠', label: 'Home', route: '/' },
    { symbol: '📋', label: 'Tasks', route: '/task' },
    { symbol: '📊', label: 'Performance', route: '/performance' },
    { symbol: '🔔', label: 'Notifications', route: '/notifications' },
    { symbol: '👤', label: 'Sign-out', route: '/auth' }
  ];
  isDarkTheme = false;
  themeIcon = '🌞';
  isSidebarCollapsed = false;

  constructor(private notificationService: EmployeeNotificationService,private router:Router) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    console.log('Loading notifications...');
    this.notificationService.getNotificationsForEmployee().subscribe(
      notifications => {
        console.log('Notifications received:', notifications);
        this.notifications = this.removeDuplicateNotifications(notifications);
        this.convertTimestamps(); // Convert timestamps to dates
      },
      error => console.error('Error loading notifications:', error)
    );
  }

  convertTimestamps(): void {
    this.notifications = this.notifications.map(notification => {
      if (notification.deadline instanceof Timestamp) {
        notification.deadline = notification.deadline.toDate();
      }
      return notification;
    });
  }

  removeDuplicateNotifications(notifications: Notification[]): Notification[] {
    const seen = new Set();
    return notifications.filter(notification => {
      const dateKey = this.formatDate(notification.deadline);
      if (!seen.has(dateKey)) {
        seen.add(dateKey);
        return true;
      }
      return false;
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  }
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeIcon = this.isDarkTheme ? '🌜' : '🌞';
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expanded');
    }
  }
}

