// Angular
import { Component, ChangeDetectionStrategy, OnInit, Optional } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

// Utils
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Intercom } from 'ng-intercom';

// Blockframes
import { staticConsts } from '@blockframes/utils/static-model'
import { getAppName } from '@blockframes/utils/apps';

@Component({
  selector: 'movie-form-title-status',
  templateUrl: 'title-status.component.html',
  styleUrls: ['./title-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleStatusComponent implements OnInit {
  public form = this.shell.form;

  public appInformation = { disabledStatus: [], appName: { slug: '', label: '' } }

  public status = [{
    name: 'In Development',
    value: 'development',
    image: 'development.svg',
    disabled: false
  }, {
    name: 'In Production',
    value: 'shooting',
    image: 'production.svg',
    disabled: false
  }, {
    name: 'In Post-Production',
    value: 'post_production',
    image: 'post_production.svg',
    disabled: false
  }, {
    name: 'Completed',
    value: 'finished',
    image: 'completed.svg',
    disabled: false
  }, {
    name: 'Released',
    value: 'released',
    image: 'released.svg',
    disabled: false
  }]

  constructor(private shell: MovieFormShellComponent, private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom) { }

  ngOnInit() {
    this.appInformation.disabledStatus = this.routerQuery.getData()?.disabled || [];
    this.status = this.status.map(s => ({ ...s, disabled: this.appInformation.disabledStatus.includes(s.value) }))
    if (this.appInformation.disabledStatus.length) {
      const value = Object.keys(staticConsts.productionStatus).filter(status => status === 'released')
      this.form.productionStatus.setValue(value[0])
    }
    this.appInformation.appName = getAppName(this.routerQuery.getData().app)
  }

  setValue(value: string) {
    /* If status is defined via the router data object, we don't want to change
    the status via the click event from the image */
    if (!this.routerQuery.getData()?.disabled?.includes(value)) {
      this.form.productionStatus.setValue(value)
    }
  }

  openIntercom(): void {
    return this.intercom.show();
  }
}
