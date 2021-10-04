
import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, Optional, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Intercom } from 'ng-intercom';

import { getMimeType } from '@blockframes/utils/file-sanitizer';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';

import { sheetRanges, SpreadsheetImportEvent, SpreadsheetImportType } from '../utils';


const allowedMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet', 'text/csv'];

@Component({
  selector: '[importType] import-spreadsheet',
  templateUrl: './import-spreadsheet.component.html',
  styleUrls: ['./import-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSpreadsheetComponent {

  /** The type of spreadsheet import we expect, can be `titles`, `organizations`, or `contracts` */
  @Input() importType: SpreadsheetImportType = 'titles';

  @Output() importEvent = new EventEmitter<SpreadsheetImportEvent>();

  public sheets: SheetTab[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    @Optional() private intercom: Intercom,
  ) { }

  importSpreadsheet(files: FileList | File) {

    let file: File;

    if ('item' in files) { // FileList
      file = files.item(0);
    } else { // Single file
      file = files;
    }

    if (!file) {
      this.snackBar.open('No file found', 'close', { duration: 1000 });
      return;
    }

    const mimeType = getMimeType(file);
    const isMimeTypeValid = allowedMimeTypes.includes(mimeType);
    if (!isMimeTypeValid) {
      this.snackBar.open(`Unsupported file type: "${mimeType}".`, 'close', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      this.sheets = importSpreadsheet(buffer, sheetRanges[this.importType]);
      this.cdRef.markForCheck();
    })
    reader.readAsArrayBuffer(file);
  }

  next() {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], importType: this.importType });
  }

  removeFile() {
    this.sheets = [];
  }

  openIntercom() {
    return this.intercom.show();
  }
}
