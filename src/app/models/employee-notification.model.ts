export interface Task {
  title: string;
  deadline: Date;
  priority: string;
  assignee: string; // Assuming this is an email or user ID
}
