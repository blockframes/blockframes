import { Pipe, PipeTransform } from '@angular/core';
import { getLabelBySlug, Scope } from '@blockframes/utils/static-model/staticModels';

@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string, property: Scope, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    return getLabelBySlug(property, value.trim().toLocaleLowerCase());
  }
}
