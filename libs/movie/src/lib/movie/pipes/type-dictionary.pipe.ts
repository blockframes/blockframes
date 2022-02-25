import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { ContentType } from '@blockframes/utils/static-model';

const typeDictionary = {
  tv: {
    runningTime: 'Average Episode Running Time',
    runningTimeError: 'Please fill in a valid runtime.',
    runningTimeHint: 'Please specify the average duration of an episode.'
  },
  movie: {
    runningTime: 'Running Time',
    runningTimeError: 'Please specify your project\'s runtime.',
    runningTimeHint: 'In minutes.'
  }
}

@Pipe({ name: 'typeDictionary' })
export class TypeDictionaryPipe implements PipeTransform {
  transform(formValue: ContentType) {
    return typeDictionary[formValue];
  }
}

@NgModule({
  declarations: [TypeDictionaryPipe],
  exports: [TypeDictionaryPipe]
})
export class TypeDictionaryPipeModule { }
