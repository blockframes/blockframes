import { ControlContainer, FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationMember, OrganizationQuery, OrganizationService } from '../../+state';
import { WalletService } from 'libs/ethers/src/lib/wallet/+state';
import { Router } from '@angular/router';

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
    public serv: OrganizationQuery,
    public service: OrganizationService,
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
    const removedMember = this.control.get('members').value.find(member => member.uid === id);
    const members = this.control.get('members').value.filter(member => member.uid !== id);
    this.control.get('members').patchValue(members);

    const memberAddress = await this.service.getMemberAddress(removedMember.email);
    const orgAddress = await this.service.getAddress();
    const operationId = this.control.get('id').value;
    this.service.setRemoveMemeberTx(orgAddress, operationId, memberAddress);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public async addMember() {
    const addedMember: OrganizationMember = this.addMemberFrom.value;
    const members = this.control.get('members').value.filter(member => member.uid !== addedMember.uid);
    this.control.get('members').patchValue([...members, addedMember]);
    this.addMemberFrom.reset();

    const memberAddress = await this.service.getMemberAddress(addedMember.email);
    const orgAddress = await this.service.getAddress();
    const operationId = this.control.get('id').value;
    this.service.setAddMemeberTx(orgAddress, operationId, memberAddress);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }

  public async updateQuorum() {
    const orgAddress = await this.service.getAddress();
    const operationId = this.control.get('id').value;
    const newQuorum = this.control.get('quorum').value;
    this.service.setUpdateQuorumTx(orgAddress, operationId, newQuorum);
    this.router.navigateByUrl('/layout/o/account/wallet/send');
  }
}
