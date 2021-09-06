import { Component, ChangeDetectionStrategy, EventEmitter, TemplateRef, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Movie } from '@blockframes/movie/+state';
import { FormList } from '@blockframes/utils/form';
import { Scope } from '@blockframes/utils/static-model';
import { debounceTime, delay, map, mapTo, tap } from 'rxjs/operators';
import { Holdback } from '../../+state/contract.model';
import { HoldbackForm } from '../form';

@Component({
  selector: 'holdbacks-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolbackFormComponent {
  @Input() title: Movie;
  @Input() holdbacks: Holdback[] = [];
  @Output() holdbacksChange = new EventEmitter<Holdback[]>();

  ref: MatDialogRef<void, void>;
  form: FormList<Holdback, HoldbackForm>;
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media',
  };

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    this.form = FormList.factory(this.holdbacks, holdback => new HoldbackForm(holdback));
  }

  openHoldbacks(template: TemplateRef<any>) {
    this.ref = this.dialog.open(template, { maxHeight: '80vh', width: '1000px', maxWidth: '100vw' });
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }

  save() {
    if (this.form.valid) {
      this.holdbacksChange.emit(this.form.value);
      this.ref.close();
    }
  }

  cancel() {
    this.ref.close();
  }
}

