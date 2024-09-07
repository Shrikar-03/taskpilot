import { Component, OnInit } from '@angular/core';
import { slideInAnimation } from './animation';
import { RouterOutlet } from '@angular/router';
import { DailyCheckService } from './services/daily-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [slideInAnimation]
})

export class AppComponent implements OnInit {
  constructor(private dailyCheckService: DailyCheckService) {}
  title = 'task_pilot';
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
  ngOnInit(): void {
      
  }
}


