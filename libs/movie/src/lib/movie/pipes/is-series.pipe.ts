import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { contentType, ContentType } from '@blockframes/utils/static-model';

@Pipe({
  name: 'isSeries'
})
export class IsSeriesPipe implements PipeTransform {
  transform(formValue: ContentType): boolean {
    const contentTypeKeys = Object.keys(contentType).filter(type => type === 'series');
    return contentTypeKeys.includes(formValue);
  }
}

@NgModule({
  declarations: [IsSeriesPipe],
  exports: [IsSeriesPipe]
})
export class SeriesPipeModule { }
