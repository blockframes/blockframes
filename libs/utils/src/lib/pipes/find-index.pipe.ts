import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'findIndex' })
export class FindIndexPipe implements PipeTransform {
  /**
   * Returns -1 when no result found.
   */
  transform(data: unknown[], dataAtIndex: unknown) {
    if (Array.isArray(data))
      return data.findIndex(d => d === dataAtIndex)
    return -1
  }
}


@NgModule({
  declarations: [FindIndexPipe],
  exports: [FindIndexPipe]
})
export class FindIndexModule { }
