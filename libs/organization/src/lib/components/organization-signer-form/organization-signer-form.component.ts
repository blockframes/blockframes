import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationOperation, OrganizationService, OrganizationQuery } from '../../+state';
import { MatSlideToggleChange } from '@angular/material';
import { PermissionsQuery } from '../../permissions/+state';
import { Router } from '@angular/router';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { ActionTx, TxFeedback } from '@blockframes/ethers/types';
import { CreateTx } from '@blockframes/ethers';
import { OrganizationMember } from '../../member/+state/member.model';

@Component({
  selector: 'organization-signer-form',
  templateUrl: './organization-signer-form.component.html',
  styleUrls: ['./organization-signer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationSignerFormComponent {

  @Input() member: OrganizationMember;

  constructor(
    public controlContainer: ControlContainer,
    private permissionQuery: PermissionsQuery,
    private service: OrganizationService,
    private query: OrganizationQuery,
    private router: Router,
    private walletService: WalletService,
  ) { }

  public get control() {
    return this.controlContainer.control;
  }

  public get isAdmin() {
    return this.permissionQuery.isUserAdmin(this.member.uid);
  }

  isSelected(operation: OrganizationOperation) {
    return operation.members.some(operationMember => operationMember.uid === this.member.uid) || this.isAdmin;
  }

  public async toggleSelection(toggle: MatSlideToggleChange, id: string) {
    const operations: OrganizationOperation[] = this.control.value.filter(operation => operation.id !== id);
    const currentOperation: OrganizationOperation = this.control.value.find(operation => operation.id === id);
    const members: OrganizationMember[] = currentOperation.members.filter(operationMember => operationMember.uid !== this.member.uid);
    if (toggle.checked) {
      members.push(this.member);
    }
    currentOperation.members = members;
    this.control.patchValue([...operations, currentOperation]);

    const memberEthAddress = await this.service.getMemberEthAddress(this.member.email);
    const orgEthAddress = await this.service.getOrganizationEthAddress();
    const memberName = this.member.name;
    const operationName = currentOperation.name;
    const orgId = this.query.getActiveId();

    let tx: ActionTx;
    let feedback: TxFeedback;
    if(toggle.checked) {
      tx = CreateTx.addMember(orgEthAddress, id, memberEthAddress);
      feedback = {
        confirmation: `You are about to whitelist ${memberName} for ${operationName}`,
        success: `${memberName} has been successfully whitelisted !`,
        redirectName: 'Back to Administration',
        redirectRoute: `/layout/o/organization/${orgId}/administration`,
      }
    } else {
      tx = CreateTx.removeMember(orgEthAddress, id, memberEthAddress);
      feedback = {
        confirmation: `You are about to blacklist ${memberName} for ${operationName}`,
        success: `${memberName} has been successfully blacklisted !`,
        redirectName: 'Back to Administration',
        redirectRoute: `/layout/o/organization/${orgId}/administration`,
      }
    }

    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
