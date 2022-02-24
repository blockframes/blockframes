
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';
import { Scope } from '@blockframes/utils/static-model';
import { NegotiationForm } from '../form';

const isNumber = (v: string) => !isNaN(parseFloat(v));

@Component({
  selector: '[form]negotiation-form',
  templateUrl: 'negotiation-form.component.html',
  styleUrls: ['./negotiation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationFormComponent {
  @Input() form: NegotiationForm
  @Input() title?: Movie;
  @Input() currency?: string;
  @Input() set activeTerm(termId: string) {
    if (termId === null || termId === undefined) return;
    if (isNumber(termId)) {
      this.indexId = parseFloat(termId);
    } else {
      const tabTerms = this.form.get('terms').value;
      this.indexId = tabTerms.findIndex(value => value.id === termId);
    }
  }

  indexId: number;
  termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions'
  };

  constructor(private dialog: MatDialog) { }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }
}
