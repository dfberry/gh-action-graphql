/* eslint no-console: 0 */ // --> OFF
import * as core from '@actions/core'
import { promises as fs } from 'fs'
import path from 'path'
import { getSdk, Sdk } from './generated/graphql.sdk'
import { DEFAULT_SAVED_FILE_NAME, GITHUB_GRAPHQL } from './constants'
import { GraphQLClient } from 'graphql-request'
import { gitHubGraphQLOrgReposAg, gitHubGraphQLWhoAmI } from './getdata'

import dotenv from 'dotenv'
dotenv.config()

function getVarsFromAction(): Record<string, string> {
  const variables = {
    pat: core.getInput('github_personal_access_token'),
    orgName: core.getInput('github_org') || GITHUB_GRAPHQL,
    querytype: core.getInput('query_type') || 'whoami',
    save_to_file: core.getInput('save_to_file') || 'true',
    save_to_file_name:
      core.getInput('save_to_file_name') || DEFAULT_SAVED_FILE_NAME
  }
  console.log(variables)
  return variables
}

async function run(): Promise<void> {
  try {
    const { pat, orgName, querytype, save_to_file, save_to_file_name } =
      getVarsFromAction()
    if (!pat) {
      throw new Error('GitHub Personal Access Token is required')
    }

    const sdk: Sdk = getSdk(new GraphQLClient(GITHUB_GRAPHQL))
    console.log(`Ready to query`)

    let data = undefined

    switch (querytype) {
      case 'whoami':
        data = await gitHubGraphQLWhoAmI(sdk, pat)
        core.setOutput('data', JSON.stringify(data))
        break
      case 'org_repos':
        if (!orgName) {
          throw new Error('Org name is required')
        }
        data = await gitHubGraphQLOrgReposAg(sdk, pat, orgName)
        core.setOutput('data', JSON.stringify(data))
        break
      default:
        throw new Error("Can't determine query type")
    }

    // save data to file instead of blowing out GitHub Action memory
    if (save_to_file === 'true' && save_to_file_name) {
      const dirFile: string = path.join(__dirname, '..', save_to_file_name)
      await fs.writeFile(dirFile, JSON.stringify(data), 'utf8')
      console.log(`Data output file written to ${dirFile}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
