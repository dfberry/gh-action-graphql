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
  // eslint-disable-next-line no-console
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
    switch (querytype) {
      case 'whoami':
        core.setOutput(
          'user',
          JSON.stringify(await gitHubGraphQLWhoAmI(sdk, pat))
        )
        return
      case 'org_repos':
        if (!orgName) {
          throw new Error('Org name is required')
        }
        core.setOutput(
          'org_repos',
          JSON.stringify(await gitHubGraphQLOrgReposAg(sdk, pat, orgName))
        )
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
