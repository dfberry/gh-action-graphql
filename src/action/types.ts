import { IRepoParameters } from '@diberry/github-magic'

export type ParametersStatus = {}

export type ProcessorParametersStatus = {}

export type ParametersWhoAmI = {
  pat: string
  gitHubGraphQLUrl: string
}
export type ParametersRepo = {
  pat: string
  gitHubGraphQLUrl: string
  orgName: string
  maxItems: number
  maxPageSize: number
  maxDelayForRateLimit: number
}
export type ProcessorParameters = {
  querytype: QueryType
  save_to_file?: boolean
  save_to_file_name?: string
} & IRepoParameters

export type QueryType =
  | 'whoami'
  | 'org_repos'
  | 'org_repos_extended'
  | 'status'
  | 'user_repos_extended'
