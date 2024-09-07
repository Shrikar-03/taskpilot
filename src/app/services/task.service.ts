// import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { Task } from './task.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class TaskService {
//   private tasksCollection: AngularFirestoreCollection<Task>;

//   constructor(private firestore: AngularFirestore) {
//     this.tasksCollection = this.firestore.collection<Task>('tasks');
//   }

//   // Method to get all tasks
//   getTasks(): Observable<Task[]> {
//     return this.tasksCollection.valueChanges({ idField: 'id' });
//   }

//   // Method to add a task
//   addTask(task: Task): Promise<DocumentReference<Task>> {
//     return this.tasksCollection.add(task);
//   }

//   // Method to update a task
//   updateTask(task: Task): Promise<void> {
//     const taskId = task.id;
//     if (!taskId) {
//       throw new Error('Task ID is required.');
//     }
//     const { id, ...taskWithoutId } = task;
//     const taskDoc = this.tasksCollection.doc(taskId);
//     return taskDoc.update(taskWithoutId);
//   }

//   // Method to delete a task
//   deleteTask(taskId: string): Promise<void> {
//     const taskDoc = this.tasksCollection.doc(taskId);
//     return taskDoc.delete();
//   }

//   // Method to search tasks based on query string
//   searchTasks(query: string): Observable<Task[]> {
//     query = query.toLowerCase().trim();
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('title', '>=', query).where('title', '<=', query + '\uf8ff')
//     ).valueChanges({ idField: 'id' });
//   }

//   // Method to filter tasks by status
//   filterTasksByStatus(status: string): Observable<Task[]> {
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('status', '==', status)
//     ).valueChanges({ idField: 'id' });
//   }

//   // Method to get a single task by ID
//   getTaskById(taskId: string): Observable<Task | undefined> {
//     const taskDoc = this.tasksCollection.doc<Task>(taskId);
//     return taskDoc.valueChanges();
//   }
// }















// import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { Task } from './task.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class TaskService {
//   private tasksCollection: AngularFirestoreCollection<Task>;

//   constructor(private firestore: AngularFirestore) {
//     this.tasksCollection = this.firestore.collection<Task>('tasks');
//   }

//   // Method to get all tasks
//   getTasks(): Observable<Task[]> {
//     return this.tasksCollection.valueChanges({ idField: 'id' });
//   }

//   // Method to add a task
//   addTask(task: Task): Promise<DocumentReference<Task>> {
//     return this.tasksCollection.add(task);
//   }

//   // Method to update a task
//   updateTask(task: Task): Promise<void> {
//     const taskId = task.id;
//     if (!taskId) {
//       throw new Error('Task ID is required.');
//     }
//     const { id, ...taskWithoutId } = task;
//     const taskDoc = this.tasksCollection.doc(taskId);
//     return taskDoc.update(taskWithoutId);
//   }

//   // Method to delete a task
//   deleteTask(taskId: string): Promise<void> {
//     const taskDoc = this.tasksCollection.doc(taskId);
//     return taskDoc.delete();
//   }

//   // Method to search tasks based on query string
//   searchTasks(query: string): Observable<Task[]> {
//     query = query.toLowerCase().trim();
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('title', '>=', query).where('title', '<=', query + '\uf8ff')
//     ).valueChanges({ idField: 'id' });
//   }

//   // Method to filter tasks by status
//   filterTasksByStatus(status: string): Observable<Task[]> {
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('status', '==', status)
//     ).valueChanges({ idField: 'id' });
//   }

//   // Method to get a single task by ID
//   getTaskById(taskId: string): Observable<Task | undefined> {
//     const taskDoc = this.tasksCollection.doc<Task>(taskId);
//     return taskDoc.valueChanges();
//   }
//   getEmployees(): Observable<any[]> {
//     return this.firestore.collection('employees').valueChanges();
//   }
// }





// import { Injectable } from '@angular/core';
// import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
// import { Observable } from 'rxjs';
// import { Task } from './task.model';

// interface Employee {
//   id: string;
//   name: string;
//   email: string;
// }

// interface TaskAssignment {
//   taskId: string;
//   employeeName: string;
//   assigneeEmail: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class TaskService {
//   private tasksCollection: AngularFirestoreCollection<Task>;
//   private employeesCollection: AngularFirestoreCollection<Employee>;
//   private taskAssignmentsCollection: AngularFirestoreCollection<TaskAssignment>;

