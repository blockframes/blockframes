import { Pipe, PipeTransform } from '@angular/core';
import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';

@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string, property: string, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    return getLabelByCode(property, value.trim().toLocaleLowerCase());
  }
}
