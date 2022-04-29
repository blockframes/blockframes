import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Holdback, Movie, Scope } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { HoldbackForm } from '../form';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { FormTableComponent } from '@blockframes/ui/form/table/form-table.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'holdback-selection',
  templateUrl: 'selection-modal.component.html',
  styleUrls: ['./selection-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionModalComponent implements OnInit {
  @ViewChild('formTable', { read: FormTableComponent }) formTable: FormTableComponent<Holdback>;

  form: FormList<Holdback, HoldbackForm>;
  columns = {
    duration: 'Duration',
    territories: 'Territories',
    medias: 'Media'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: Movie;
      holdbacks: Holdback[];
      holdbacksChange: EventEmitter<Holdback[]>;
    },
    public dialogRef: MatDialogRef<SelectionModalComponent>,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = FormList.factory(this.data.holdbacks, (holdback) => new HoldbackForm(holdback), []);
  }

  close() {
    this.dialogRef.close();
  }

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: createModalData({ terms, scope }), autoFocus: false });
  }

  saveAndClose() {
    if (this.form.valid) {
      this.dialog.closeAll();
      this.data.holdbacksChange.emit(this.form.value);
    }
  }

  shouldDisable() {
    return this.formTable?.formItem?.dirty;
  }
}
