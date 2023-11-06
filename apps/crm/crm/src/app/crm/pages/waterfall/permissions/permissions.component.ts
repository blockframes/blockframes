import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { fade } from '@blockframes/utils/animations/fade';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { AlgoliaOrganization, WaterfallPermissions } from '@blockframes/model';
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
  public waterfall = this.shell.waterfall
  public permissions$ = this.shell.permissions$;

  public orgControl = new FormControl<string>('');

  public form = new FormGroup({
    id: new FormControl<string>('', [Validators.required]),
    isAdmin: new FormControl<boolean>(false, [Validators.required]),
    rightholderIds: new FormControl<string[]>([], [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shell: DashboardWaterfallShellComponent,
    private waterfallPermissionsService: WaterfallPermissionsService,
    private waterfallService: WaterfallService,
  ) { }

  public goTo(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  public setOrg(result: AlgoliaOrganization) {
    this.form.get('id').setValue(result.objectID);
  }

  public edit(permission: WaterfallPermissions) {
    this.form.patchValue(permission);
    this.orgControl.setValue(permission.id);
  }

  public save() {
    if (this.form.invalid) return;
    this.waterfall.orgIds.push(this.form.value.id);
    return Promise.all([
      this.waterfallService.update(this.waterfall),
      this.waterfallPermissionsService.upsert(this.form.value, { params: { waterfallId: this.waterfall.id } }),
    ]);
  }
}