import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'catalog-contact-page',
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContactPageComponent implements OnInit {
  public form = new FormGroup({
    subject: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required)
  });

  public center: google.maps.LatLngLiteral;
  public markerLabel: {};

  ngOnInit() {
    this.center = { lat: 48.8682044, lng: 2.3334083};
    this.markerLabel = {
      color: 'red',
      text: '59 Passage Choiseul',
    }
  }
  public sendMessage() {
  }
}
