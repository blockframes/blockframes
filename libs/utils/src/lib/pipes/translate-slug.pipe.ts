import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { getLabelBySlug, Scope } from '../static-model/staticModels';
import { CommonModule } from '@angular/common';

export const formatSlug = (slug: string, scope: Scope) => slug
  ? getLabelBySlug(scope, slug.trim().toLocaleLowerCase())
  : '';
@Pipe({
  name: 'translateSlug'
})
export class TranslateSlugPipe implements PipeTransform {
  transform(value: string | string[], scope: Scope, language?: string): string {
    // TODO(MF, BD): add language parameter, when translation exist
    if (Array.isArray(value)) {
      return value.map((v) => formatSlug(v, scope)).join(', ');
    } else {
      return formatSlug(value, scope);
    }
  }
}

@NgModule({
  declarations: [TranslateSlugPipe],
  imports: [CommonModule],
  exports: [TranslateSlugPipe]
})
export class TranslateSlugModule { }
