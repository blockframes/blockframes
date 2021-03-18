import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { createMandate, createSale, Mandate, Sale } from '@blockframes/contract/contract/+state/contract.model';
import { createTerm } from '@blockframes/contract/term/+state/term.model';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Intercom } from 'ng-intercom';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractsImportState } from '../../../import-utils';
import { AuthQuery } from '@blockframes/auth/+state';
import { Organization, OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { Language, LanguageValue, MediaValue, TerritoryValue } from '@blockframes/utils/static-model';
import { TermService } from '@blockframes/contract/term/+state/term.service'
import { Term } from '@blockframes/contract/term/+state/term.model';
import { AngularFirestore } from '@angular/fire/firestore';

enum SpreadSheetContract {
  internationalTitle,
  contractType,
  licensorName,
  licenseeName,
  territories,
  medias,
  exclusive,
  startOfContract,
  endOfContract,
  originalLanguageLicensed,
  dubbed,
  subtitled,
  closedCaptioning,
  contractId,
  parentTermId,
  titleId,
  stakeholders,
}

@Component({
  selector: 'import-view-extracted-contracts',
  templateUrl: './view-extracted-contracts.component.html',
  styleUrls: ['./view-extracted-contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedContractsComponent implements OnInit {

  public contractsToUpdate = new MatTableDataSource<ContractsImportState>();
  public contractsToCreate = new MatTableDataSource<ContractsImportState>();
  private separator = ';';
  public isUserBlockframesAdmin = false;

  constructor(
    @Optional() private intercom: Intercom,
    private snackBar: MatSnackBar,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
    private termService: TermService,
    private fire: AngularFirestore
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');
    console.log(sheetTab.rows)
    for (const spreadSheetRow of sheetTab.rows) {
      const trimmedRow = spreadSheetRow.map(cell => {
        if (typeof cell === 'string') cell.trim()
        return cell
      })
      let contract: Mandate | Sale;
      let newContract = true;
      const id = this.fire.createId();
      if (trimmedRow[SpreadSheetContract.contractId]) {
        const existingContract = await this.contractService.getValue(trimmedRow[SpreadSheetContract.contractId] as string);
        if (!!existingContract) {
          contract = existingContract.type === 'mandate' ? createMandate(existingContract as Mandate) : createSale(existingContract as Sale)
          newContract = false;
          const terms = await this.termService.getValue(contract.termIds);
          const parsedTerms = terms.map(createTerm)
          this.contractsToUpdate.data.push({ contract, newContract: false, errors: [], terms: parsedTerms })
          // Forcing change detection
          this.contractsToUpdate.data = [...this.contractsToUpdate.data]
        } else {
          throw new Error(`Couldn't find provided contract id: ${trimmedRow[SpreadSheetContract.contractId]}`)
        }
      } else {
        contract = trimmedRow[SpreadSheetContract.contractType] === 'mandate' ? createMandate({ id }) : createSale({ id })
      }

      if (trimmedRow.length) {

        const importErrors = {
          contract,
          newContract: newContract,
          errors: [],
          terms: []
        } as ContractsImportState;
        if (newContract) {

          if (trimmedRow[SpreadSheetContract.parentTermId]) {
            if (typeof trimmedRow[SpreadSheetContract.parentTermId] === 'string') {
              const term = await this.termService.getValue(trimmedRow[SpreadSheetContract.parentTermId]) as Term<Date>[]
              if (term?.length) {
                contract.parentTermId = trimmedRow[SpreadSheetContract.parentTermId];
              } else {
                // it is a number so it refs a column in the excel sheet
                const row = sheetTab.rows[trimmedRow[SpreadSheetContract.parentTermId + 1]]
                console.log(row)
              }
            } else {
              contract.parentTermId = trimmedRow[SpreadSheetContract.parentTermId];
              importErrors.errors.push({
                type: 'warning',
                field: 'term.parentTermId',
                name: 'Parent Term ID',
                reason: 'Could not find provided term by Id.',
                hint: 'Edit corresponding sheet field.'
              })
            }
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'term.parentTermId',
              name: 'Parent Term ID',
              reason: 'If this sale happened on a mandate, please put the contract id',
              hint: 'Edit corresponding sheet field.'
            })

            if (trimmedRow[SpreadSheetContract.stakeholders]?.length) {
              let orgs: Organization[];
              if (Array.isArray(trimmedRow[SpreadSheetContract.stakeholders])) {
                orgs = await Promise.all(trimmedRow[SpreadSheetContract.stakeholders].map(orgName => this.orgService.getValue(ref => ref.where('denomination.public', '==', orgName))));
              } else {
                orgs = await this.orgService.getValue(ref => ref.where('denomination.public', '==', trimmedRow[SpreadSheetContract.stakeholders]))
              }
              contract.stakeholders = orgs.filter(org => !!org).map(org => org.id);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'contracts.stakeholders',
                name: 'Stakeholders',
                reason: 'If this mandate has stakeholders, please fill in the name',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.licensorName]) {
              const orgs = await this.orgService.getValue(ref => ref.where('denomination.public', '==', trimmedRow[SpreadSheetContract.licensorName]))
              if (orgs.length === 1) {
                contract.sellerId = orgs[0].id
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'contract.sellerId',
                name: 'Seller Id',
                reason: 'Couldn\'t find Licensor with the provided name.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.licenseeName]) {
              const orgs = await this.orgService.getValue(ref => ref.where('denomination.public', '==', trimmedRow[SpreadSheetContract.licenseeName]))
              if (orgs.length === 1) {
                contract.buyerId = orgs[0].id
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'contract.buyerId',
                name: 'Buyer Id',
                reason: 'Couldn\'t find Licensee with the provided name.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            /* Create term */
            const term = createTerm({ contractId: contract.id, orgId: this.orgQuery.getActiveId(), titleId: contract?.titleId })
            if (trimmedRow[SpreadSheetContract.territories]?.length) {
              const territoryValues: TerritoryValue[] = (trimmedRow[SpreadSheetContract.territories]).split(this.separator)
              const territories = territoryValues.map(territory => getKeyIfExists('territories', territory.trim())).filter(territory => !!territory)
              term.territories = territories;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'term.territories',
                name: 'Territory',
                reason: 'Archipel Content needs to know the territories in which the movie can be sold.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.medias]?.length) {
              const mediaValues: MediaValue[] = (trimmedRow[SpreadSheetContract.medias]).split(this.separator);
              const medias = mediaValues.map(media => getKeyIfExists('medias', media.trim())).filter(media => !!media)
              term.medias = medias;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'term.medias',
                name: 'Media',
                reason: 'Archipel Content needs to know the medias in which the movie can be sold.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            term.exclusive = trimmedRow[SpreadSheetContract.exclusive]?.toLowerCase() === 'yes' ? true : false;

            term.contractId = contract.id;

            if (trimmedRow[SpreadSheetContract.startOfContract]) {
              if (typeof spreadSheetRow[SpreadSheetContract.startOfContract] === 'number') {
                term.duration.from = new Date(Math.round((spreadSheetRow[SpreadSheetContract.startOfContract] - 25569) * 86400 * 1000));
              } else {
                term.duration.from = new Date(spreadSheetRow[SpreadSheetContract.startOfContract])
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.duration.from',
                name: 'Duration from',
                reason: 'Archipel Content needs to know the starting date of the contract.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.endOfContract]) {
              if (typeof spreadSheetRow[SpreadSheetContract.endOfContract] === 'number') {
                term.duration.to = new Date(Math.round((spreadSheetRow[SpreadSheetContract.endOfContract] - 25569) * 86400 * 1000));
              } else {
                term.duration.to = new Date(spreadSheetRow[SpreadSheetContract.endOfContract])
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.duration.to',
                name: 'Duration to',
                reason: 'Archipel Content needs to know the ending date of the contract.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.originalLanguageLicensed]) {
              term.licensedOriginal =
                trimmedRow[SpreadSheetContract.originalLanguageLicensed].toLowerCase() === 'yes' ? true : false;
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.licensedOriginal',
                name: 'Original Language Licensed',
                reason: 'Please choose yes or no',
                hint: 'Edit corresponding sheet field.'
              })
            }


            if (trimmedRow[SpreadSheetContract.dubbed]) {
              const languageValues: LanguageValue[] = (trimmedRow[SpreadSheetContract.dubbed]).split(this.separator);
              const languages: Language[] = languageValues.map(language => getKeyIfExists('languages', language.trim()))
              for (const language of languages) {
                if (language) {
                  term.languages[language] = { ...term.languages[language], dubbed: true }
                }
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.language.dubbed',
                name: 'Language dubbed',
                reason: 'Please provide dubbed version if available.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.subtitled]) {
              const languageValues: LanguageValue[] = (trimmedRow[SpreadSheetContract.subtitled]).split(this.separator);
              const languages: Language[] = languageValues.map(language => getKeyIfExists('languages', language.trim()))
              for (const language of languages) {
                if (language) {
                  term.languages[language] = { ...term.languages[language], subtitle: true }
                }
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.language.subtitle',
                name: 'Language subtitle',
                reason: 'Please provide subtitle version if available.',
                hint: 'Edit corresponding sheet field.'
              })
            }

            if (trimmedRow[SpreadSheetContract.closedCaptioning]) {
              const languageValues: LanguageValue[] = (trimmedRow[SpreadSheetContract.closedCaptioning]).split(this.separator);
              const languages: Language[] = languageValues.map(language => getKeyIfExists('languages', language.trim()))
              for (const language of languages) {
                if (language) {
                  term.languages[language] = { ...term.languages[language], caption: true }
                }
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'term.language.caption',
                name: 'Language caption',
                reason: 'Please provide caption version if available.',
                hint: 'Edit corresponding sheet field.'
              })
            }
            importErrors.terms.push(term)
            importErrors.contract = contract
            this.contractsToCreate.data.push(importErrors);
            // Forcing change detection
            console.log(this.contractsToCreate.data)
     /*        this.contractsToCreate.data = [...this.contractsToCreate.data] */
          } // End of parsing new contract

          this.cdRef.markForCheck();
        };
        matSnackbarRef.dismissWithAction(); // loading ended */
      }
    }
  }

  public openIntercom() {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.contractsToCreate.data = [];
    this.contractsToUpdate.data = [];
  }
}
