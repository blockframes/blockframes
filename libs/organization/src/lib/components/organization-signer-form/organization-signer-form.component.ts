import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationOperation, OrganizationMember, OrganizationService } from '../../+state';
import { MatSlideToggleChange } from '@angular/material';
import { PermissionsQuery } from '../../permissions/+state';
import { Router } from '@angular/router';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx } from '@blockframes/ethers';

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
    private router: Router,
    private walletService: WalletService,
  ) { }

  public get control() {
    return this.controlContainer.control;
  }

  public get isAdmin() {
    return this.permissionQuery.isUserSuperAdmin(this.member.uid);
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

    const memberAddress = await this.service.getMemberAddress(this.member.email);
    const orgAddress = await this.service.getAddress();

    toggle.checked
      ? this.walletService.setTx(CreateTx.addMember(orgAddress, id, memberAddress))
      : this.walletService.setTx(CreateTx.removeMember(orgAddress, id, memberAddress));

    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}