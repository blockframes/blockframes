import { Pipe, PipeTransform } from '@angular/core';
import { getLabelByCode, Scope } from '@blockframes/movie/static-model/staticModels';

@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string, property: Scope, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    return getLabelByCode(property, value.trim().toLocaleLowerCase());
  }
}
