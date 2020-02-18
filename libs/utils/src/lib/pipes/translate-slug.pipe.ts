import { Pipe, PipeTransform } from '@angular/core';
import { getLabelBySlug, Scope } from '@blockframes/utils/static-model/staticModels';

@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string | string[], property: Scope, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    const formatSlug = (slug: string) => getLabelBySlug(property, slug.trim().toLocaleLowerCase());
    if (Array.isArray(value)) {
      return value.map(formatSlug).join(', ');
    } else {
      return formatSlug(value);
    }
  }
}
