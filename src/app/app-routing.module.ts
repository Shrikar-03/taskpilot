import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { LandingComponent } from './landing/landing.component';
import { TaskComponent } from './task/task.component';
import { EmployeeComponent } from './employee/employee.component';
import { NotificationComponent } from './notification/notification.component'
import { AuthGuard } from './auth.guard'; // Import AuthGuard
import { EmployeeNotificationComponent } from './employee-notification/employee-notification.component';
const routes: Routes = [
  { path: '', component: LandingComponent, data: { animation: 'LandingPage' } },
  { path: 'auth', component: AuthComponent, data: { animation: 'AuthPage' } },
  { path: 'task', component: TaskComponent, data: { animation: 'TaskPage' } },
  { path: 'employee', component: EmployeeComponent, data: { animation: 'EmployeePage' } },
  { path: 'notifications', component: NotificationComponent, canActivate: [AuthGuard], data: { animation: 'NotificationPage' } },
  { path: 'employee-notification', component: EmployeeNotificationComponent, canActivate: [AuthGuard], data: { animation: 'EmployeeNotificationPage' } },
  { path: 'home', component: LandingComponent, data: { animation: 'LandingPage' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
