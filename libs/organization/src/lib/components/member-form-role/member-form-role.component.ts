import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { UserRole, OrganizationService, OrganizationQuery, OrganizationMember } from '../../+state';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx, ActionTx, TxFeedback } from '@blockframes/ethers';
import { Router } from '@angular/router';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';

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
    private query: OrganizationQuery,
    private walletService: WalletService,
    private permissionsService: PermissionsService,
    private permissionsQuery: PermissionsQuery,
    private router: Router,
  ) {}

  public get name() {
    return this.controlContainer.control.get('name').value;
  }

  public get role() {
    return this.controlContainer.control.get('role');
  }

  public get canChangeRole() {
    const cannotChange =
      this.controlContainer.control.get('role').value === UserRole.admin
      && this.permissionsQuery.superAdminCount <= 1;
    return !cannotChange;
  }

  public async changeRole(role: UserRole) {
    if (!this.canChangeRole) {
      throw new Error('You can not change the role of the last Admin of an organization');
    }
    const uid = this.controlContainer.control.get('uid').value;
    const userEmail = this.controlContainer.control.get('email').value;
    const userAddress = await this.service.getMemberAddress(userEmail);
    const orgAddress = await this.service.getEthAddress();
    let tx: ActionTx;
    const callback = () => {
      const members = this.query.getValue().org.members
        .filter(member => member.uid !== uid)
        .map(member => {
          if (!member.role) {
            return {...member, role: this.permissionsQuery.isUserSuperAdmin(member.uid) ? UserRole.admin : UserRole.member} as OrganizationMember;
          }
          return member;
        });
      const memberToUpdate = this.query.getValue().org.members.find(member => member.uid === uid);

      const newMember: OrganizationMember = {...memberToUpdate, role};
      members.push(newMember);
      this.permissionsService.updateMembersRole(members);
    };

    const orgName = this.query.getValue().org.name;
    const orgId = this.query.id;
    let feedback: TxFeedback;
    if (role === UserRole.admin){
      tx = CreateTx.addAdmin(orgAddress, userAddress, callback);
      feedback = {
        confirmation: `You are about to promote ${this.name} as an Admin of ${orgName}`,
        success: `${this.name} has been successfully promoted to the Admin role !`,
        redirectName: 'Back to Administration',
        redirectRoute: `/layout/o/organization/${orgId}/members`,
      }
    } else if (role === UserRole.member && this.permissionsQuery.superAdminCount >= 2) {
      tx = CreateTx.removeAdmin(orgAddress, userAddress, callback);
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

  public async destroyWallet() {
    const userEmail = this.controlContainer.control.get('email').value;
    const userName = this.controlContainer.control.get('name').value;
    const userAddress = await this.service.getMemberAddress(userEmail);
    const orgId = this.query.id;
    const orgAddress = await this.service.getEthAddress();

    const tx = CreateTx.destroyMember(orgAddress, userAddress);
    const feedback: TxFeedback = {
      confirmation: `You are about to destroy ${userName}'s Wallet.`,
      success: `${userName}'s Wallet has been successfully destroyed!`,
      redirectName: 'Back to Members',
      redirectRoute: `/layout/o/organization/${orgId}/members`
    }

    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
