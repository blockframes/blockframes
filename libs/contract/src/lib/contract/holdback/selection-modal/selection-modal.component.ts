import { ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Holdback, Movie, Scope, waterfallMediaGroups } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { HoldbackForm } from '../form';
import { FormTableComponent } from '@blockframes/ui/form/table/form-table.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { Validators } from '@angular/forms';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';

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

  public waterfallMediaGroups = waterfallMediaGroups;

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
    this.form = FormList.factory(this.data.holdbacks, (holdback) => new HoldbackForm(holdback), Validators.required);
  }

  close() {
    this.dialogRef.close();
  }

  openDetails(items: string, scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
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
