import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';

// Rxjs
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'progress'
})
export class TaskProgressPipe implements PipeTransform {
  transform(task: AngularFireUploadTask): Observable<number> {
    return task.percentageChanges();
  }
}

@NgModule({
  declarations: [TaskProgressPipe],
  imports: [CommonModule],
  exports: [TaskProgressPipe]
})
export class TaskProgressModule { }
