import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';

// Rxjs
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'state'
})
export class TaskStatePipe implements PipeTransform {
  transform(task: AngularFireUploadTask): Observable<string> {
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
      const error = () => {
        subscriber.next('error');
        subscriber.complete();
      }
      task.task.on('state_changed', progress, error);
    })
  }
}

@NgModule({
  declarations: [TaskStatePipe],
  imports: [CommonModule],
  exports: [TaskStatePipe]
})
export class TaskSnapshotModule { }
