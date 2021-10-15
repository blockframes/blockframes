
import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';

import { Intercom } from 'ng-intercom';

import { SheetTab } from '@blockframes/utils/spreadsheet';

@Component({
  selector: 'org-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgImportComponent {

  sheetTab?: SheetTab;

  constructor(@Optional() private intercom: Intercom) { }

  openIntercom() {
    return this.intercom.show();
  }

  imported(sheetTab: SheetTab) {
    this.sheetTab = sheetTab;
  }

  cancel() {
    delete this.sheetTab;
  }
}
