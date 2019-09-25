import { ControlContainer, FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationMember, OrganizationService, OrganizationQuery } from '../../+state';
import { Router } from '@angular/router';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { CreateTx } from '@blockframes/ethers';

@Component({
  selector: '[formGroup] organization-form-operation, [formGroupName] organization-form-operation',
  templateUrl: './organization-form-operation.component.html',
  styleUrls: ['./organization-form-operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationFormOperationComponent {

  @Input() members: OrganizationMember[];

  addMemberFrom = new FormControl('');

  constructor(
    public router: Router,
    public controlContainer: ControlContainer,
    public walletService: WalletService,
    public service: OrganizationService,
    public query: OrganizationQuery,
  ) { }

  public get control() {
    return this.controlContainer.control;
  }

  public get amounts() {
    return Array(this.control.get('members').value.length).fill(0).map( (_, i) => i+1);
  }

  public get unauthorizedMembers() {
    return this.members.filter(member =>
     !this.control.get('members').value.some(authorized => member.uid === authorized.uid)
    );
  }

  public async removeMember(id: string) {
    const removedMember = this.control.get('members').value.find(member => member.uid === id) as OrganizationMember;
    const members = this.control.get('members').value.filter(member => member.uid !== id);
    this.control.get('members').patchValue(members);

    const memberAddress = await this.service.getMemberAddress(removedMember.email);
    const orgAddress = await this.service.getEthAddress();
    const operationId = this.control.get('id').value;
    const operationName = this.control.get('name').value;
    const orgId = this.query.id;
    const tx = CreateTx.addMember(orgAddress, operationId, memberAddress);
    const feedback = {
      confirmation: `You are about to blacklist ${removedMember.name} for ${operationName}`,
      success: `${removedMember.name} has been successfully blacklisted !`,
      redirectName: 'Back to Administration',
      redirectRoute: `/layout/o/organization/${orgId}/administration`,
    }
    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public async addMember() {
    const addedMember: OrganizationMember = this.addMemberFrom.value;
    const members = this.control.get('members').value.filter(member => member.uid !== addedMember.uid);
    this.control.get('members').patchValue([...members, addedMember]);
    this.addMemberFrom.reset();

    const memberAddress = await this.service.getMemberAddress(addedMember.email);
    const orgAddress = await this.service.getEthAddress();
    const operationId = this.control.get('id').value;
    const operationName = this.control.get('name').value;
    const orgId = this.query.id;
    const tx = CreateTx.addMember(orgAddress, operationId, memberAddress);
    const feedback = {
      confirmation: `You are about to whitelist ${addedMember.name} for ${operationName}`,
      success: `${addedMember.name} has been successfully whitelisted !`,
      redirectName: 'Back to Administration',
      redirectRoute: `/layout/o/organization/${orgId}/administration`,
    }
    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public async updateQuorum() {
    const orgAddress = await this.service.getEthAddress();
    const operationId = this.control.get('id').value;
    const newQuorum = this.control.get('quorum').value;
    const operationName = this.control.get('name').value;
    const orgId = this.query.id;
    const tx = CreateTx.modifyQuorum(orgAddress, operationId, newQuorum);
    const feedback = {
      confirmation: `You are about to set the quorum for ${operationName} to ${newQuorum}`,
      success: 'The quorum has been successfully updated !',
      redirectName: 'Back to Administration',
      redirectRoute: `/layout/o/organization/${orgId}/administration`,
    }
    this.walletService.setTx(tx);
    this.walletService.setTxFeedback(feedback);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
