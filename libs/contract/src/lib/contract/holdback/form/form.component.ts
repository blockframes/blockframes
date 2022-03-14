import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  TemplateRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { Holdback, Movie } from '@blockframes/model';
import { FormTableComponent } from '@blockframes/ui/form/table/form-table.component';
import { FormList } from '@blockframes/utils/form';
import { Scope } from '@blockframes/utils/static-model';
import { HoldbackForm } from '../form';

@Component({
  selector: 'holdbacks-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolbackFormComponent {
  @Input() title: Movie;
  @Input() holdbacks: Holdback[] = [];
  @Output() holdbacksChange = new EventEmitter<Holdback[]>();
  @ViewChild('formTable', { read: FormTableComponent }) formTable: FormTableComponent<Holdback>;

  ref: MatDialogRef<void, void>;
  form: FormList<Holdback, HoldbackForm>;
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media',
  };

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.form = FormList.factory(this.holdbacks, (holdback) => new HoldbackForm(holdback), []);
  }

  openHoldbacks(template: TemplateRef<any>) {
    this.ref = this.dialog.open(template, {
      maxHeight: '80vh',
      width: '1000px',
      maxWidth: '100vw',
    });
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, {
      data: { terms, scope },
      maxHeight: '80vh',
      autoFocus: false,
    });
  }

  save() {
    if (this.form.valid) {
      this.ref.close(); //The position of the close before the emit is important.
      this.holdbacksChange.emit(this.form.value);
    }
  }

  shouldDisable() {
    return this.formTable.formItem?.dirty;
  }

  cancel() {
    this.ref.close();
  }
}
