
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NegotitationForm } from '../form';

@Component({
  selector: 'negotiation-form',
  templateUrl: 'negotiation-form.component.html',
  styleUrls: ['./negotiation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationFormComponent {
  @Input() form: NegotitationForm

}
