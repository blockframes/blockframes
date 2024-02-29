import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { fade } from '@blockframes/utils/animations/fade';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { AlgoliaOrganization } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

@Component({
  selector: 'crm-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
})
export class PermissionsComponent {

  public indexGroup = 'indexNameOrganizations';
  public waterfall = this.shell.waterfall;
  public orgControl = new FormControl<string>('');
  public form = new FormGroup({
    id: new FormControl<string>('', [Validators.required]),
    isAdmin: new FormControl<boolean>(false, [Validators.required]),
    rightholderIds: new FormControl<string[]>([], [Validators.required]),
  });

  public columns: Record<string, string> = {
    id: 'Id',
    rightholder: 'Organization',
    org: 'Right holder',
    isAdmin: 'Access',
    lockedVersionId: 'Waterfall Version',
    actions: 'Actions'
  };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallPermissionsService: WaterfallPermissionsService,
    private waterfallService: WaterfallService,
  ) { }

  public setOrg(result: AlgoliaOrganization) {
    this.form.get('id').setValue(result.objectID);
  }

  public save() {
    if (this.form.invalid) return;
    if (!this.waterfall.orgIds.includes(this.form.value.id)) this.waterfall.orgIds.push(this.form.value.id);
    return Promise.all([
      this.waterfallService.update(this.waterfall),
      this.waterfallPermissionsService.upsert(this.form.value, { params: { waterfallId: this.waterfall.id } }),
    ]);
  }
}