import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

import { Intercom } from 'ng-intercom';

import { SheetTab } from '@blockframes/utils/spreadsheet';

@Component({
  selector: 'title-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleImportComponent {

  public templateUrl = this.app === 'catalog'
    ? '/assets/templates/import-titles-seller-template.xlsx'
    : '/assets/templates/import-titles-template.xlsx';

  sheetTab?: SheetTab;

  constructor(
    @Optional() private intercom: Intercom,
    @Inject(APP) private app: App
  ) { }

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
