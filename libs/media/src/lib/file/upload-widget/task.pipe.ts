import { Pipe, PipeTransform } from '@angular/core';
import { UploadTask, UploadTaskSnapshot } from 'firebase/storage';
import { percentage } from 'ngfire';

// Rxjs
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export function getTaskStateObservable(task: UploadTask): Observable<string> {

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
    task.on('state_changed', progress, error);
  })
}

@Pipe({
  name: 'progress'
})
export class TaskProgressPipe implements PipeTransform {
  transform(task: UploadTask) {
    return percentage(task).pipe(
      map(e => e.progress),
      catchError(() => of(0))
    );
  }
}

@Pipe({
  name: 'state'
})
export class TaskStatePipe implements PipeTransform {
  transform(task: UploadTask): Observable<string> {
    return getTaskStateObservable(task);
  }
}


