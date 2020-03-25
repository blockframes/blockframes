import { DaoOperation, createOperation } from "../+state";
import { FormControl } from "@angular/forms";
import { FormList } from "@blockframes/utils/form/forms/list.form";
import { FormEntity } from "@blockframes/utils/form/forms/entity.form";

function createOperationControl(operation: Partial<DaoOperation> = {}) {
   const op = createOperation(operation.id, operation.name);
   return {
    id: new FormControl(op.id),
    name: new FormControl(op.name),
    quorum: new FormControl(op.quorum),
    members: new FormControl(op.members),
  };
}
export type OperationControl = ReturnType<typeof createOperationControl>;

export function createOperationFormList() {
  return FormList.factory([], (operation?: DaoOperation) => {
    const control = createOperationControl(operation);
    return new FormEntity<OperationControl>(control);
  });
}
