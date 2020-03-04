import { Pipe, PipeTransform } from '@angular/core';
import { termToPrettyDate, Terms } from '../common-interfaces/terms';

@Pipe({
  name: 'termToPrettyDate'
})
export class TermToPrettyDatePipe implements PipeTransform {
  transform(term: Terms , type: 'end' | 'start'): string {
    return termToPrettyDate(term, type);
  }
}
