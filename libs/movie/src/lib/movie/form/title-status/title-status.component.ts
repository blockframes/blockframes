// Angular
import { Component, ChangeDetectionStrategy, Optional, Inject } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Utils
import { Intercom } from 'ng-intercom';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ProductionStatus, productionStatus, ProductionStatusValue } from '@blockframes/utils/static-model';
import { getAllowedproductionStatuses } from '@blockframes/shared/model';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

interface AllowedPoductionStatuses {
  value: ProductionStatusValue;
  key: ProductionStatus;
  image: string;
  disabled: boolean;
}

@Component({
  selector: 'movie-form-title-status',
  templateUrl: 'title-status.component.html',
  styleUrls: ['./title-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleStatusComponent {
  public form = this.shell.getForm('movie');

  private allowedProductionStatuses = getAllowedproductionStatuses(this.currentApp);

  public status: AllowedPoductionStatuses[] = Object.entries(productionStatus).map(
    ([key, value]: [ProductionStatus, ProductionStatusValue]) => {
      return {
        value,
        key,
        image: `${key}.svg`,
        disabled: !this.allowedProductionStatuses.some(k => k === key),
      };
    }
  );

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public currentApp: App
  ) {
    this.dynTitle.setPageTitle('Title Status');
  }

  setValue(value: string, disabled: boolean) {
    if (!disabled) this.form.productionStatus.setValue(value);
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
