export interface TaskNotif {
    id: string;
    taskId: string;
    message: string;
    date: Date;
    type: 'admin' | 'employee';
  }
  