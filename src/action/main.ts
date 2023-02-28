/* eslint no-console: 0 */ // --> OFF
import * as core from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import {
  DEFAULT_SAVED_FILE_NAME,
  GITHUB_GRAPHQL,
  TIME_5_SECONDS,
  DEFAULT_PAGE_SIZE
} from './utils/constants'
import { version } from '../../package.json'
import {
  processActionUserReposEx,
  processActionReposEx,
  processActionStatus,
  processActionWhoAmI,
  processActionRepos
} from '../action/processor'
import { QueryType } from './types'

type IncomingVariables = {
  gitHubGraphQLUrl: string
  pat: string // personal access token
  orgName: string
  querytype: QueryType
  maxItems: number
  maxPageSize: number
  maxDelayForRateLimit: number
  save_to_file: string
  save_to_file_name: string
}

function getQueryType(str: string): QueryType {
  switch (str) {
    case 'status':
    case 'whoami':
    case 'org_repos':
    case 'org_repos_extended':
    case 'user_repos_extended':
      return str
    default:
      return 'org_repos'
  }
}

function getVarsFromAction(): IncomingVariables {
  if (process.env.NODE_ENV === 'development') {
    return {
      gitHubGraphQLUrl: process.env.gitHubGraphQLUrl || GITHUB_GRAPHQL,
      pat: process.env.github_personal_access_token || '',
      orgName: process.env.github_org || '',
      querytype: process.env.query_type as QueryType,
      maxItems: parseInt(process.env.maxItems as string, -1) || -1,
      maxPageSize:
        parseInt(process.env.maxPageSize as string, DEFAULT_PAGE_SIZE) ||
        DEFAULT_PAGE_SIZE,
      maxDelayForRateLimit:
        parseInt(process.env.maxDelayForRateLimit as string, TIME_5_SECONDS) ||
        TIME_5_SECONDS,
      save_to_file: process.env.save_to_file || '',
      save_to_file_name: process.env.save_to_file_name || ''
    }
  } else {
    const maxItems = parseInt(core.getInput('max_items')) || DEFAULT_PAGE_SIZE
    const maxPageSize =
      parseInt(core.getInput('max_page_size')) || DEFAULT_PAGE_SIZE
    const rateLimit =
      parseInt(core.getInput('rate_limit_delay')) || TIME_5_SECONDS

    return {
      gitHubGraphQLUrl: process.env.gitHubGraphQLUrl || GITHUB_GRAPHQL,
      pat: core.getInput('github_personal_access_token'),
      orgName: core.getInput('github_org') || GITHUB_GRAPHQL,
      querytype: getQueryType(core.getInput('query_type')),
      maxItems,
      maxPageSize,
      maxDelayForRateLimit: rateLimit,
      save_to_file: core.getInput('save_to_file') || 'true',
      save_to_file_name:
        core.getInput('save_to_file_name') || DEFAULT_SAVED_FILE_NAME
    }
  }
}

async function run(): Promise<unknown> {
  try {
    const envVars = getVarsFromAction()
    console.log(envVars)

    if (!envVars.pat) {
      throw new Error('GitHub Personal Access Token is required')
    }

    console.log(`Ready to query`)

    let data = undefined

    switch (envVars.querytype) {
      case 'status':
        console.log(`querytype=status`)
        core.setOutput('data', JSON.stringify(version))
        const sdkVersion = processActionStatus()
        core.setOutput('data', JSON.stringify(sdkVersion))
      case 'whoami':
        console.log(`querytype=whoami`)
        if (!envVars.pat) {
          throw new Error('pat is required')
        }
        const paramsWhoAmI = {
          pat: envVars.pat,
          gitHubGraphQLUrl: envVars.gitHubGraphQLUrl
        }
        data = await processActionWhoAmI(paramsWhoAmI)
        core.setOutput('data', JSON.stringify(data))
        data = 'whoami'
        break
      case 'org_repos':
        console.log(`querytype=org_repos`)
        if (!envVars.pat) {
          throw new Error('pat is required')
        }
        if (!envVars.orgName) {
          throw new Error('Org name is required')
        }
        if (!envVars.gitHubGraphQLUrl) {
          throw new Error('gitHubGraphQLUrl is required')
        }
        data = await processActionRepos({
          pat: envVars.pat,
          gitHubGraphQLUrl: envVars.gitHubGraphQLUrl,
          orgName: envVars.orgName,
          maxItems: envVars.maxItems,
          maxPageSize: envVars.maxPageSize,
          maxDelayForRateLimit: envVars.maxDelayForRateLimit
        })
        // output either data to file or environment
        if (envVars.save_to_file === 'false') {
          core.setOutput('data', JSON.stringify(data))
        }
        data = 'org_repos'
        break
      case 'org_repos_extended':
        console.log(`querytype=org_repos_extended`)
        if (!envVars.pat) {
          throw new Error('pat is required')
        }
        if (!envVars.orgName) {
          throw new Error('Org name is required')
        }
        if (!envVars.gitHubGraphQLUrl) {
          throw new Error('gitHubGraphQLUrl is required')
        }
        data = await processActionReposEx({
          pat: envVars.pat,
          gitHubGraphQLUrl: envVars.gitHubGraphQLUrl,
          orgName: envVars.orgName,
          maxItems: envVars.maxItems,
          maxPageSize: envVars.maxPageSize,
          maxDelayForRateLimit: envVars.maxDelayForRateLimit
        })

        // output either data to file or environment
        if (envVars.save_to_file === 'false') {
          core.setOutput('data', JSON.stringify(data))
        }
        break
      case 'user_repos_extended':

        // since the query is about a user
        // assume orgName is a user

        console.log(`querytype=user_repos_extended`)
        if (!envVars.pat) {
          throw new Error('pat is required')
        }
        if (!envVars.orgName) {
          throw new Error('User name is required, as `org`')
        }
        if (!envVars.gitHubGraphQLUrl) {
          throw new Error('gitHubGraphQLUrl is required')
        }
        data = await processActionUserReposEx({
          pat: envVars.pat,
          gitHubGraphQLUrl: envVars.gitHubGraphQLUrl,
          orgName: envVars.orgName, // user account
          maxItems: envVars.maxItems,
          maxPageSize: envVars.maxPageSize,
          maxDelayForRateLimit: envVars.maxDelayForRateLimit
        })

        // output either data to file or environment
        if (envVars.save_to_file === 'false') {
          core.setOutput('data', JSON.stringify(data))
        }
        break
      default:
        throw new Error("Can't determine query type")
    }

    // save data to file instead of blowing out GitHub Action memory
    if (envVars.save_to_file === 'true' && envVars.save_to_file_name) {
      console.log(`save to file - yes: ${envVars.save_to_file_name}`)
      const dirFile: string = path.join(
        process.env.GITHUB_WORKSPACE as string,
        envVars.save_to_file_name
      )
      await fs.writeFile(dirFile, JSON.stringify(data), 'utf8')
      console.log(`Data output file written to ${dirFile}`)
    } else {
      console.log(`save to file - no`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
