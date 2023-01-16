import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { InformationComponent } from './information.component';
import { UserCardModule } from '@blockframes/user/components/card/card.module';
import { OrgAddressModule } from '../../pipes/org-address.pipe';

@NgModule({
  declarations: [InformationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UserCardModule,
    OrgAddressModule,
    RouterModule.forChild([{ path: '', component: InformationComponent }])
  ]
})
export class OrganizationInformationModule { }
