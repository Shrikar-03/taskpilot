// import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
// import { Observable, of } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';
// import { Task } from './employee.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class EmployeeService {
//   constructor(private firestore: AngularFirestore) {}

//   getAssignedTasks(employeeEmail: string): Observable<Task[]> {
//     return this.firestore.collection('taskAssignments', ref => ref.where('email', '==', employeeEmail))
//       .snapshotChanges()
//       .pipe(
//         map(actions => actions.map(a => {
//           const data = a.payload.doc.data() as { taskId: string };
//           return data.taskId;
//         })),
//         switchMap(taskIds => {
//           if (taskIds.length === 0) {
//             return of([]);
//           }
//           return this.firestore.collection<Task>('tasks', ref => ref.where('__name__', 'in', taskIds)).valueChanges({ idField: 'id' });
//         })
//       );
//   }

//   updateTaskStatus(taskId: string, status: string): Promise<void> {
//     return this.firestore.collection('tasks').doc(taskId).update({ status });
//   }
// }






import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/employee.model.js';
import { of

 } from 'rxjs';
 import { AuthService } from './auth.service.js';
import { map,switchMap } from 'rxjs';
interface Employee {
  id: string;
  name: string;
  email: string;
}

interface TaskAssignment {
  taskId: string;
  
  assigneeEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private tasksCollection: AngularFirestoreCollection<Task>;
  private employeesCollection: AngularFirestoreCollection<Employee>;
  private taskAssignmentsCollection: AngularFirestoreCollection<TaskAssignment>;

  constructor(private authService: AuthService,private firestore: AngularFirestore) {
    this.tasksCollection = this.firestore.collection<Task>('tasks');
    this.employeesCollection = this.firestore.collection<Employee>('employees');
    this.taskAssignmentsCollection = this.firestore.collection<TaskAssignment>('taskAssignments');
    this.createTaskAssignmentsCollectionIfNotExist();
  }

  private async createTaskAssignmentsCollectionIfNotExist(): Promise<void> {
    try {
      const snapshot = await this.firestore.collection('taskAssignments').get().toPromise();
      if (snapshot && snapshot.empty) {
        await this.firestore.collection('taskAssignments').doc('init').set({}); // Create a dummy document to initialize
        console.log('taskAssignments collection created successfully.');
      } else {
        console.log('taskAssignments collection already exists.');
      }
    } catch (error) {
      console.error('Error checking taskAssignments collection:', error);
    }
  }

  getTasks(): Observable<Task[]> {
    return this.tasksCollection.valueChanges({ idField: 'id' });
  }

  getEmployees(): Observable<Employee[]> {
    return this.employeesCollection.valueChanges({ idField: 'id' });
  }


  addTask(task: Task, assigneeEmail: string, assigneeName: string): Promise<DocumentReference<Task>> {
    if (!assigneeEmail || !assigneeName) {
      return Promise.reject(new Error('Invalid assignee data.'));
    }
  
    const taskData: Task = {
      ...task,
      startDate: task.startDate ? new Date(task.startDate) : null,
      deadline: task.deadline ? new Date(task.deadline) : null,
      status: this.getTaskStatus(task) // Compute and add status
    };
  
    return this.tasksCollection.add(taskData).then(async docRef => {
      const assignment: TaskAssignment = {
        taskId: docRef.id,
        assigneeEmail: assigneeEmail
      };
  
      await this.taskAssignmentsCollection.doc(docRef.id).set(assignment);
  
      return docRef;
    }).catch(error => {
      console.error('Error adding task:', error);
      throw error;
    });
  }
  
