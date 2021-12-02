
import {
  ChangeDetectionStrategy, Component, Input, OnInit
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';
import { Scope } from '@blockframes/utils/static-model';
import { NegotiationForm } from '../form';

@Component({
  selector: '[form]negotiation-form',
  templateUrl: 'negotiation-form.component.html',
  styleUrls: ['./negotiation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationFormComponent implements OnInit {
  @Input() form: NegotiationForm
  @Input() title?: Movie;
  @Input() currency?: string;
  @Input() set activeTerm(termId: string) {
    if (!termId) return;
    const tabTerms = this.form.get('terms').value;
    this.indexId = tabTerms.findIndex(value => value.id === termId);
  }

  indexId: number;
  termColumns = {
    'duration': 'Duration',
    'territories': 'Territories',
    'medias': 'Medias',
    'exclusive': 'Exclusivity',
    'languages': 'Versions'
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // const termId = this.route.snapshot.queryParams.termId;
    // if (termId) {
    //   const tabTerms = this.form.get('terms').value;
    //   this.indexId = tabTerms.findIndex(value => value.id === termId);
    // }
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }
}
