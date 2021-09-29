import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Optional, OnDestroy } from '@angular/core';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Intercom } from 'ng-intercom';
import { AuthQuery } from '@blockframes/auth/+state';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { allowedFiles } from '@blockframes/utils/utils';
import { getMimeType } from '@blockframes/utils/file-sanitizer';

export interface SpreadsheetImportEvent {
  sheet: SheetTab,
  fileType: string,
}

@Component({
  selector: 'import-spreadsheet',
  templateUrl: './import-spreadsheet.component.html',
  styleUrls: ['./import-spreadsheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportSpreadsheetComponent implements OnInit, OnDestroy {
  @Output() importEvent = new EventEmitter<{ sheet: SheetTab, fileType: string }>();
  public sheets: SheetTab[] = [];
  public fileType = new FormControl('contracts');
  public allowedTypes: string[] = [];
  public mimeTypes: string[] = [];
  private sub: Subscription;
  private file: File;

  constructor(
    @Optional() private intercom: Intercom,
    private http: HttpClient,
    private authQuery: AuthQuery,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    // this.fileType.setValue('movies');

    const allowedTypes = ['xls', 'csv'];
    allowedTypes.forEach(type => {
      this.allowedTypes = this.allowedTypes.concat(allowedFiles[type].extension)
      this.mimeTypes = this.mimeTypes.concat(allowedFiles[type].mime)
    });
  }

  ngOnInit() {
    this.cdRef.markForCheck();

    this.sub = this.fileType.valueChanges.subscribe(() => {
      if (this.sheets.length) {
        this.importSpreadsheet(this.file);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  importSpreadsheet(files: FileList | File) {

    if ('item' in files) { // FileList
      if (!files.item(0)) {
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        return;
      }
      this.file = files.item(0);
    } else if (!files) { // No files
        this.snackBar.open('No file found', 'close', { duration: 1000 });
        return;
    } else { // Single file
      this.file = files;
    }

    const fileType = getMimeType(this.file);
    const isFileTypeValid = this.mimeTypes && this.mimeTypes.includes(fileType);
    if (!isFileTypeValid) {
      this.snackBar.open(`Unsupported file type: "${fileType}".`, 'close', { duration: 3000 });
      this.file = undefined;
      return;
    }

    let sheetRange: string;
    if (this.fileType.value === 'movies') {
      sheetRange = 'A14:BZ1000';
    } else if (this.fileType.value === 'contracts') {
      sheetRange = 'A1:Q100';
    } else if (this.fileType.value === 'organizations') {
      sheetRange = 'A10:Z100';
    } else {
      sheetRange = 'A10:AD100';
    }

    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      this.sheets = importSpreadsheet(buffer, sheetRange);
      this.cdRef.markForCheck();
    })
    reader.readAsArrayBuffer(this.file);
  }

  next(): void {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.fileType.value } as SpreadsheetImportEvent);
  }

  removeFile() {
    this.sheets = [];
    this.file = undefined;
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  downloadTemplate() {
    const fileName = "import-contracts-template-admin.xlsx";
    this.http.get(`/assets/templates/${fileName}`, { responseType: 'arraybuffer' })
      .subscribe(response => {
        const buffer = new Uint8Array(response);
        const blob = new Blob([buffer], { type: "application/ms-excel" });
        const url = URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', fileName);
        const event = new MouseEvent('click');
        element.dispatchEvent(event);
      });
  }


}
