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

@Pipe({
  name: 'typeDictionary'
})
export class TypeDictionaryPipe implements PipeTransform {
  transform(formValue: ContentType) {
    return formValue === 'series' ? typeDictionary.series : typeDictionary.default
  }
}

@NgModule({
  declarations: [IsTypePipe, TypeDictionaryPipe],
  exports: [IsTypePipe, TypeDictionaryPipe]
})
export class IsTypePipeModule { }

const typeDictionary = {
  series: {
    runningTime: 'Runtime of an episode',
    runningTimeError: 'Total number of episodes in a season.'
  },
  default: {
    runningTime: 'Running Time',
    runningTimeError: "Please specify your title's duration."
  }
}
