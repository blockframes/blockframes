import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { contentType, ContentType } from '@blockframes/utils/static-model';

@Pipe({
  name: 'isType'
})
export class IsTypePipe implements PipeTransform {
  transform(formValue: ContentType, status: ContentType): boolean {
    const contentTypeKeys = Object.keys(contentType).filter(type => type === status);
    return contentTypeKeys.includes(formValue);
  }
}

@NgModule({
  declarations: [IsSeriesPipe],
  exports: [IsSeriesPipe]
})
export class IsTypePipeModule { }
