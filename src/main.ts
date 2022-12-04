/* eslint no-console: 0 */ // --> OFF
import * as core from '@actions/core'
import { getSdk, Sdk } from './generated/graphql.sdk'
import { GITHUB_GRAPHQL } from './constants'
import { GraphQLClient } from 'graphql-request'
import { gitHubGraphQLOrgReposAg, gitHubGraphQLWhoAmI } from './getdata'

import dotenv from 'dotenv'
dotenv.config()

function getVarsFromAction(): Record<string, string> {
  const variables = {
    pat: core.getInput('github_personal_access_token'),
    orgName: core.getInput('github_org') || GITHUB_GRAPHQL,
    querytype: core.getInput('query_type') || 'whoami'
  }
  console.log(variables)
  return variables
}

async function run(): Promise<void> {
  try {
    const { pat, orgName, querytype } = getVarsFromAction()
    if (!pat) {
      throw new Error('GitHub Personal Access Token is required')
    }

    const sdk: Sdk = getSdk(new GraphQLClient(GITHUB_GRAPHQL))
    console.log(`Ready to query`)

    let data = undefined

    switch (querytype) {
      case 'whoami':
        data = await gitHubGraphQLWhoAmI(sdk, pat)
        console.log(data)
        core.setOutput('data', JSON.stringify(data))
        return
      case 'org_repos':
        if (!orgName) {
          throw new Error('Org name is required')
        }
        data = await gitHubGraphQLOrgReposAg(sdk, pat, orgName)
        console.log(data)
        core.setOutput('data', JSON.stringify(data))
        return
      default:
        throw new Error("Can't determine query type")
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