//   constructor(private firestore: AngularFirestore) {
//     this.tasksCollection = this.firestore.collection<Task>('tasks');
//     this.employeesCollection = this.firestore.collection<Employee>('employees');
//     this.taskAssignmentsCollection = this.firestore.collection<TaskAssignment>('taskAssignments');
//     this.createTaskAssignmentsCollectionIfNotExist();
//   }

//   private async createTaskAssignmentsCollectionIfNotExist(): Promise<void> {
//     try {
//       const snapshot = await this.firestore.collection('taskAssignments').get().toPromise();
//       if (snapshot && snapshot.empty) {
//         await this.firestore.collection('taskAssignments').doc('init').set({}); // Create a dummy document to initialize
//         console.log('taskAssignments collection created successfully.');
//       } else {
//         console.log('taskAssignments collection already exists.');
//       }
//     } catch (error) {
//       console.error('Error checking taskAssignments collection:', error);
//     }
//   }

//   getTasks(): Observable<Task[]> {
//     return this.tasksCollection.valueChanges({ idField: 'id' });
//   }

//   getEmployees(): Observable<Employee[]> {
//     return this.employeesCollection.valueChanges({ idField: 'id' });
//   }

//   addTask(task: Task, assigneeEmail: string, assigneeName: string): Promise<DocumentReference<Task>> {
//     if (!assigneeEmail || !assigneeName) {
//       return Promise.reject(new Error('Invalid assignee data.'));
//     }

//     const taskData: Task = {
//       ...task,
//       startDate: task.startDate ? new Date(task.startDate) : null,
//       deadline: task.deadline ? new Date(task.deadline) : null
//     };

//     console.log('Adding task:', taskData);
//     console.log('Assignee email:', assigneeEmail);
//     console.log('Assignee name:', assigneeName);

//     return this.tasksCollection.add(taskData).then(async docRef => {
//       const assignment: TaskAssignment = {
//         taskId: docRef.id,
//         employeeName: assigneeName,
//         assigneeEmail: assigneeEmail
//       };

//       console.log('Task assignment data before setting:', assignment);

//       await this.taskAssignmentsCollection.doc(docRef.id).set(assignment);
//       console.log('Task assigned successfully.');

//       return docRef;
//     }).catch(error => {
//       console.error('Error adding task:', error);
//       throw error;
//     });
//   }

//   updateTask(task: Task): Promise<void> {
//     const taskId = task.id;
//     if (!taskId) {
//       throw new Error('Task ID is required.');
//     }
//     const { id, ...taskWithoutId } = task;
//     const taskDoc = this.tasksCollection.doc(taskId);
//     console.log('Updating task with ID:', taskId, 'with data:', taskWithoutId);
//     return taskDoc.update(taskWithoutId).catch(error => {
//       console.error('Error updating task:', error);
//       throw error;
//     });
//   }

//   deleteTask(taskId: string): Promise<void> {
//     const taskDoc = this.tasksCollection.doc(taskId);
//     console.log('Deleting task with ID:', taskId);
//     return taskDoc.delete().catch(error => {
//       console.error('Error deleting task:', error);
//       throw error;
//     });
//   }

//   searchTasks(query: string): Observable<Task[]> {
//     query = query.toLowerCase().trim();
//     console.log('Searching tasks with query:', query);
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('title', '>=', query).where('title', '<=', query + '\uf8ff')
//     ).valueChanges({ idField: 'id' });
//   }

//   filterTasksByStatus(status: string): Observable<Task[]> {
//     console.log('Filtering tasks with status:', status);
//     return this.firestore.collection<Task>('tasks', ref =>
//       ref.where('status', '==', status)
//     ).valueChanges({ idField: 'id' });
//   }

//   getTaskById(taskId: string): Observable<Task | undefined> {
//     const taskDoc = this.tasksCollection.doc<Task>(taskId);
//     console.log('Getting task by ID:', taskId);
//     return taskDoc.valueChanges();
//   }

//   assignTask(task: Task, assigneeEmail: string, assigneeName: string): Promise<void> {
//     const taskData: Task = {
//       ...task,
//       startDate: task.startDate ? new Date(task.startDate) : null,
//       deadline: task.deadline ? new Date(task.deadline) : null
//     };

