// Assuming Task interface or class is defined in employee.component.ts or a separate model file

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: string;
    startDate: Date|null;
    deadline: Date|null;
    status: string;
    completed: boolean; // Add completed property if it's missing
  }
  
  
  export interface Employee {
    id: string;
    name: string;
    email: string;
  }
  