  getTaskStatus(task: Task): string {
    const startDate = task.startDate ? new Date(task.startDate) : null;
    const deadline = task.deadline ? new Date(task.deadline) : null;
  
    if (startDate) {
      startDate.setHours(0, 0, 0, 0); // Strip time component
    }
    if (deadline) {
      deadline.setHours(0, 0, 0, 0); // Strip time component
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time component
  
    console.log(`Computing status for task: ${task.title}`);
    console.log(`Start Date: ${startDate}, Deadline: ${deadline}, Today: ${today}`);
  
    if (task.status === 'completed') {
      return 'Completed';
    } else if (deadline && today > deadline) {
      return 'Past deadline';
    } else if (startDate && today >= startDate) {
      return 'In progress';
    } else {
      return 'Not started';
    }
  }
  updateTask(task: Task): Promise<void> {
    const taskId = task.id;
    if (!taskId) {
      throw new Error('Task ID is required.');
    }
    const taskData: Task = {
      ...task,
      status: this.getTaskStatus(task) // Compute and update status
    };
    const taskDoc = this.tasksCollection.doc(taskId);
    return taskDoc.update(taskData).catch(error => {
      console.error('Error updating task:', error);
      throw error;
    });
  }
  
  deleteTask(taskId: string): Promise<void> {
    return this.firestore.firestore.runTransaction(async transaction => {
      const taskRef = this.firestore.collection('tasks').doc(taskId).ref;
      const taskAssignmentRef = this.firestore.collection('taskAssignments').doc(taskId).ref;
  
      // Perform all reads first
      const taskDoc = await transaction.get(taskRef);
      const taskAssignmentDoc = await transaction.get(taskAssignmentRef);
  
      // Perform all writes after reads
      if (taskDoc.exists) {
        transaction.delete(taskRef);
      }
  
      if (taskAssignmentDoc.exists) {
        transaction.delete(taskAssignmentRef);
      }
    }).then(() => {
      console.log('Task and related task assignment successfully deleted');
    }).catch(error => {
      console.error('Error deleting task and related task assignment: ', error);
    });
  }
  
  
  searchTasks(query: string): Observable<Task[]> {
    query = query.toLowerCase().trim();
    console.log('Searching tasks with query:', query);
    return this.firestore.collection<Task>('tasks', ref =>
      ref.where('title', '>=', query).where('title', '<=', query + '\uf8ff')
    ).valueChanges({ idField: 'id' });
  }

  filterTasksByStatus(status: string): Observable<Task[]> {
    console.log('Filtering tasks with status:', status);
    return this.firestore.collection<Task>('tasks', ref =>
      ref.where('status', '==', status)
    ).valueChanges({ idField: 'id' });
  }

  getTaskById(taskId: string): Observable<Task | undefined> {
    const taskDoc = this.tasksCollection.doc<Task>(taskId);
    console.log('Getting task by ID:', taskId);
    return taskDoc.valueChanges();
  }



  
  updateTaskAssignment(taskId: string, assigneeEmail: string, assigneeName: string): Promise<void> {
    console.log('Updating task assignment:', taskId, 'to', assigneeName, assigneeEmail);
    const taskAssignment = {
      assigneeEmail: assigneeEmail,
      assigneeName: assigneeName
    };
    return this.firestore.collection('taskAssignments').doc(taskId).update(taskAssignment);
  }
  
  
  deleteTaskAndAssignment(taskId: string): Promise<void> {
    const taskDoc = this.tasksCollection.doc(taskId);
    const assignmentDoc = this.taskAssignmentsCollection.doc(taskId);
  
    return this.firestore.firestore.runTransaction(async transaction => {
      const taskSnapshot = await transaction.get(taskDoc.ref);
      if (!taskSnapshot.exists) {
        throw new Error('Task does not exist.');
      }
  
      transaction.delete(taskDoc.ref);
  
      const assignmentSnapshot = await transaction.get(assignmentDoc.ref);
      if (assignmentSnapshot.exists) {
        transaction.delete(assignmentDoc.ref);
      }
    }).catch(error => {
      console.error('Error deleting task and assignment:', error);
      throw error;
    });
    

  }
  
  
  
  assignTask(task: Task, assigneeEmail: string, assigneeName: string): Promise<void> {
    // Assuming you want to store task assignment details in the 'taskAssignments' collection
    return this.firestore.collection('taskAssignments').doc(task.id).set({
      taskId: task.id,
      assigneeEmail: assigneeEmail,
      assigneeName: assigneeName,
       // Assuming you want to store the task title as well
      // Add any other properties you need to store for task assignments
    })
    .then(() => {
      console.log('Task assigned successfully to:', assigneeName);
    })
    .catch(error => {
      console.error('Error assigning task:', error);
      throw error; // Optionally re-throw the error to handle it elsewhere
    });
  }
  
  getAssignedTasks(employeeEmail: string): Observable<Task[]> {
    return this.firestore.collection('taskAssignments', ref => ref.where('email', '==', employeeEmail))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as { taskId: string };
          return data.taskId;
        })),
        switchMap(taskIds => {
          if (taskIds.length === 0) {
            return of([]);
          }
          return this.firestore.collection<Task>('tasks', ref => ref.where('__name__', 'in', taskIds)).valueChanges({ idField: 'id' });
        })
      );
  }

  getTasksForEmployee(): Observable<Task[]> {
    return this.authService.getUserEmail().pipe(
      switchMap(userEmail => {
        return this.firestore.collection<Task>('tasks', ref => ref.where('assignee', '==', userEmail)).valueChanges({ idField: 'id' });
      })
    );
  }
  updateTaskStatus(taskId: string, status: string): Promise<void> {
    if (!taskId) {
      return Promise.reject(new Error('Invalid task ID'));
    }
    console.log('Updating task status for task ID:', taskId, 'to:', status);
    return this.tasksCollection.doc(taskId).update({ status }).catch(error => {
      console.error('Error updating task status:', error);
      throw error;
    });
  }
}
  
