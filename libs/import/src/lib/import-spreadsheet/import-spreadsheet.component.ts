
import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, Optional, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';


import { getMimeType } from '@blockframes/utils/file-sanitizer';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';

import { sheetRanges, SpreadsheetImportType } from '../utils';


const allowedMimeTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  'text/csv',
  'text/html'
];

@Component({
  selector: 'import-spreadsheet[importType]',
  templateUrl: './import-spreadsheet.component.html',
  styleUrls: ['./import-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportSpreadsheetComponent {

  /** The type of spreadsheet import we expect, can be `titles`, `organizations`, or `contracts` */
  @Input() importType: SpreadsheetImportType = 'titles';

  @Output() importEvent = new EventEmitter<SheetTab>();

  public sheets: SheetTab[] = [];

  public file: {
    name: string;
    size: number;
  };

  constructor(
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
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
      this.file = file;
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      this.sheets = importSpreadsheet(buffer, sheetRanges[this.importType]);
      this.cdRef.markForCheck();
      this.importEvent.next(this.sheets[0]);
    });
    reader.readAsArrayBuffer(file);
  }

  remove() {
    delete this.file;
    this.sheets = [];
    this.cdRef.markForCheck();
  }
}
