import { ControlContainer, FormGroup, FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OrganizationMember } from '../../+state';

@Component({
  selector: '[formGroup] organization-form-operation, [formGroupName] organization-form-operation',
  templateUrl: './organization-form-operation.component.html',
  styleUrls: ['./organization-form-operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationFormOperationComponent {

  @Input() members: OrganizationMember[];

  addMemberFrom: FormGroup;

  constructor(public controlContainer: ControlContainer) {
    this.addMemberFrom = new FormGroup({
      members: new FormControl('')
    });
  }

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

  public removeMember(id: string) {
    const members = this.control.get('members').value.filter(member => member.uid !== id);
    this.control.get('members').patchValue(members);
  }

  public addMember() {
    const addedMember: OrganizationMember = this.addMemberFrom.get('members').value;
    const members = this.control.get('members').value.filter(member => member.uid !== addedMember.uid);
    this.control.get('members').patchValue([...members, addedMember]);
    this.addMemberFrom.reset();
  }
}
