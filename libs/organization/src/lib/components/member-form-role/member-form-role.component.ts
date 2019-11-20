import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { OrganizationService, OrganizationQuery } from '../../+state';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx } from '@blockframes/ethers';
import { TxFeedback } from '@blockframes/ethers/types';
import { Router } from '@angular/router';
import { PermissionsQuery } from '../../permissions/+state/permissions.query';
import { AuthQuery } from '@blockframes/auth';
import { UserRole } from '@blockframes/permissions/types';

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
    private organizationQuery: OrganizationQuery,
    private walletService: WalletService,
    private permissionsQuery: PermissionsQuery,
    private authQuery: AuthQuery,
    private router: Router
  ) {}

  get control() {
    return this.controlContainer.control;
  }

  public get name() {
    return this.control.value.name;
  }

  public get role() {
    return this.control.get('role');
  }

  public get userId() {
    return this.control.value.uid;
  }

  /** Return false when the a Super Admin try to change the role of the last organization Super Admin. */
  public get canChangeRole() {
    const cannotChange =
      this.role.value === UserRole.superAdmin &&
      this.permissionsQuery.superAdminCount <= 1 &&
      this.permissionsQuery.getValue().roles[this.userId] === UserRole.superAdmin;
    return !cannotChange;
  }

  /** Display a message if a Super Admin is about to downgrade himself. */
  public get willDowngrade() {
    return (
      this.permissionsQuery.getValue().roles[this.authQuery.userId] === UserRole.superAdmin &&
      this.role.value !== UserRole.superAdmin &&
      this.userId === this.authQuery.userId
    );
  }

  /** Instantiate the transaction to destroy a member's wallet, then redirect to the send tunnel */
  public async destroyWallet() {
    const { email } = this.control.value;
    const userEthAddress = await this.service.getMemberEthAddress(email);
    const orgId = this.organizationQuery.getActiveId();
    const orgEthAddress = await this.service.getOrganizationEthAddress();

    const tx = CreateTx.destroyMember(orgEthAddress, userEthAddress);
    const feedback: TxFeedback = {
      confirmation: `You are about to destroy ${this.name}'s Wallet.`,
      success: `${this.name}'s Wallet has been successfully destroyed!`,
      redirectName: 'Back to Members',
      redirectRoute: `/layout/o/organization/${orgId}/members`
    };

    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
