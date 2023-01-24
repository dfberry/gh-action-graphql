/* eslint no-console: 0 */ // --> OFF
import * as core from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import { getSdk, Sdk } from '../generated/graphql.sdk'
import {
  DEFAULT_SAVED_FILE_NAME,
  GITHUB_GRAPHQL,
  TIME_5_SECONDS,
  DEFAULT_PAGE_SIZE
} from './utils/constants'
import { GraphQLClient } from 'graphql-request'
import { gitHubGraphQLWhoAmI, gitHubGraphQLOrgReposAg } from './v2/getdata'
import { gitHubGraphQLOrgReposAgExtendedV3 } from './v3/getdata'

import dotenv from 'dotenv'
dotenv.config()

type QueryType = 'whoami' | 'org_repos' | 'org_repos_extended'

type IncomingVariables = {
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
    case 'whoami':
    case 'org_repos':
    case 'org_repos_extended':
      return str
    default:
      return 'org_repos'
  }
}

function getVarsFromAction(): IncomingVariables {
  if (process.env.NODE_ENV === 'development') {
    return {
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

    const sdk: Sdk = getSdk(new GraphQLClient(GITHUB_GRAPHQL))
    console.log(`Ready to query`)

    let data = undefined

    switch (envVars.querytype) {
      case 'whoami':
        data = await gitHubGraphQLWhoAmI(sdk, envVars.pat)
        core.setOutput('data', JSON.stringify(data))
        break
      case 'org_repos':
        if (!envVars.orgName) {
          throw new Error('Org name is required')
        }
        data = await gitHubGraphQLOrgReposAg(
          sdk,
          envVars.pat,
          envVars.orgName,
          envVars.maxItems,
          envVars.maxPageSize,
          envVars.maxDelayForRateLimit
        )
        // output either data to file or environment
        if (envVars.save_to_file === 'false') {
          core.setOutput('data', JSON.stringify(data))
        }
        break
      case 'org_repos_extended':
        if (!envVars.orgName) {
          throw new Error('Org name is required')
        }
        data = await gitHubGraphQLOrgReposAgExtendedV3(
          sdk,
          envVars.pat,
          envVars.orgName,
          envVars.maxItems,
          envVars.maxPageSize,
          envVars.maxDelayForRateLimit
        )
        // output either data to file or environment
        if (envVars.save_to_file === 'false') {
          core.setOutput('data', JSON.stringify(data))
        }
        break
      // case 'org_repos_extended':
      //   if (!envVars.orgName) {
      //     throw new Error('Org name is required')
      //   }
      //   data = await gitHubGraphQLOrgReposAgV2(
      //     sdk,
      //     envVars.pat,
      //     envVars.orgName,
      //     envVars.maxItems,
      //     envVars.maxPageSize,
      //     envVars.maxDelayForRateLimit
      //   )
      //   // output either data to file or environment
      //   if (envVars.save_to_file === 'false') {
      //     core.setOutput('data', JSON.stringify(data))
      //   }
      //   break
      default:
        throw new Error("Can't determine query type")
    }

    // save data to file instead of blowing out GitHub Action memory
    if (envVars.save_to_file === 'true' && envVars.save_to_file_name) {
      const dirFile: string = path.join(
        process.env.GITHUB_WORKSPACE as string,
        envVars.save_to_file_name
      )
      await fs.writeFile(dirFile, JSON.stringify(data), 'utf8')
      console.log(`Data output file written to ${dirFile}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
