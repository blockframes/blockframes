
export interface Investor {
  name: string,
  hasLink: boolean,
  hasUploaded: boolean,
  contributionDate: Date,
  status: string,
  investment: string,
  reward?: string,
  waterfallPos?: string
}