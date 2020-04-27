import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'runtime'
})

export class RuntimePipe implements PipeTransform {
  transform(value: string | number): string {
    if (value === 0 || value === '') {
      return 'TBC';
    }
    return typeof value === 'string' ? value : value + ' min'
  }
}