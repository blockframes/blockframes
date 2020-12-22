import { Component, Output, EventEmitter, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Optional, OnDestroy } from '@angular/core';
import { SheetTab, importSpreadsheet } from '@blockframes/utils/spreadsheet';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Intercom } from 'ng-intercom';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { AuthQuery } from '@blockframes/auth/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { Subscription } from 'rxjs';

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
  public fileType = new FormControl();
  public isUserBlockframesAdmin = false;
  public pageTitle = 'Import multiple titles at once';

  public excelForm = new HostedMediaForm();

  private sub: Subscription;
  private fileTypeSub: Subscription;

  constructor(
    @Optional() private intercom: Intercom,
    private http: HttpClient,
    private authQuery: AuthQuery,
    private cdRef: ChangeDetectorRef,
    private routerQuery: RouterQuery,
  ) {
    this.fileType.setValue('movies');
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    if(this.isUserBlockframesAdmin){
      this.pageTitle = '[ADMIN] Import multiple items at once';
    }
    this.cdRef.markForCheck();

    this.sub = this.excelForm.valueChanges.subscribe(excelFormValue => {
      if (!!excelFormValue.blobOrFile && !!excelFormValue.blobOrFile.name) {
        this.importSpreadsheet(excelFormValue.blobOrFile);
      } else {
        this.sheets = [];
      }
    });

    this.fileTypeSub = this.fileType.valueChanges.subscribe(_ => {
      if (!!this.excelForm.value.blobOrFile && !!this.excelForm.value.blobOrFile.name) {
        this.importSpreadsheet(this.excelForm.value.blobOrFile);
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.fileTypeSub.unsubscribe();
  }

  importSpreadsheet(blob: Blob) {
    let sheetRange: string;
    if (this.fileType.value === 'movies') {
      sheetRange = 'A14:BZ100';
    } else if (this.fileType.value === 'contracts') {
      sheetRange = 'A1:DD100';
    } else if (this.fileType.value === 'organizations') {
      sheetRange = 'A10:Z100';
    } else {
      sheetRange = 'A10:AD100';
    }

    const reader = new FileReader();
    reader.addEventListener('loadend', _ => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      this.sheets = importSpreadsheet(buffer, sheetRange);
      this.cdRef.markForCheck();
    })
    reader.readAsArrayBuffer(blob);
  }

  next(): void {
    // trigger the import event to tell parent component go to the next mat-stepper step
    this.importEvent.next({ sheet: this.sheets[0], fileType: this.fileType.value } as SpreadsheetImportEvent);
  }

  removeFile() {
    this.sheets = [];
    this.excelForm.reset();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  downloadTemplate(templateType: string) {
    const fileName = this.getTemplateName(templateType);
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

  getTemplateName(templateType: string){
    const appName = getCurrentApp(this.routerQuery);
    if(this.isUserBlockframesAdmin){
      return `import-${templateType}-template-admin.xlsx`;
    } else {
      return `import-${templateType}-template-customer-${appName}.xlsx`;
    }
  }

}
