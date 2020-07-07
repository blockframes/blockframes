// Angular
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map, distinctUntilChanged, delay } from "rxjs/operators";
import { AngularFireUploadTask } from "@angular/fire/storage";

@Injectable({ providedIn: 'root' })
export class TaskService {

  private _tasks = new BehaviorSubject<UploadTasks>({});

  get tasks$(): Observable<UploadTask[]> {
    return this._tasks.asObservable().pipe(map(tasks => {
      const arr = [];
      Object.keys(tasks).forEach(key => arr.push(tasks[key]));
      return arr;
    }))
  }

  get tasks() {
    return this._tasks.getValue();
  }

  set tasks(tasks: UploadTasks) {
    this._tasks.next(tasks);
  }

  get totalTasksCount() {
    return Object.keys(this.tasks).length;
  }

  get processingTasksCount() {
    let counter = 0;
    Object.keys(this.tasks).forEach(key => {
      if (!this.isDone(this.tasks[key].id)) {
        counter++;
      }
    });
    return counter;
  }

  get endOfTasks$(): Observable<boolean> {
    return this._tasks.asObservable().pipe(
      map(() => {
        return this.totalTasksCount > 0 && this.processingTasksCount === 0
      }),
      distinctUntilChanged(),
      delay(5000),
      map(() => {
        // checking counts again to see whether nothing has changed in the meantime.
        return this.totalTasksCount > 0 && this.processingTasksCount === 0
      })
    );
  }

  add(task: UploadTask) {
    this.tasks[task.id] = task;
  }

  remove(fileName?: string) {
    if (fileName) {
      const tasks = this.tasks;
      delete tasks[fileName];
      this.tasks = tasks;
    } else {
      const tasks = this.tasks;
      Object.keys(tasks).forEach(key => {
        if (this.isDone(tasks[key].id)) {
          delete tasks[key];
        }
      })
      this.tasks = tasks;
    }
  }

  updateProgress(fileName: string, progress: number) {
    const tasks = this.tasks;
    tasks[fileName].progress = progress;
    this.tasks = tasks;
  }

  updateStatus(fileName: string, status: UploadStatus) {
    const tasks = this.tasks;
    tasks[fileName].status = status;
    this.tasks = tasks;
  }

  isUploading(fileName: string) {
    if (!!this.tasks[fileName]) {
      const status = this.tasks[fileName].status
      return status === 'uploading' || status === 'paused';
    } else {
      return false;
    }
  }

  isDone(fileName: string) {
    const status = this.tasks[fileName].status;
    return status === 'succeeded' || status === 'canceled';
  }

}

interface UploadTasks {
  [key: string]: UploadTask
}

export interface UploadTask {
  status: UploadStatus;
  progress: number;
  id: string;
  uploadtask: AngularFireUploadTask
}

export type UploadStatus = 'uploading' | 'paused' | 'succeeded' | 'canceled';
