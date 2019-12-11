import { ImgRef, createImgRef } from "../image-uploader";
import { StakeholderRolesSlug, CreditRolesSlug, LegalRolesSlug } from "@blockframes/movie/movie/static-model/types";


//////////////////////////
// VARIOUS IDENTIY OBJECTS
// @dev [WIP] Inclusive & LGBT compatible model
// right now even a company can identify as a human! @TODO (#1388)
//////////////////////////

/**
 * @dev Root object of any Person (physical, legal etc..)
 * Not exported and should not be used outside of this file
 */
interface IdentityRaw {
  orgId?: string,

  displayName?: string, // @todo #1052 interogation mark will be removed when not using firstName & lastName anymore

  showName?: boolean,

  /**
   * @see extending interface for enums
   * can be used for various usages: credit role, stakeholder role (for contracts) 
   */
  role?: string,
}

/**
 * @dev Represents an human beeing with no specific purpose
 * Use a more representative interface entity (like Credit, SalesAgent) instead of this one if possible
 */
export interface Person extends IdentityRaw {
  firstName: string,
  lastName?: string,
  avatar?: ImgRef,
}

export interface StakeholderRaw extends IdentityRaw {
}

export interface Stakeholder extends StakeholderRaw {
  role?: StakeholderRolesSlug, // overrided role scope from Person interface
  logo?: ImgRef;
}

/**
 * @dev interface to represent a movie credit
 */
export interface Credit extends Person {
  role: CreditRolesSlug, // overrided role scope from Person interface
  shortBiography?: string,
};

/**
 * @dev interface to represent an entity within contracts
 */
export interface Party extends StakeholderRaw {
  role: LegalRolesSlug, // overrided role scope from Person interface
}

// This is just for more readable code : 

export type SalesAgent = Person;

export type Company = Stakeholder;

export type Licensee = Stakeholder;

export type Licensor = Stakeholder;


///////////////////
// CREATE FUNCTIONS
///////////////////

export function createStakeholder(params: Partial<Stakeholder> = {}): Stakeholder {
  return {
    orgId: '',
    logo: createImgRef(),
    ...params,
  }
}

export function createParty(params: Partial<Party> = {}): Party {
  return {
    ...createStakeholder(params),
    role: '',
    showName: false,
    ...params,
  }
}

export function createCredit(params: Partial<Credit> = {}): Credit {
  return {
    firstName: '',
    lastName: '',
    role: '',
    shortBiography: '',
    avatar: createImgRef(),
    ...params
  };
}

export function createCompany(params: Partial<Company> = {}): Company {
  return {
    displayName: '',
    role: '',
    logo: createImgRef(),
    ...params
  };
}
