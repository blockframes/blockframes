import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PreviewSheetComponent } from './../preview-sheet/preview-sheet.component';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


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

  @Output() importEvent = new EventEmitter<{ sheet: SheetTab, fileType: string }>();
  public sheets: SheetTab[] = [];
  public fileType = new FormControl();

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
  ) {
    this.fileType.setValue('movies');
  }

  importSpreadsheet(bytes: Uint8Array) {
    let sheetRange;
    if (this.fileType.value === 'movies') {
      sheetRange = 'A10:AQ100';
    } else if (this.fileType.value === 'contracts') {
      sheetRange = 'A1:AD100';
    } else {
      sheetRange = 'A10:AD100';
    }
    this.sheets = importSpreadsheet(bytes, sheetRange);
  }

  next(): void {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.fileType.value } as SpreadsheetImportEvent);
  }

  previewFile() {
    this.dialog.open(PreviewSheetComponent, { data: this.sheets });
  }

  removeFile() {
    this.sheets = [];
  }

  downloadTemplate(templateType: string) {
    const fileName = `import-${templateType}-template.xlsx`;
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
