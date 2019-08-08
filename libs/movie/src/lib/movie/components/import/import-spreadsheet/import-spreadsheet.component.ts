import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PreviewSheetComponent } from './../preview-sheet/preview-sheet.component';
import { SheetTab, importSpreadsheet } from '@blockframes/utils';
import { FormControl } from '@angular/forms';


export interface SpreadsheetImportEvent {
  sheet: SheetTab,
  fileType: string,
}

@Component({
  selector: 'movie-import-spreadsheet',
  templateUrl: './import-spreadsheet.component.html',
  styleUrls: ['./import-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSpreadsheetComponent {

  @Output() importEvent = new EventEmitter<{ sheet: SheetTab, fileType: string}>();
  public sheets: SheetTab[] = [];
  public fileType = new FormControl();

  constructor(
    private dialog: MatDialog,
  ) {
    this.fileType.setValue('movies');
  }

  importSpreadsheet(bytes: Uint8Array) {
    let sheetRange;
    if(this.fileType.value === 'movies') {
      sheetRange = 'A10:AD100';
    } else {
      sheetRange = 'A10:AD100';
    }
    this.sheets = importSpreadsheet(bytes, sheetRange);
  }

  next(): void {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.fileType.value} as SpreadsheetImportEvent);
  }

  previewFile() {
    this.dialog.open(PreviewSheetComponent, { data: this.sheets });
  }

  removeFile() {
    this.sheets = [];
  }
}
