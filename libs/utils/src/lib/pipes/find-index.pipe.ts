import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'findIndex' })
export class FindIndexPipe implements PipeTransform {
  transform(data: unknown[], dataAtIndex: unknown) {
    console.log({data, dataAtIndex})
    if (Array.isArray(data))
      return data.findIndex(d => d === dataAtIndex)
    return 0
  }
}


@NgModule({
  declarations: [FindIndexPipe],
  exports: [FindIndexPipe]
})
export class FindIndexModule { }