//     console.log('Assigning task:', taskData);
//     console.log('Assignee email:', assigneeEmail);
//     console.log('Assignee name:', assigneeName);

//     return this.firestore.collection('tasks').add(taskData).then(docRef => {
//       const assignment: TaskAssignment = {
//         taskId: docRef.id,
//         employeeName: assigneeName,
//         assigneeEmail: assigneeEmail
//       };

//       console.log('Task assignment data before setting:', assignment);

//       return this.taskAssignmentsCollection.doc(docRef.id).set(assignment).then(() => {
//         console.log('Task assigned successfully.');
//       });
//     }).catch(error => {
//       console.error('Error assigning task:', error);
//       throw error;
//     });
//   }

//   addTaskAssignment(taskId: string, assigneeEmail: string, assigneeName: string): Promise<void> {
//     if (!taskId || !assigneeEmail || !assigneeName) {
//       return Promise.reject(new Error('Invalid task assignment data.'));
//     }

//     const assignment: TaskAssignment = {
//       taskId,
//       employeeName: assigneeName,
//       assigneeEmail
//     };

//     console.log('Adding task assignment:', assignment);

//     return this.taskAssignmentsCollection.doc(taskId).set(assignment).then(() => {
//       console.log('Task assignment added successfully.');
//     }).catch(error => {
//       console.error('Error assigning task:', error);
//       throw error;
//     });
//   }

//   updateTaskAssignment(taskId: string, assigneeEmail: string, assigneeName: string): Promise<void> {
//     if (!taskId || !assigneeEmail || !assigneeName) {
//       return Promise.reject(new Error('Invalid task assignment data.'));
//     }

//     console.log('Updating task assignment for task ID:', taskId);
//     console.log('New assignee email:', assigneeEmail);
//     console.log('New assignee name:', assigneeName);

//     return this.taskAssignmentsCollection.doc(taskId).update({
//       employeeName: assigneeName,
//       assigneeEmail: assigneeEmail
//     }).then(() => {
//       console.log('Task assignment updated successfully.');
//     }).catch(error => {
//       console.error('Error updating task assignment:', error);
//       throw error;
//     });
//   }

//   deleteTaskAssignment(taskId: string): Promise<void> {
//     console.log('Deleting task assignment for task ID:', taskId);
//     return this.taskAssignmentsCollection.doc(taskId).delete().then(() => {
//       console.log('Task assignment deleted successfully.');
//     }).catch(error => {
//       console.error('Error deleting task assignment:', error);
//       throw error;
//     });
//   }
// }
















import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable ,from} from 'rxjs';
import { Task } from '../task.model.js';
import { map ,switchMap} from 'rxjs/operators';

interface UploadFile {
  fileName: string;
  fileUrl: string;
}


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
export class TaskService {
  private tasksCollection: AngularFirestoreCollection<Task>;
  private baseUrl: string = 'https://firebasestorage.googleapis.com/v0/b/admin-9faed.appspot.com/o/uploads%2F';
  private employeesCollection: AngularFirestoreCollection<Employee>;
  private taskAssignmentsCollection: AngularFirestoreCollection<TaskAssignment>;

