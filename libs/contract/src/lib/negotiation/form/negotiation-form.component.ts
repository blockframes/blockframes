
import {
  ChangeDetectionStrategy, Component, Input,
  OnInit, Output, EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';
import { Scope } from '@blockframes/utils/static-model';
import { NegotitationForm } from '../form';

@Component({
  selector: 'negotiation-form',
  templateUrl: 'negotiation-form.component.html',
  styleUrls: ['./negotiation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationFormComponent implements OnInit {
  @Input() form: NegotitationForm
  @Input() title?: Movie;
  @Input() currency?: string;

  @Output() save = new EventEmitter()

  indexId: number;
  termColumns = {
    'avails.duration': 'Duration',
    'avails.territories': 'Territories',
    'avails.medias': 'Medias',
    'avails.exclusive': 'Exclusivity',
    'versions': 'Versions',
    'runs': '# of broadcasts'
  };

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.queryParams.termId) {
      const termId = this.route.snapshot.queryParams.termId;
      const tabTerms = this.form.get('terms').value;
      const index = tabTerms.findIndex(value => value.id === termId);
      this.indexId = index;
    }
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }

  onSave() {
    this.save.emit(null)
  }

}
