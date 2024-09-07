// task.model.ts
export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    priority: string;
    startDate: Date | null;
    deadline: Date | null;
    status: string | null;
}