  constructor(private firestore: AngularFirestore,private storage: AngularFireStorage) {
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
  
  // addTask(task: Task, assigneeEmail: string, assigneeName: string): Promise<DocumentReference<Task>> {
  //   if (!assigneeEmail || !assigneeName) {
  //     return Promise.reject(new Error('Invalid assignee data.'));
  //   }

  //   const taskData: Task = {
  //     ...task,
  //     startDate: task.startDate ? new Date(task.startDate) : null,
  //     deadline: task.deadline ? new Date(task.deadline) : null
  //   };

  //   console.log('Adding task:', taskData);
  //   console.log('Assignee email:', assigneeEmail);
  //   console.log('Assignee name:', assigneeName);

  //   return this.tasksCollection.add(taskData).then(async docRef => {
  //     const assignment: TaskAssignment = {
  //       taskId: docRef.id,
      
  //       assigneeEmail: assigneeEmail
  //     };

  //     console.log('Task assignment data before setting:', assignment);

  //     await this.taskAssignmentsCollection.doc(docRef.id).set(assignment);
  //     console.log('Task assigned successfully.');

  //     return docRef;
  //   }).catch(error => {
  //     console.error('Error adding task:', error);
  //     throw error;
  //   });
  // }

  // updateTask(task: Task): Promise<void> {
  //   const taskId = task.id;
  //   if (!taskId) {
  //     throw new Error('Task ID is required.');
  //   }
  //   const { id, ...taskWithoutId } = task;
  //   const taskDoc = this.tasksCollection.doc(taskId);
  //   console.log('Updating task with ID:', taskId, 'with data:', taskWithoutId);
  //   return taskDoc.update(taskWithoutId).catch(error => {
  //     console.error('Error updating task:', error);
  //     throw error;
  //   });
  // }

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
  getFilesForTask(taskId: string): Observable<UploadFile[]> {
    return this.firestore.collection('uploads').doc(taskId).get().pipe(
      map(doc => {
        if (doc.exists) {
          const data = doc.data() as { fileName: string, fileUrl: string };
          return [
            {
              fileName: data.fileName,
              fileUrl: data.fileUrl.replace(/^"|"$/g, '') // Removing quotes
            }
          ];
        } else {
          return [];
        }
      })
    );
    
  }
  
  




















  getTask(taskId: string): Observable<any> {
    return this.firestore.collection('tasks').doc(taskId).valueChanges();
  }

  getFileMetadata(taskId: string): Observable<any[]> {
    console.log('getFileMetadata called with taskId:', taskId);
    return this.firestore.collection('uploads', ref => ref.where('taskId', '==', taskId)).valueChanges();
  }

  getFileDownloadUrl(filePath: string): Observable<string> {
    const fileRef = this.storage.ref(filePath);
    return fileRef.getDownloadURL();
  }
}
  // updateTask(task: Task): Promise<void> {
  //   const taskId = task.id;
  //   if (!taskId) {
  //     throw new Error('Task ID is required.');
  //   }
    
  //   const { id, ...taskWithoutId } = task;
    
  //   console.log('Updating task with ID:', taskId, 'with data:', taskWithoutId);
    
  //   // Update task in 'tasks' collection
  //   const taskDoc = this.tasksCollection.doc(taskId);
  //   const updateTaskPromise = taskDoc.update(taskWithoutId);

  //   // Update task in 'taskAssignments' collection
  //   const taskAssignmentDoc = this.taskAssignmentsCollection.doc(taskId);
  //   const updateTaskAssignmentPromise = taskAssignmentDoc.update(taskWithoutId as Partial<TaskAssignment>);

  //   // Ensure both updates are successful
  //   return Promise.all([updateTaskPromise, updateTaskAssignmentPromise])
  //     .then(() => {
  //       console.log('Task and task assignment updated successfully.');
  //     })
  //     .catch(error => {
  //       console.error('Error updating task and task assignment:', error);
  //       throw error; // Propagate the error if needed
  //     });
  //   // Ensure both updates are successful
  //   return Promise.all([updateTaskPromise, updateTaskAssignmentPromise])
  //     .then(() => {
  //       console.log('Task and task assignment updated successfully.');
  //     })
  //     .catch(error => {
  //       console.error('Error updating task and task assignment:', error);
  //       throw error; // Propagate the error if needed
  //     });
  // }
  
  
    // Delete task from both 'tasks' and 'taskAssignments' collections
  //   deleteTask(taskId: string): Promise<void> {
  //     if (!taskId) {
  //       throw new Error('Task ID is required.');
  //     }
  
  //     // Delete task from 'tasks' collection
  //     const deleteTaskPromise = this.tasksCollection.doc(taskId).delete();
  
  //     // Delete task from 'taskAssignments' collection
  //     const deleteTaskAssignmentPromise = this.taskAssignmentsCollection.doc(taskId).delete();
  
  //     // Ensure both deletions are successful
  //     return Promise.all([deleteTaskPromise, deleteTaskAssignmentPromise])
  //       .then(() => {
  //         console.log('Task and task assignment deleted successfully.');
  //       })
  //       .catch(error => {
  //         console.error('Error deleting task and task assignment:', error);
  //         throw error; // Propagate the error if needed
  //       });
  //   }
  // }

  


