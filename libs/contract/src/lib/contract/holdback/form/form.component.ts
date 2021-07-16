import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';
import { FormList } from '@blockframes/utils/form';
import { Scope } from '@blockframes/utils/static-model';
import { Holdback } from '../../+state/contract.model';
import { HoldbackForm } from '../form';

interface Data {
  holdbacks: Holdback[];
  title: Movie;
}

@Component({
  selector: 'holdback-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolbackFormComponent {
  title: Movie;
  form: FormList<Holdback, HoldbackForm>;
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media',
    languages: 'Versions',
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) data: Data,
    private ref: MatDialogRef<Data, Holdback[] | void>,
    private dialog: MatDialog,
  ) {
    this.form = FormList.factory(data.holdbacks, holdback => new HoldbackForm(holdback));
    this.title = data.title;
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }

  save() {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    }
  }

  cancel() {
    this.ref.close();
  }
}
