import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toArray' })
export class ToArrayPipe implements PipeTransform {
  transform(object: Object) {
    return Array.isArray(object) ? object : [object];
  }
}

@NgModule({
  declarations: [ToArrayPipe],
  exports: [ToArrayPipe]
})
export class ToArrayPipeModule { }
