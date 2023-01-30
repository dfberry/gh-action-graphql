import { version } from '../../package.json'
import {
  status,
  whoami,
  repos,
  reposExtended,
  IRepoParameters,
  IRepoFragment,
  IRepoExRefactored
} from '@diberry/github-magic'
import {
  ProcessorParameters,
  QueryType,
  ParametersWhoAmI,
  ParametersRepo
} from './types'
import { env } from 'process'

export function processActionStatus(): {
  sdkVersion: string
  actionVersion: string
} {
  console.log(`status begin`)
  const sdkVersion = status()
  const actionVersion = version
  return { sdkVersion, actionVersion }
}

export async function processActionWhoAmI({
  pat,
  gitHubGraphQLUrl
}: ParametersWhoAmI): Promise<string> {
  console.log(`whoami begin`)
  if (!pat) throw Error('pat is missing')
  if (!gitHubGraphQLUrl) throw Error('gitHubGraphQLUrl is missing')

  const rawResult = await whoami({ pat, gitHubGraphQlUrl: gitHubGraphQLUrl })
  return rawResult.viewer.login
}

export async function processActionRepos({
  pat,
  gitHubGraphQLUrl,
  orgName,
  maxItems,
  maxPageSize,
  maxDelayForRateLimit
}: ParametersRepo): Promise<IRepoFragment[]> {
  console.log(`repos begin`)
  if (!pat) throw Error('pat is missing')
  if (!gitHubGraphQLUrl) throw Error('gitHubGraphQLUrl is missing')
  if (!orgName) throw Error('orgname is missing')

  const rawResult: IRepoFragment[] = await repos({
    pat,
    gitHubGraphQLUrl,
    orgName,
    maxItems,
    maxPageSize,
    maxDelayForRateLimit
  })
  return rawResult
}

export async function processActionReposEx({
  pat,
  gitHubGraphQLUrl,
  orgName,
  maxItems,
  maxPageSize,
  maxDelayForRateLimit
}: ParametersRepo): Promise<unknown> {
  console.log(`reposExtended begin`)
  if (!pat) throw Error('pat is missing')
  if (!gitHubGraphQLUrl) throw Error('gitHubGraphQLUrl is missing')
  if (!orgName) throw Error('orgname is missing')

  const rawResult = await reposExtended({
    pat,
    gitHubGraphQLUrl,
    orgName,
    maxItems,
    maxPageSize,
    maxDelayForRateLimit
  })
  return rawResult
}
