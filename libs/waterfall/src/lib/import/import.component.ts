import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SheetTab } from '@blockframes/utils/spreadsheet';

@Component({
  selector: 'waterfall-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentImportComponent {

  sheetTab?: SheetTab;

  imported(sheetTab: SheetTab) {
    this.sheetTab = sheetTab;
  }

  cancel() {
    delete this.sheetTab;
  }
}
