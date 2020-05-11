import { Pipe, PipeTransform } from '@angular/core';
import { termToPrettyDate, Terms, createTerms } from '../common-interfaces/terms';

@Pipe({
  name: 'termDate',
  pure: true,
})
export class TermDatePipe implements PipeTransform {
  transform(term: Terms = createTerms(), type: 'end' | 'start'): string {
    return termToPrettyDate(term, type);
  }
}
