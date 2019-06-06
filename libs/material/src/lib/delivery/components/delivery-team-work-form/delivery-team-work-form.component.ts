import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryService } from '../../+state';

@Component({
  selector: 'delivery-team-work-form',
  templateUrl: './delivery-team-work-form.component.html',
  styleUrls: ['./delivery-team-work-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkFormComponent implements OnInit {
  @Input() stakeholder: Stakeholder;
  @Output() cancelForm = new EventEmitter();
  public roles = ['Producer', 'International Seller', 'Distributor', 'Laboratory'];
  public authorizations = ['canValidateDelivery', 'canModifyDelivery', 'canDeliverMaterial', 'canAcceptMaterial', 'canRefuseMaterial'];
  public stakeholderAuthorizations: string[];

  constructor(private service: DeliveryService,) { }

  ngOnInit() {
    this.stakeholderAuthorizations = [...this.stakeholder.authorizations];
  }

  public addAuthorization(authorization: string) {
    if (!this.stakeholderAuthorizations.includes(authorization))
      this.stakeholderAuthorizations = [...this.stakeholderAuthorizations, authorization];
  }

  public removeAuthorization(index: number) {
    this.stakeholderAuthorizations.splice(index, 1);
  }

  public updateStakeholderAuthorizations() {
    this.service.updateStakeholderAuthorizations(this.stakeholder.id, this.stakeholderAuthorizations);
    this.cancel();
  }

  public cancel() {
    this.cancelForm.emit();
  }

}
