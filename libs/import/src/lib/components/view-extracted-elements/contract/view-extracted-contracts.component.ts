import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MovieService } from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { SSF } from 'xlsx';
import { createContract, createTerms, createContractTitleDetail, createMandate, createSale } from '@blockframes/contract/contract/+state/contract.model';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state/contract.firestore';
import { createExpense, createPrice } from '@blockframes/utils/common-interfaces/price';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createPaymentSchedule } from '@blockframes/utils/common-interfaces/schedule';
import { Intercom } from 'ng-intercom';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractsImportState } from '../../../import-utils';
import { AuthQuery } from '@blockframes/auth/+state';
import { TermsService } from '@blockframes/contract/terms/+state/terms.service'
import { OrganizationQuery } from '@blockframes/organization/+state';
import { getKeyFromValue, MediaValue, TerritoryValue } from '@blockframes/utils/static-model';

enum SpreadSheetContract {
  titleId,
  titleInternalRef,
  internationalTitle,
  contractType,
  contractId,
  territories,
  medias,
  exclusive,
  startOfContract,
  endOfContract
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
  private subSeparator = ',';
  public isUserBlockframesAdmin = false;

  constructor(
    @Optional() private intercom: Intercom,
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery,
    private termsSerivce: TermsService
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();
    console.log(sheetTab)
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');
    for (const spreadSheetRow of sheetTab.rows) {
      const trimmedRow = spreadSheetRow.map(row => {
        if (typeof row === 'string') row.trim()
        return row
      })
      let contract
      let newContract = true;
      if (trimmedRow[SpreadSheetContract.contractId]) {
        const existingContract = await this.contractService.getValue(trimmedRow[SpreadSheetContract.contractId] as string);
        if (!!existingContract) {
          contract = createContract(existingContract);
          newContract = false;
        }
      }

      if (trimmedRow[SpreadSheetContract.contractId]) {
        const importErrors = {
          contract,
          newContract: newContract,
          errors: [],
        } as ContractsImportState;

        if (newContract) {

          if (trimmedRow[SpreadSheetContract.contractType].toLowerCase() === 'mandate') {
            contract = createMandate({
              sellerId: this.orgQuery.getActiveId()
            });
          } else if (trimmedRow[SpreadSheetContract.contractType].toLowerCase() === 'sale') {
            contract = createSale({
              sellerId: this.orgQuery.getActiveId()
            })
          }
          else {
            importErrors.errors.push({
              type: 'error',
              field: 'contract.type',
              name: 'Mandate',
              reason: `Contract type is mandatory`,
              hint: 'Edit corresponding sheet field.'
            })
          }

          /* If title id is provided, add it to the contract, otherwise try to fetch the title id */
          if (trimmedRow[SpreadSheetContract.titleId]) {
            console.log(trimmedRow[SpreadSheetContract.titleId])
            contract.titleId = trimmedRow[SpreadSheetContract.titleId];
          } else if (trimmedRow[SpreadSheetContract.titleInternalRef]) {
            console.log(trimmedRow[SpreadSheetContract.titleInternalRef])
            const movie = await this.movieService.getFromInternalRef(trimmedRow[SpreadSheetContract.titleInternalRef])
            if (movie) contract.titleId = movie.id
          } else if (trimmedRow[SpreadSheetContract.internationalTitle]) {
            const movie = await this.movieService.getValue(ref =>
              ref.where('title.international', '==', trimmedRow[SpreadSheetContract.internationalTitle]))
            if (movie.length) contract.titleId = movie[0].id
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'contract.titleId',
              name: 'Title Id',
              reason: `We need to know the title otherwise we can't map the contract to the a movie`,
              hint: 'Edit corresponding sheet field.'
            })
          }

          /* Create terms */
          let terms = createTerms({ orgId: this.orgQuery.getActiveId(), titleId: contract.titleId })
          if (trimmedRow[SpreadSheetContract.territories].length) {
            const territoryValues: TerritoryValue[] = (trimmedRow[SpreadSheetContract.territories]).split(this.separator)
            const territories = territoryValues.map(territory => getKeyFromValue('territories', territory.trim()))
            terms.territories = territories;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'terms.territories',
              name: 'Territory',
              reason: `Archipel Content needs to know the territories in which the movie can be sold.`,
              hint: 'Edit corresponding sheet field.'
            })
          }

