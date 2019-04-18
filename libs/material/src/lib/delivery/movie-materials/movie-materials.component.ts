import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { Material } from '../../material/+state';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryService } from '../+state/delivery.service';
import { DeliveryQuery } from '../+state';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit {

  public movie$: Observable<Movie>;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  constructor(
    private movieQuery: MovieQuery,
    private location: Location,
    private deliveryService: DeliveryService,
    private deliveryQuery: DeliveryQuery,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
    ) {
      this.matIconRegistry.addSvgIcon(
        'accepted',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/accepted.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'available',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/available.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'delivered',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/delivered.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'disabled',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/disabled.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'enabled',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/remove_red_eye.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'filter',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/filter.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'library_books',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/library_books.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'not_payed',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/not-payed.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'order',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/order.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'payed',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/payed.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'pending',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/pending.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'picture_as_pdf',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/picture_as_pdf.svg')
      );
      this.matIconRegistry.addSvgIcon(
        'refused',
        this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/refused.svg')
      );
     }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.materials$ = this.deliveryQuery.materialsByActiveMovie$;
    this.progressionValue$ = this.deliveryQuery.movieProgression$;
  }

  public deliveredToggle(material: Material, movieId: string) {
    this.deliveryService
      .deliveredToggle(material, movieId)
      .catch(err => console.log(err));
  }

  public goBack() {
    this.location.back();
  }

}
