import { Component, ChangeDetectionStrategy, Optional, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/model';

import { Intercom } from 'ng-intercom';

import { SheetTab } from '@blockframes/utils/spreadsheet';
import { AuthService } from '@blockframes/auth/service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'title-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleImportComponent implements OnInit {

  public templateUrl = '/assets/templates/import-titles-seller-template.xlsx';

  sheetTab?: SheetTab;

  constructor(
    @Optional() private intercom: Intercom,
    @Inject(APP) private app: App,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const isBlockframesAdmin = await firstValueFrom(this.authService.isBlockframesAdmin$);
    if (isBlockframesAdmin) {
      this.templateUrl = '/assets/templates/import-titles-admin-template.xlsx';
      this.cdr.markForCheck();
    }
  }

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
