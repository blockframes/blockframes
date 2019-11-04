/** import { MatCarouselModule } from '@ngmodule/material-carousel';
import { MarketplaceHomeComponent } from './home.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator/jest';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

describe('Example test for spectator', () => {
  let spectator: Spectator<MarketplaceHomeComponent>;
  const createComponent = createComponentFactory({
      component: MarketplaceHomeComponent,
      imports: [MatCarouselModule, FlexLayoutModule, MatIconModule, TranslateSlugModule ]
  });

  beforeEach(() => (spectator = createComponent()));

  it('should return a "row" if number "2" is insert in layout function', () => {
      expect(spectator.component.layout(2)).toBe('row');
  });
}); */

test('smoke', () => {
  expect(true).toBeTruthy();
});


