import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FirestoreQueryForm } from './firestore.schema';



@Component({
  selector: 'form-firestore',
  templateUrl: './firestore.component.html',
  styleUrls: ['./firestore.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirestoreComponent {

  @Input() form: FirestoreQueryForm;

  get schema() {
    return this.form.schema;
  }
}

