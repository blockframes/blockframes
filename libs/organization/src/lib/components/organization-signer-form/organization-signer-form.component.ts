import { ControlContainer } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'organization-signer-form',
  templateUrl: './organization-signer-form.component.html',
  styleUrls: ['./organization-signer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerFormComponent {

  constructor(public controlContainer: ControlContainer) { }

  /** TODO(PL): This component should take in a form that
   *  that listen on the save icon button click event from the sidenav. 
   */
}
