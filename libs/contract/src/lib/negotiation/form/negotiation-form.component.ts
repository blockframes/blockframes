import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Movie, Scope } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { NegotiationForm } from '../form';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';

const isNumber = (v: string) => !isNaN(parseFloat(v));

@Component({
  selector: '[form]negotiation-form',
  templateUrl: 'negotiation-form.component.html',
  styleUrls: ['./negotiation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NegotiationFormComponent {
  @Input() form: NegotiationForm;
  @Input() title?: Movie;
  @Input() currency?: string;
  @Input() set activeTerm(termId: string) {
    if (termId === null || termId === undefined) return;
    if (isNumber(termId)) {
      this.indexId = parseFloat(termId);
    } else {
      const tabTerms = this.form.get('terms').value;
      this.indexId = tabTerms.findIndex((value) => value.id === termId);
    }
  }

  indexId: number;
  termColumns = {
    'duration.from': 'Terms Start Date',
    'duration.to': 'Terms End Date',
    territories: 'Territories',
    medias: 'Medias',
    exclusive: 'Exclusivity',
    languages: 'Versions',
  };

  constructor(private dialog: MatDialog) { }

  openDetails(items: string, scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }
}
