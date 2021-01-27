import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { contentType, ContentType } from '@blockframes/utils/static-model';

@Pipe({
  name: 'isType'
})
export class IsTypePipe implements PipeTransform {
  transform(formValue: ContentType, status: ContentType): boolean {
    return contentType[formValue] === contentType[status]
  }
}

@NgModule({
  declarations: [IsTypePipe],
  exports: [IsTypePipe]
})
export class IsTypePipeModule { }
