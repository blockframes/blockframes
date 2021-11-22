import { Pipe, PipeTransform } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';

// Rxjs
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function getTaskStateObservable(task: AngularFireUploadTask): Observable<string> {

  return new Observable(subscriber => {
    let state = '';
    const progress = (snap: UploadTaskSnapshot) => {
      if (snap.state !== state) {
        state = snap.state;
        subscriber.next(snap.state);
      }
      if (snap.bytesTransferred === snap.totalBytes) {
        subscriber.next('success');
        subscriber.complete();
      }
    }
    const error = (err) => {
      if (err.code === 'storage/canceled') {
        subscriber.next('canceled');
      } else {
        subscriber.next('error');
      }
      subscriber.complete();
    }
    task.task.on('state_changed', progress, error);
  })
}

@Pipe({
  name: 'progress'
})
export class TaskProgressPipe implements PipeTransform {
  transform(task: AngularFireUploadTask): Observable<number> {
    return task.percentageChanges().pipe(
      catchError(() => of(0))
    );
  }
}

@Pipe({
  name: 'state'
})
export class TaskStatePipe implements PipeTransform {
  transform(task: AngularFireUploadTask): Observable<string> {
    return getTaskStateObservable(task);
  }
}


