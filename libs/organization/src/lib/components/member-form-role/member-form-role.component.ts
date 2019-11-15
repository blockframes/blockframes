import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { OrganizationService, OrganizationQuery } from '../../+state';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx } from '@blockframes/ethers';
import { ActionTx, TxFeedback } from '@blockframes/ethers/types';
import { Router } from '@angular/router';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';
import { MemberQuery } from '../../member/+state/member.query';
import { UserRole, OrganizationMember } from '../../member/+state/member.model';

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
    private query: MemberQuery,
    private walletService: WalletService,
    private permissionsService: PermissionsService,
    private permissionsQuery: PermissionsQuery,
    private router: Router,
  ) {}

  get control() {
    return this.controlContainer.control;
  }

  public get name() {
    const {name} = this.control.value;
    return name;
  }

  public get role() {
    return this.control.get('role');
  }

  public get canChangeRole() {
    const cannotChange =
      this.role.value === UserRole.admin
      && this.permissionsQuery.superAdminCount <= 1;
    return !cannotChange;
  }

  public async changeRole(role: UserRole) {
    if (!this.canChangeRole) {
      throw new Error('You can not change the role of the last Admin of an organization');
    }
    const { uid, email } = this.control.value;
    const userEthAddress = await this.service.getMemberEthAddress(email);
    const orgEthAddress = await this.service.getOrganizationEthAddress();
    let tx: ActionTx;
    const callback = () => {
      const members = this.query.getAll()
        .filter(member => member.uid !== uid)
        .map(member => {
          if (!member.role) {
            return {...member, role: this.permissionsQuery.isUserSuperAdmin(member.uid) ? UserRole.admin : UserRole.member} as OrganizationMember;
          }
          return member;
        });
      const memberToUpdate = this.query.getAll().find(member => member.uid === uid);

      const newMember: OrganizationMember = {...memberToUpdate, role};
      members.push(newMember);
      this.permissionsService.updateMembersRole(members);
    };

    const orgName = this.organizationQuery.getActive().name;
    const orgId = this.organizationQuery.id;
    let feedback: TxFeedback;
    if (role === UserRole.admin){
      tx = CreateTx.addAdmin(orgEthAddress, userEthAddress, callback);
      feedback = {
        confirmation: `You are about to promote ${this.name} as an Admin of ${orgName}`,
        success: `${this.name} has been successfully promoted to the Admin role !`,
        redirectName: 'Back to Administration',
        redirectRoute: `/layout/o/organization/${orgId}/members`,
      }
    } else if (role === UserRole.member && this.permissionsQuery.superAdminCount >= 2) {
      tx = CreateTx.removeAdmin(orgEthAddress, userEthAddress, callback);
      feedback = {
        confirmation: `You are about to revoke ${this.name} as an Admin of ${orgName}`,
        success: `${this.name} has been successfully revoked from the Admin role !`,
        redirectName: 'Back to Administration',
        redirectRoute: `/layout/o/organization/${orgId}/members`,
      }
    }

    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  /** Instantiate the transaction to destroy a member's wallet, then redirect to the send tunnel */
  public async destroyWallet() {
    const { email } = this.control.value;
    const userEthAddress = await this.service.getMemberEthAddress(email);
    const orgId = this.organizationQuery.id;
    const orgEthAddress = await this.service.getOrganizationEthAddress();

    const tx = CreateTx.destroyMember(orgEthAddress, userEthAddress);
    const feedback: TxFeedback = {
      confirmation: `You are about to destroy ${this.name}'s Wallet.`,
      success: `${this.name}'s Wallet has been successfully destroyed!`,
      redirectName: 'Back to Members',
      redirectRoute: `/layout/o/organization/${orgId}/members`
    }

    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
