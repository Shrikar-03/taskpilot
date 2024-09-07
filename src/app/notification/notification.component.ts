import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
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
  notifications: any[] = [];

  constructor(private notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    // Load cached notifications first
    this.notifications = this.notificationService.getCachedNotifications();
  
    // Fetch notifications from Firestore and update the view
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(fetchedNotifications => {
      this.notifications = fetchedNotifications.slice(0, 10); // Limit to 10 notifications
    });
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications().subscribe(() => {
      this.notifications = [];
      console.log('Notifications cleared');
      // Refresh notifications after clearing
      this.loadNotifications();
    });
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