          if (trimmedRow[SpreadSheetContract.medias].length) {
            const mediaValues: MediaValue[] = (trimmedRow[SpreadSheetContract.medias]).split(this.separator);
            const medias = mediaValues.map(media => getKeyFromValue('medias', media.trim()))
            terms.medias = medias;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'terms.medias',
              name: 'Media',
              reason: `Archipel Content needs to know the medias in which the movie can be sold.`,
              hint: 'Edit corresponding sheet field.'
            })
          }

          if (trimmedRow[SpreadSheetContract.exclusive]) {
            terms.exclusive =
              trimmedRow[SpreadSheetContract.exclusive].toLowerCase() === 'yes' ? true : false;
          }

          if (trimmedRow[SpreadSheetContract.startOfContract]) {
            terms.duration.from = new Date(trimmedRow[SpreadSheetContract.startOfContract]);
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'terms.duration.from',
              name: 'Duration from',
              reason: `Archipel Content needs to know the starting date of the contract.`,
              hint: 'Edit corresponding sheet field.'
            })
          }

          if (trimmedRow[SpreadSheetContract.endOfContract]) {
            terms.duration.to = new Date(trimmedRow[SpreadSheetContract.endOfContract]);
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'terms.duration.to',
              name: 'Duration to',
              reason: `Archipel Content needs to know the ending date of the contract.`,
              hint: 'Edit corresponding sheet field.'
            })
          }
          const id = await this.termsSerivce.upsert(terms);
          // Maybe we need the terms later?
          terms.id = id;
          contract.termsIds.push(id)
          console.log(contract)

          /*
                       // LICENSEE
                       if (spreadSheetRow[SpreadSheetContract.licensee]) {
                         const licenseeParts = spreadSheetRow[SpreadSheetContract.licensee].split(this.subSeparator);
                         const licensee = createContractPartyDetail();
                         licensee.party.displayName = licenseeParts[0].trim();
                         if (licenseeParts[1]) {
                           licensee.party.orgId = licenseeParts[1].trim();
                         }
                         licensee.party.role = 'licensee';

                         // SHOW NAME
                         if (spreadSheetRow[SpreadSheetContract.displayLicenseeName]) {
                           licensee.party.showName = spreadSheetRow[SpreadSheetContract.displayLicenseeName].toLowerCase() === 'yes' ? true : false;
                         }

                         contract.parties.push(licensee);
                       }

                       // CHILD ROLES
                       if (spreadSheetRow[SpreadSheetContract.childRoles]) {
                         spreadSheetRow[SpreadSheetContract.childRoles].split(this.separator).forEach((r: string) => {
                           const childRoleParts = r.split(this.subSeparator);
                           const partyName = childRoleParts.shift().trim();
                           const party = contract.parties.find(p => p.party.displayName === partyName && p.party.role === 'licensor');
                           if (party) {
                             childRoleParts.forEach(childRole => {
                               const role = getKeyIfExists('subLicensorRoles', childRole.trim() as GetCode<'subLicensorRoles'>);
                               if (role) {
                                 party.childRoles.push(role);
                               } else {
                                 importErrors.errors.push({
                                   type: 'error',
                                   field: 'contract.parties.childRoles',
                                   name: 'Child roles',
                                   reason: `Child role mismatch : ${childRole.trim()}`,
                                   hint: 'Edit corresponding sheet field.'
                                 });
                               }
                             });
                           } else {
                             importErrors.errors.push({
                               type: 'error',
                               field: 'contract.parties.childRoles',
                               name: 'Child roles',
                               reason: `Licensor name mismatch : ${partyName}`,
                               hint: 'Edit corresponding sheet field.'
                             });
                           }
                         });
                       }

                       // CONTRACT TYPE
                       if (spreadSheetRow[SpreadSheetContract.contractType]) {
                         const key = getKeyIfExists('contractType', spreadSheetRow[SpreadSheetContract.contractType]);
                         if (key) {
                           contract.type = key;
                         } else {
                           importErrors.errors.push({
                             type: 'error',
                             field: 'contract.type',
                             name: 'Contract Type',
                             reason: `Could not parse contract type : ${spreadSheetRow[SpreadSheetContract.contractType].trim().toLowerCase()}`,
                             hint: 'Edit corresponding sheet field.'
                           });
                         }
                       } else {
                         importErrors.errors.push({
                           type: 'warning',
                           field: 'contract.type',
                           name: 'Contract Type',
                           reason: 'Optional field is missing',
                           hint: 'Edit corresponding sheet field.'
                         });
                       }
                     }

                     // CONTRACT STATUS
                     if (spreadSheetRow[SpreadSheetContract.status]) {
                       const key = getKeyIfExists('contractStatus', spreadSheetRow[SpreadSheetContract.status]);
                       if (key) {
                         contract.lastVersion.status = key;
                       } else {
                         importErrors.errors.push({
                           type: 'warning',
                           field: 'contract.lastVersion.status ',
                           name: 'Contract Status',
                           reason: `Contract status "${spreadSheetRow[SpreadSheetContract.status]}" could not be parsed.`,
                           hint: 'Edit corresponding sheet field.'
                         });
                       }
                     }

                     // CONTRACT CREATION DATE
                     if (spreadSheetRow[SpreadSheetContract.creationDate]) {
                       const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.creationDate]);
                       contract.lastVersion.creationDate = new Date(`${y}-${m}-${d}`);
                     } else {
                       importErrors.errors.push({
                         type: 'warning',
                         field: 'contract.lastVersion.creationDate',
                         name: 'Creation date',
                         reason: 'Contract creation date not found. Using current date',
                         hint: 'Edit corresponding sheet field.'
                       });
                     }

                     // SCOPE DATE START
                     if (spreadSheetRow[SpreadSheetContract.scopeStartDate]) {
                       const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.scopeStartDate]);
                       const scopeStart = new Date(`${y}-${m}-${d}`);
                       if (isNaN(scopeStart.getTime())) {
                         contract.lastVersion.scope.approxStart = spreadSheetRow[SpreadSheetContract.scopeStartDate];
                         importErrors.errors.push({
                           type: 'warning',
                           field: 'contract.lastVersion.scope',
                           name: 'Contract scope start',
                           reason: `Failed to parse contract scope start date : ${spreadSheetRow[SpreadSheetContract.scopeStartDate]}, moved data to approxStart`,
                           hint: 'Edit corresponding sheet field.'
                         });
                       } else {
                         contract.lastVersion.scope.start = scopeStart;
                       }
                     }

                     // SCOPE DATE END
                     if (spreadSheetRow[SpreadSheetContract.scopeEndDate]) {
                       const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.scopeEndDate]);
                       const scopeEnd = new Date(`${y}-${m}-${d}`);
                       if (isNaN(scopeEnd.getTime())) {
                         contract.lastVersion.scope.approxEnd = spreadSheetRow[SpreadSheetContract.scopeEndDate];
                         importErrors.errors.push({
                           type: 'warning',
                           field: 'contract.lastVersion.scope',
                           name: 'Contract scope end',
                           reason: `Failed to parse contract scope end date : ${spreadSheetRow[SpreadSheetContract.scopeEndDate]}, moved data to approxEnd`,
                           hint: 'Edit corresponding sheet field.'
                         });
                       } else {
                         contract.lastVersion.scope.end = scopeEnd;
                       }
                     }

                     // PAYMENT SCHEDULES
                     if (spreadSheetRow[SpreadSheetContract.paymentSchedules]) {
                       spreadSheetRow[SpreadSheetContract.paymentSchedules].split(this.separator).forEach((r: string) => {
                         const scheduleParts = r.split(this.subSeparator);
                         if (scheduleParts.length >= 2) {
                           const percentage = scheduleParts[1].indexOf('%') !== -1 ?
                             parseInt(scheduleParts[1].trim().replace('%', ''), 10) :
                             parseInt(scheduleParts[1].trim(), 10);
                           const paymentSchedule = createPaymentSchedule({ label: scheduleParts[0].trim(), percentage });
                           if (scheduleParts[2]) {
                             paymentSchedule.date.approxStart = scheduleParts[2].trim();
                           }
                           contract.lastVersion.paymentSchedule.push(paymentSchedule);
                         } else {
                           importErrors.errors.push({
                             type: 'error',
                             field: 'contract.lastVersion.paymentSchedule',
                             name: 'Payment Schedule',
                             reason: 'Error while parsing data',
                             hint: 'Edit corresponding sheet field.'
                           });
                         }
                       });
                     } else {
                       importErrors.errors.push({
                         type: 'warning',
                         field: 'contract.lastVersion.paymentSchedule',
                         name: 'Payment Schedule',
                         reason: 'Missing data',
                         hint: 'Edit corresponding sheet field.'
                       });
                     }

                     // TITLES STUFF
                     let titleIndex = 0;
                     // @dev this while is why we need to do a for(const of ...) (pretty sure)
                     while (spreadSheetRow[SpreadSheetContract.titleStuffIndexStart + titleIndex]) {
                       const currentIndex = SpreadSheetContract.titleStuffIndexStart + titleIndex;
                       titleIndex += titlesFieldsCount;
                       const titleDetails = await this.processTitleDetails(spreadSheetRow, currentIndex, importErrors);

                       if (importErrors.newContract && contract.lastVersion.titles[titleDetails.titleId] !== undefined) {
                         importErrors.errors.push({
                           type: 'error',
                           field: 'titleIds',
                           name: 'Film Code',
                           reason: `Duplicate film code found : ${titleDetails.titleId}`,
                           hint: 'Edit corresponding sheet field.'
                         });
                       } else {
                         contract.lastVersion.titles[titleDetails.titleId] = titleDetails;
                       }
                     }
              */

          ///////////////
          // VALIDATION
          ///////////////

          // Global contract price
          /*     const contractPrice = createPrice();
              Object.keys(importErrors.contract.lastVersion.titles).forEach(titleId => {
                const price = importErrors.contract.lastVersion.titles[titleId].price;
                if (price && price.amount) {
                  contractPrice.amount += price.amount;
                }
                if (price && price.currency) {
                  contractPrice.currency = price.currency;
                }
              });

              importErrors.contract.lastVersion.price = contractPrice;

              const contractWithErrors = await this.validateMovieContract(importErrors);

              if (!contractWithErrors.newContract) {
                this.contractsToUpdate.data.push(contractWithErrors);
                this.contractsToUpdate.data = [... this.contractsToUpdate.data];
              } else {
                contractWithErrors.contract.id = spreadSheetRow[SpreadSheetContract.contractId];
                this.contractsToCreate.data.push(contractWithErrors);
                this.contractsToCreate.data = [... this.contractsToCreate.data];
              }

              this.cdRef.markForCheck();
            }
          };
          matSnackbarRef.dismissWithAction(); // loading ended */
        }
      }
    }
  }

  private async validateMovieContract(importErrors: ContractsImportState): Promise<ContractsImportState> {

    const contract = importErrors.contract;
    const errors = importErrors.errors;

    //////////////////
    // REQUIRED FIELDS
    //////////////////

    //  CONTRACT VALIDATION
    const isContractValid = await this.contractService.validateAndConsolidateContract(contract);
    if (!isContractValid) {
      errors.push({
        type: 'error',
        field: 'contractId',
        name: 'Contract',
        reason: 'Contract is not valid',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // SCOPE
    if (Object.entries(contract.lastVersion.scope).length === 0 && contract.lastVersion.scope.constructor === Object) {
      importErrors.errors.push({
        type: 'error',
        field: 'contract.lastVersion.scope',
        name: 'Scope Start',
        reason: 'Contract scope not defined',
        hint: 'Edit corresponding sheet field.'
      });
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    // CONTRACT PRICE VALIDATION
    if (!contract.lastVersion.price.amount) {
      errors.push({
        type: 'warning',
        field: 'price',
        name: 'Contract price',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // CONTRACT STATUS
    if (!contract.lastVersion.status) {
      errors.push({
        type: 'warning',
        field: 'contract.lastVersion.status',
        name: 'Contract Status',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    return importErrors;
  }

  private async processTitleDetails(spreadSheetRow: any[], currentIndex: number, importErrors: ContractsImportState) {
    const titleDetails = createContractTitleDetail();
    titleDetails.price.recoupableExpenses = [];

    let internalRef;
    /*   if (spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]) {
        internalRef = spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex];
        const title = await this.movieService.getFromInternalRef(internalRef);
        if (title === undefined) {
          throw new Error(`Movie ${spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]} is missing in database.`);
        }
        titleDetails.titleId = title.id;
      }

      if (spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]) {
        titleDetails.distributionRightIds = spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]
          .split(this.separator)
          .map(c => c.trim());
      }

      if (spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex]) {
        const priceParts = spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex].split(this.subSeparator);

        // Check if priceParts have at least two parts (amount and currency)
        if (priceParts.length >= 2) {
          const amount = parseInt(priceParts[0], 10);
          const currency = getKeyIfExists('movieCurrencies', priceParts[1]);
          titleDetails.price.amount = amount;
          if (currency) {
            titleDetails.price.currency = currency;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'title.price',
              name: 'Title price currency',
              reason: `Failed to parse currency : ${priceParts[1]} for ${internalRef}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'title.price',
            name: 'Title price',
            reason: `Failed to parse title price ${spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex]} for ${internalRef}`,
            hint: 'Edit corresponding sheet field.'
          });
        }
      } else {
        importErrors.errors.push({
          type: 'warning',
          field: 'title.price',
          name: 'Title price',
          reason: `Title price not found for ${internalRef}`,
          hint: 'Edit corresponding sheet field.'
        });
      }

      if (spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]) {
        titleDetails.price.commission = spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]
      }

      const recoupableExpense = createExpense();
      if (spreadSheetRow[SpreadSheetContractTitle.expenseLabel + currentIndex]) {
        recoupableExpense.label = spreadSheetRow[SpreadSheetContractTitle.expenseLabel + currentIndex];
      }

      if (spreadSheetRow[SpreadSheetContractTitle.expenseValue + currentIndex]) {
        recoupableExpense.price.amount = spreadSheetRow[SpreadSheetContractTitle.expenseValue + currentIndex];
      }

      if (spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]) {
        const currency = getKeyIfExists('movieCurrencies', spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]);
        if (currency) {
          recoupableExpense.price.currency = currency;
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'recoupableExpense.price.currency',
            name: 'Expense currency',
            reason: `Failed to parse expense currency : ${spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]} for ${internalRef}`,
            hint: 'Edit corresponding sheet field.'
          });
        }
      }

      titleDetails.price.recoupableExpenses.push(recoupableExpense);

      return titleDetails; */
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.contractsToCreate.data = [];
    this.contractsToUpdate.data = [];
  }
}
