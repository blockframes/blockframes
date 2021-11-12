import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { OrganizationService } from "../+state/organization.service";

@Pipe({ name: 'getOrg' })
export class GetOrgPipe implements PipeTransform {
  constructor(private service: OrganizationService) {}
  transform(orgId: string) {
    if (!orgId) return;
    return this.service.valueChanges(orgId);
  }
}

@NgModule({
  declarations: [GetOrgPipe],
  exports: [GetOrgPipe]
})
export class GetOrgPipeModule{}
