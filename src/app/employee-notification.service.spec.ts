import { TestBed } from '@angular/core/testing';

import { EmployeeNotificationService } from './employee-notification.service';

describe('EmployeeNotificationService', () => {
  let service: EmployeeNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
