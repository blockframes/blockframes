import { FormList } from "@blockframes/utils";
import { OrganizationOperation } from "../+state";
import { FormGroup, FormControl, AbstractControl } from "@angular/forms";

// // To add in model
// function createOperation(operation: Partial<OrganizationOperation> = {}): OrganizationOperation {
//   return {
//     quorum: 0,
//     members: [],
//     ...operation,
//   } as OrganizationOperation
// }

function createOperationFormGroup(operation: OrganizationOperation) {
// function createOperationFormGroup(operation: Partial<OrganizationOperation> = {}) {
  // const { id, quorum, members } = createOperation(operation);
  return new FormGroup({
    id: new FormControl(operation.id),
    name: new FormControl(operation.name),
    quorum: new FormControl(operation.quorum),
    members: new FormControl(operation.members),
  });
}

export function createOperationFormList() {
  return FormList.factory([], createOperationFormGroup);
}
