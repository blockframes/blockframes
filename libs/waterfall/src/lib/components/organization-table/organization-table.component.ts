import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';
import { fade } from '@blockframes/utils/animations/fade';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { WaterfallPermissionsService } from '../../permissions.service';
import { WaterfallService } from '../../waterfall.service';
import { map } from 'rxjs';
import { RightholderSelectModalComponent } from '../rightholder/rightholder-select-modal/rightholder-select-modal.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'waterfall-organization-table',
  templateUrl: './organization-table.component.html',
  styleUrls: ['./organization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade],
})
export class OrganizationTableComponent {
  public waterfall = this.shell.waterfall;
  public permissions$ = this.shell.permissions$.pipe(
    map(permissions => permissions.map(permission => {
      const rightholder = this.waterfall.rightholders.find(r => r.id === permission.rightholderIds[0]);
      return { ...permission, rightholder }
    }))
  );
  public versions = this.shell.waterfall.versions;

  @Input() baseUrl: string;
  @Input() columns: Record<string, string> = {
    rightholder: 'Organization',
    org: 'Right holder',
    isAdmin: 'Access',
    lockedVersionId: 'Waterfall Version',
    actions: 'Actions'
  };

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private orgService: OrganizationService,
    private permissionService: WaterfallPermissionsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {

  }

  public async removeOrg(id: string) {
    if (this.orgService.org.id === id) {
      this.snackBar.open('You cannot remove yourself from the Waterfall.', 'close', { duration: 5000 });
      return;
    }
    await this.waterfallService.removeOrg(this.waterfall.id, id);
    this.snackBar.open('Right Holder removed from Waterfall.', 'close', { duration: 5000 });
  }

  public async changeAccess(id: string, role: 'editor' | 'viewer') {
    if (this.orgService.org.id === id) {
      this.snackBar.open('You cannot change your own access.', 'close', { duration: 5000 });
      return;
    }
    // TODO #9692 if rightholder have producer role => always admin/editor
    const permission = await this.permissionService.getValue(id, { waterfallId: this.waterfall.id });
    permission.isAdmin = role === 'editor';
    await this.permissionService.update(permission, { params: { waterfallId: this.waterfall.id } });
    this.snackBar.open('Access updated.', 'close', { duration: 5000 });
  }

  public async changeVersion(rightholderId: string, versionId: string) {
    // TODO #9692 distributor/directsales should always be on default version
    const rightholder = this.waterfall.rightholders.find(r => r.id === rightholderId);
    const version = this.versions.find(v => v.id === versionId);
    if (version.default) rightholder.lockedVersionId = '';
    else rightholder.lockedVersionId = versionId;
    const rightholders = this.shell.waterfall.rightholders.map(r => r.id === rightholderId ? rightholder : r);

    await this.waterfallService.update({ id: this.waterfall.id, rightholders });
    this.snackBar.open('Version updated', 'close', { duration: 3000 });
  }

  public changeRightholder(orgId: string, rightHolderId: string) {
    this.dialog.open(RightholderSelectModalComponent, {
      data: createModalData({
        waterfall: this.shell.waterfall,
        rightHolderId,
        onConfirm: async (id: string) => {
          if (id === rightHolderId) return;

          const permission = await this.permissionService.getValue(orgId, { waterfallId: this.waterfall.id });
          permission.rightholderIds = [id];
          // TODO #9692 if rightholder have producer role => always admin/editor
          // TODO #9692 distributor/directsales should always be on default version
          await this.permissionService.update(permission, { params: { waterfallId: this.waterfall.id } });
          this.snackBar.open('Right holder updated.', 'close', { duration: 5000 });
        }
      })
    });
  }
}

