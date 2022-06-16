import { Inject, Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

@Component({
  selector: 'contract-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractImportComponent {

  sheetTab?: SheetTab;
  public templateUrl = this.app === 'catalog'
    ? '/assets/templates/import-contracts-seller-template.xlsm'
    : '/assets/templates/import-contracts-admin-template.xlsm';

  constructor(
    @Optional() private intercom: Intercom,
    @Inject(APP) private app: App,
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
