import { ChangeDetectionStrategy, Component, Inject, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { App } from "@blockframes/model";
import { APP } from "@blockframes/utils/routes/utils";

@Component({
  selector: 'hide-email',
  templateUrl: './hide-email.component.html',
  styleUrls: ['./hide-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HideEmailComponent {
  @Input() control: FormControl;
  
  constructor (
    @Inject(APP) public currentApp: App
  ) { }

  toggle(event) {
    this.control.markAsDirty();
    this.control.setValue(event.checked);
  }
}
