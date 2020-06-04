import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { populateMovieLanguageSpecification, MovieService, } from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { SSF } from 'xlsx';
import { createDistributionRight, createHoldback } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createTerms } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RightsImportState } from '../../../import-utils';
import { AuthQuery } from '@blockframes/auth/+state';

enum SpreadSheetDistributionRight {
  internalRef,
  distributionRightId,
  internationalTitle, // unused
  licensorName, // unused
  licenseeName, // unused
  rightsStart,
  rightsEnd,
  territories,
  territoriesExcluded,
  licenseType,
  dubbings,
  subtitles,
  captions,
  exclusive,
  catchUpStartDate,
  catchUpEndDate,
  multidiffusion,
  holdbacks
}


@Component({
  selector: 'import-view-extracted-rights',
  templateUrl: './view-extracted-rights.component.html',
  styleUrls: ['./view-extracted-rights.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedRightsComponent implements OnInit {

  public rights = new MatTableDataSource<RightsImportState>();
  private separator = ';';
  private subSeparator = ',';
  private deepDatesRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4})$/;
  public isUserBlockframesAdmin = false;

  constructor(
    @Optional() private intercom: Intercom,
    private movieService: MovieService,
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }


  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(async spreadSheetRow => {

      if (spreadSheetRow[SpreadSheetDistributionRight.internalRef]) {
        const movie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetDistributionRight.internalRef]);
        const distributionRight = createDistributionRight();

        const importErrors = {
          distributionRight,
          errors: [],
          movieInternalRef: spreadSheetRow[SpreadSheetDistributionRight.internalRef],
          movieTitle: movie ? movie.main.title.original : undefined,
          movieId: movie ? movie.id : undefined
        } as RightsImportState;

        if (movie) {

          if (spreadSheetRow[SpreadSheetDistributionRight.distributionRightId]) {
            distributionRight.id = spreadSheetRow[SpreadSheetDistributionRight.distributionRightId];
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'distributionright.id',
              name: 'Id',
              reason: 'Required field is missing',
              hint: 'Edit corresponding sheet field.'
            });
          }

          /////////////////
          // CONTRACT STUFF
          /////////////////

          // Retreive the contract that will handle the rights
          const contract = await this.contractService.getContractFromRight(movie.id, distributionRight.id);
          if (contract) {

            distributionRight.contractId = contract.id;

            /////////////////
            // LICENSE STUFF
            /////////////////

            /* LICENSOR */

            // Nothing to do. Should be the same infos already filled in previously imported contract sheet

            /* LICENSEE */

            // Nothing to do. Should be the same infos already filled in previously imported contract sheet

            /////////////////
            // TERMS STUFF
            /////////////////

            // BEGINNING OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionRight.rightsStart]) {
              const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionRight.rightsStart]);
              const dateStart = new Date(`${y}-${m}-${d}`);
              if (isNaN(dateStart.getTime())) { // ie invalid date
                distributionRight.terms.approxStart = spreadSheetRow[SpreadSheetDistributionRight.rightsStart];
              } else {
                distributionRight.terms.start = dateStart
              }
            }

            // END OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionRight.rightsEnd]) {
              const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionRight.rightsEnd]);
              const dateEnd = new Date(`${y}-${m}-${d}`);
              if (isNaN(dateEnd.getTime())) { // ie invalid date
                distributionRight.terms.approxEnd = spreadSheetRow[SpreadSheetDistributionRight.rightsEnd];
              } else {
                distributionRight.terms.end = dateEnd
              }
            }

            // TERRITORIES (Mandate Territories)
            if (spreadSheetRow[SpreadSheetDistributionRight.territories]) {
              distributionRight.territory = [];
              spreadSheetRow[SpreadSheetDistributionRight.territories].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
                const territory = getCodeIfExists('TERRITORIES', c);
                if (territory) {
                  distributionRight.territory.push(territory);
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'territories',
                    name: 'Territories sold',
                    reason: `${c} not found in territories list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // TERRITORIES EXCLUDED
            if (spreadSheetRow[SpreadSheetDistributionRight.territoriesExcluded]) {
              distributionRight.territoryExcluded = [];
              spreadSheetRow[SpreadSheetDistributionRight.territoriesExcluded].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
                const territory = getCodeIfExists('TERRITORIES', c);
                if (territory) {
                  distributionRight.territoryExcluded.push(territory);
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'territories excluded',
                    name: 'Territories excluded',
                    reason: `${c} not found in territories list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // MEDIAS (Mandate Medias)
            if (spreadSheetRow[SpreadSheetDistributionRight.licenseType]) {
              distributionRight.licenseType = [];
              spreadSheetRow[SpreadSheetDistributionRight.licenseType].split(this.separator).forEach((c: ExtractCode<'MEDIAS'>) => {
                const media = getCodeIfExists('MEDIAS', c);
                if (media) {
                  distributionRight.licenseType.push(media);
                } else {
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'medias',
                    name: 'Media(s)',
                    reason: `${c} not found in medias list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // DUBS (Authorized language(s))
            if (spreadSheetRow[SpreadSheetDistributionRight.dubbings]) {
              spreadSheetRow[SpreadSheetDistributionRight.dubbings].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
                const dubbing = getCodeIfExists('LANGUAGES', g);
                if (dubbing) {
                  distributionRight.assetLanguage = populateMovieLanguageSpecification(
                    distributionRight.assetLanguage,
                    dubbing,
                    'dubbed'
                  );
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'dubbing',
                    name: 'Authorized language(s)',
                    reason: `${g} not found in languages list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });

            }

            // SUBTILES (Available subtitle(s))
            if (spreadSheetRow[SpreadSheetDistributionRight.subtitles]) {
              spreadSheetRow[SpreadSheetDistributionRight.subtitles].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
                const subtitle = getCodeIfExists('LANGUAGES', g);
                if (!!subtitle) {
                  distributionRight.assetLanguage = populateMovieLanguageSpecification(
                    distributionRight.assetLanguage,
                    subtitle,
                    'subtitle'
                  );
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'subtitle',
                    name: 'Authorized subtitle(s)',
                    reason: `${g} not found in languages list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // CAPTIONS (Available subtitle(s))
            if (spreadSheetRow[SpreadSheetDistributionRight.captions]) {
              spreadSheetRow[SpreadSheetDistributionRight.captions].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
                const caption = getCodeIfExists('LANGUAGES', g);
                if (!!caption) {
                  distributionRight.assetLanguage = populateMovieLanguageSpecification(
                    distributionRight.assetLanguage,
                    caption,
                    'caption'
                  );
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'caption',
                    name: 'Authorized caption(s)',
                    reason: `${g} not found in languages list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // STATUS
            distributionRight.status = 'draft';

            // EXCLUSIVE RIGHT
            if (spreadSheetRow[SpreadSheetDistributionRight.exclusive]) {
              distributionRight.exclusive = spreadSheetRow[SpreadSheetDistributionRight.exclusive].toLowerCase() === 'yes' ? true : false;
            }

            // CATCH UP
            if (spreadSheetRow[SpreadSheetDistributionRight.catchUpStartDate] || spreadSheetRow[SpreadSheetDistributionRight.catchUpEndDate]) {
              distributionRight.catchUp = createTerms();

              // CATCH UP START
              if (spreadSheetRow[SpreadSheetDistributionRight.catchUpStartDate]) {
                const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionRight.catchUpStartDate]);
                const catchUpStartDate = new Date(`${y}-${m}-${d}`);
                if (isNaN(catchUpStartDate.getTime())) {
                  distributionRight.catchUp.approxStart = spreadSheetRow[SpreadSheetDistributionRight.catchUpStartDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionRight.catchUp.start',
                    name: 'CatchUp start',
                    reason: `Failed to parse CatchUp start date : ${spreadSheetRow[SpreadSheetDistributionRight.catchUpStartDate]}, moved data to approxStart`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  distributionRight.catchUp.start = catchUpStartDate;
                }
              }

              // CATCH UP END
              if (spreadSheetRow[SpreadSheetDistributionRight.catchUpEndDate]) {
                const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionRight.catchUpEndDate]);
                const catchUpEndDate = distributionRight.catchUp.end = new Date(`${y}-${m}-${d}`);
                if (isNaN(catchUpEndDate.getTime())) {
                  distributionRight.catchUp.approxEnd = spreadSheetRow[SpreadSheetDistributionRight.catchUpEndDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionRight.catchUp.end',
                    name: 'CatchUp end',
                    reason: `Failed to parse CatchUp end date : ${spreadSheetRow[SpreadSheetDistributionRight.catchUpEndDate]}, moved data to approxEnd`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  distributionRight.catchUp.end = catchUpEndDate;
                }
              }
            }

            // MULTIDIFFUSION
            if (spreadSheetRow[SpreadSheetDistributionRight.multidiffusion]) {
              const multiDiffDates = spreadSheetRow[SpreadSheetDistributionRight.multidiffusion].split(this.separator)
              multiDiffDates.forEach(date => {
                const dateParts = date.trim().match(this.deepDatesRegex);
                let diffusionDate;
                if (dateParts && dateParts.length === 4) {
                  diffusionDate = new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`);
                }

                const diffusion = createTerms();

                if (isNaN(diffusionDate.getTime())) {
                  diffusion.approxStart = date;
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'multidiffusion.start',
                    name: 'Multidiffusion start',
                    reason: `Failed to parse multidiffusion start date : ${date}, moved data to approxStart`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  diffusion.start = diffusionDate;
                }

                distributionRight.multidiffusion.push(diffusion);
              });
            }

            // HOLDBACKS
            if (spreadSheetRow[SpreadSheetDistributionRight.holdbacks]) {
              const holdbacks = spreadSheetRow[SpreadSheetDistributionRight.holdbacks].split(this.separator)
              holdbacks.forEach(h => {
                const holdbackParts = h.split(this.subSeparator);
                const media = getCodeIfExists('MEDIAS', holdbackParts[0] as ExtractCode<'MEDIAS'>);

                if (holdbackParts.length !== 3) {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'holdback',
                    name: 'Holdback',
                    reason: `Failed to parse holdback entry`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  const holdBack = createHoldback();
                  if (media) {
                    holdBack.media = media;
                  } else {
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.media',
                      name: 'Holdback',
                      reason: `${holdbackParts[0]} not found in medias list`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  }

                  const holdBackStartParts = holdbackParts[1].trim().match(this.deepDatesRegex);
                  let holdBackStart;
                  if (holdBackStartParts && holdBackStartParts.length === 4) {
                    holdBackStart = new Date(`${holdBackStartParts[3]}-${holdBackStartParts[2]}-${holdBackStartParts[1]}`);
                  }

                  if (isNaN(holdBackStart.getTime())) {
                    holdBack.terms.approxStart = holdbackParts[1].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.start',
                      name: 'Holdback start',
                      reason: `Failed to parse holdback start date : ${holdbackParts[1].trim()}, moved data to approxStart`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    holdBack.terms.start = holdBackStart;
                  }

                  const holdBackEndParts = holdbackParts[2].trim().match(this.deepDatesRegex);
                  let holdBackEnd;
                  if (holdBackEndParts && holdBackEndParts.length === 4) {
                    holdBackEnd = new Date(`${holdBackEndParts[3]}-${holdBackEndParts[2]}-${holdBackEndParts[1]}`);
                  }

                  if (isNaN(holdBackEnd.getTime())) {
                    holdBack.terms.approxEnd = holdbackParts[2].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.end',
                      name: 'Holdback end',
                      reason: `Failed to parse holdback end date : ${holdbackParts[2].trim()}, moved data to approxEnd`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    holdBack.terms.end = holdBackEnd;
                  }

                  distributionRight.holdbacks.push(holdBack)
                }

              });
            }

            // Checks if sale already exists
            const existingRight = await this.distributionRightService.getValue(distributionRight.id)
            if (existingRight) {
              importErrors.errors.push({
                type: 'error',
                field: 'distributionRight',
                name: 'Distribution right',
                reason: 'Distribution right already added',
                hint: 'Distribution right already added'
              });
            }
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'contract',
              name: 'Contract',
              reason: `No contract found matching movieId: ${movie.id} and rightId: ${distributionRight.id}`,
              hint: 'Try importing it first or check if data is correct.'
            });
          }
        } else {
          importErrors.errors.push({
            type: 'error',
            field: 'internalRef',
            name: 'Movie',
            reason: `Movie ${spreadSheetRow[SpreadSheetDistributionRight.internalRef]} not found`,
            hint: 'Try importing it first or check if data is correct.'
          });
        }

        const saleWithErrors = await this.validateMovieRight(importErrors);
        this.rights.data.push(saleWithErrors);
        this.rights.data = [... this.rights.data];

        this.cdRef.markForCheck();
      }

    });
  }

  private async validateMovieRight(importErrors: RightsImportState): Promise<RightsImportState> {
    const distributionRight = importErrors.distributionRight;
    const errors = importErrors.errors;

    // No movie found
    if (!importErrors.movieTitle) {
      return importErrors;
    }

    //////////////////
    // REQUIRED FIELDS
    //////////////////

    // BEGINNING OF RIGHTS
    if (!distributionRight.terms.start) {
      errors.push({
        type: 'error',
        field: 'rights.from',
        name: 'Beginning of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // END OF RIGHTS
    if (!distributionRight.terms.end) {
      errors.push({
        type: 'error',
        field: 'rights.to',
        name: 'End of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // TERRITORIES
    if (!distributionRight.territory) {
      errors.push({
        type: 'error',
        field: 'territory',
        name: 'Territories sold',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // TERRITORIES EXCLUDED
    if (!distributionRight.territoryExcluded) {
      errors.push({
        type: 'warning',
        field: 'territoryExcluded',
        name: 'Territories excluded',
        reason: 'Optionnal field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // LICENSE TYPE
    if (!distributionRight.licenseType) {
      errors.push({
        type: 'error',
        field: 'medias',
        name: 'Media(s)',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // DUBBINGS
    if (!Object.keys(distributionRight.assetLanguage).length) {
      errors.push({
        type: 'error',
        field: 'dubbings',
        name: 'Authorized language(s)',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // EXCLUSIVE
    if (distributionRight.exclusive === undefined) {
      errors.push({
        type: 'error',
        field: 'exclusive',
        name: 'Exclusive right',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    return importErrors;
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.rights.data = [];
  }
}
