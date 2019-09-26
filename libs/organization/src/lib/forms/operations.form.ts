import { FormList, FormEntity } from "@blockframes/utils/form";
import { OrganizationOperation, createOperation } from "../+state";
import { FormControl } from "@angular/forms";

function createOperationControl(operation: Partial<OrganizationOperation> = {}) {
   const op = createOperation(operation);
   return {
    id: new FormControl(op.id),
    name: new FormControl(op.name),
    quorum: new FormControl(op.quorum),
    members: new FormControl(op.members),
  };
}
export type OperationControl = ReturnType<typeof createOperationControl>;

export function createOperationFormList() {
  return FormList.factory([], (operation: OrganizationOperation) => {
    const control = createOperationControl(operation);
    return new FormEntity(control);
  });
}
