// Angular
import { Pipe, PipeTransform, QueryList, NgModule } from '@angular/core';

// Blockframes
import { ColRefDirective } from '../directives/col-ref.directive'

@Pipe({ name: 'findColRef' })
export class QueryListFindPipe implements PipeTransform {
  transform(queryList: QueryList<ColRefDirective>, key: string) {
    return queryList.find(query => query.colRef === key);
  }
}

@NgModule({
  exports: [QueryListFindPipe],
  declarations: [QueryListFindPipe],
})
export class QueryListFindModule { }
