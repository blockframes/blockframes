import { staticModels } from '@blockframes/movie';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findLabelBySlug'
})
export class FindLabelBySlugPipe implements PipeTransform {
  transform(value: string, property: string): string {
    return staticModels[property].find(key => key.slug === value).label;
  }
}
