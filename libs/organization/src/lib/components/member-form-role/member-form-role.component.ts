import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { UserRole, OrganizationService } from '../../+state';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx, ActionTx } from '@blockframes/ethers';
import { Router } from '@angular/router';
import { PermissionsQuery } from '../../permissions/+state';

@Component({
  selector: '[formGroup] member-form-role',
  templateUrl: './member-form-role.component.html',
  styleUrls: ['./member-form-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MemberFormRoleComponent {
  constructor(
    public controlContainer: ControlContainer,
    private service: OrganizationService,
    private walletService: WalletService,
    private permissionsQuery: PermissionsQuery,
    private router: Router,
  ) {}

  public get role() {
    return this.controlContainer.control.get('role');
  }

  public async changeRole(role: UserRole) {

    const userEmail = this.controlContainer.control.get('email').value;
    const userAddress = await this.service.getMemberAddress(userEmail);
    const orgAddress = await this.service.getAddress();
    let tx: ActionTx;
    let callback: () => void;

    if (role === UserRole.admin){
      callback = // TODO add superAdmin to permission
      tx = CreateTx.addAdmin(orgAddress, userAddress, callback)
    } else if (role === UserRole.member && this.permissionsQuery.superAdminCount >= 2) {
      callback = // TODO remove superAdmin from permission
      tx = CreateTx.removeAdmin(orgAddress, userAddress, callback);
    } else {
      throw new Error('You cannot remove the last Admin');
    }

    this.walletService.setTx(tx);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
