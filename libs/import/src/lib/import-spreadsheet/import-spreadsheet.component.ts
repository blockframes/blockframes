
import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Intercom } from 'ng-intercom';

import { getMimeType } from '@blockframes/utils/file-sanitizer';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';

import { sheetRanges, SpreadsheetImportEvent } from '../utils';
import { AuthQuery } from '@blockframes/auth/+state';


const allowedMimeTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet', 'text/csv'];

@Component({
  selector: 'import-spreadsheet',
  templateUrl: './import-spreadsheet.component.html',
  styleUrls: ['./import-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSpreadsheetComponent implements OnInit {

  @Output() importEvent = new EventEmitter<{ sheet: SheetTab, fileType: string }>();

  public sheets: SheetTab[] = [];
  public fileType = new FormControl();
  public isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
  public pageTitle = 'Import multiple titles at once';

  constructor(
    private authQuery: AuthQuery,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    @Optional() private intercom: Intercom,
  ) {
    this.fileType.setValue('titles');
  }

  ngOnInit() {
    if (this.isUserBlockframesAdmin) {
      this.pageTitle = '[ADMIN] Import multiple items at once';
    }
    this.cdRef.markForCheck();
  }

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
      this.sheets = importSpreadsheet(buffer, sheetRanges[this.fileType.value]);
      this.cdRef.markForCheck();
    })
    reader.readAsArrayBuffer(file);
  }

  next() {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.fileType.value } as SpreadsheetImportEvent);
  }

  removeFile() {
    this.sheets = [];
  }

  openIntercom() {
    return this.intercom.show();
  }
}
