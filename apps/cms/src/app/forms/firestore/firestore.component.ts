import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { createForms } from 'ng-form-factory';
import { FirestoreQueryForm, methodSchema } from './firestore.schema';



@Component({
  selector: 'form-firestore',
  templateUrl: './firestore.component.html',
  styleUrls: ['./firestore.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirestoreComponent {

  @Input() form: FirestoreQueryForm;
  method = createForms(methodSchema);
  get schema() {
    return this.form.schema;
  }

  add() {
    const method = this.method.value;
    this.form.add({ method });
    this.method.reset();
  }
}

