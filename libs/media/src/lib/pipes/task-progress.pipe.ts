import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';

// Rxjs
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'progress'
})
export class TaskProgressPipe implements PipeTransform {
  transform(task: AngularFireUploadTask): Observable<number> {
    return task.percentageChanges().pipe(
      catchError(err => of(0))
    );
  }
}

@NgModule({
  declarations: [TaskProgressPipe],
  imports: [CommonModule],
  exports: [TaskProgressPipe]
})
export class TaskProgressModule { }
