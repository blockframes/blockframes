import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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


@NgModule({
  declarations: [TermDatePipe],
  imports: [CommonModule],
  exports: [TermDatePipe]
})
export class TermDateModule { }
