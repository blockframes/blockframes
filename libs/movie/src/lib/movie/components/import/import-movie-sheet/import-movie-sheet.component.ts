import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PreviewSheetComponent } from './../preview-sheet/preview-sheet.component';
import { SheetTab, importSpreadsheet } from '@blockframes/utils';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'movie-import-movie-sheet',
  templateUrl: './import-movie-sheet.component.html',
  styleUrls: ['./import-movie-sheet.component.scss'],
})
export class ImportMovieSheetComponent {

  @Output() importEvent = new EventEmitter<{ sheet: SheetTab, fileType: string}>();
  public sheets: SheetTab[] = [];
  public form = new FormGroup({ fileType: new FormControl()});

  constructor(
    private dialog: MatDialog,
  ) {
    this.form.get('fileType').setValue('movies');
  }

  importSpreadsheet(bytes: Uint8Array) {
    this.sheets = importSpreadsheet(bytes);
  }

  next(): void {
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.form.value.fileType});
  }

  previewFile() {
    this.dialog.open(PreviewSheetComponent, { data: this.sheets });
  }

  removeFile() {
    this.sheets = [];
  }
}
