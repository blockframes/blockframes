import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { getLabelBySlug, Scope } from '../static-model/staticModels';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string | string[], property: Scope, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    const formatSlug = (slug: string) => slug ? getLabelBySlug(property, slug.trim().toLocaleLowerCase()) : '';
    if (Array.isArray(value)) {
      return value.map(formatSlug).join(', ');
    } else {
      return formatSlug(value);
    }
  }
}

@NgModule({
  declarations: [TranslateSlugPipe],
  imports: [CommonModule],
  exports: [TranslateSlugPipe]
})
export class TranslateSlugModule { }
