import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Scope } from '@blockframes/utils/static-model';
import { Holdback } from '../../+state';

@Component({
  selector: 'holdback-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  @Input() holdbacks: Holdback[] = [];
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media',
  };

  constructor(private dialog: MatDialog) { }


  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }
}
