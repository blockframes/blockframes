import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'catalog-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContactPageComponent {
  public form = new FormGroup({
    subject: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required)
  });

  public sendMessage() {
  }
}
