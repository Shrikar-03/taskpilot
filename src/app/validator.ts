import { AbstractControl, ValidatorFn } from '@angular/forms';

// Custom validator function
export function deadlineBeforeStartDateValidator(): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: any } | null => {
    const startDateControl = formGroup.get('startDate');
    const deadlineControl = formGroup.get('deadline');

    if (startDateControl && deadlineControl) {
      const startDate = new Date(startDateControl.value);
      const deadline = new Date(deadlineControl.value);

      if (startDate && deadline && startDate > deadline) {
        return { 'deadlineBeforeStartDate': true };
      }
    }
    return null;
  };
  
}
// Validator for start date cannot be in the past
export function startDateNotInPastValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const startDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Strip time component
  
      return startDate && startDate < today ? { 'startDateInPast': true } : null;
    };
  }