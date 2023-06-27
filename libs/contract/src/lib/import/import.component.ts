import { Inject, Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Intercom } from 'ng-intercom';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { APP } from '@blockframes/utils/routes/utils';
import { App, appName } from '@blockframes/model';
import { ActivatedRoute } from '@angular/router';
import { pluck } from 'rxjs';

@Component({
  selector: 'contract-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractImportComponent {

  public mode$ = this.route.params.pipe(pluck('mode'));
  public appName = appName;

  sheetTab?: SheetTab;
  public templateUrl = this.app === 'catalog'
    ? '/assets/templates/import-contracts-seller-template.xlsm'
    : '/assets/templates/import-contracts-admin-template.xlsm';

  constructor(
    @Optional() private intercom: Intercom,
    @Inject(APP) private app: App,
    private route: ActivatedRoute,
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
