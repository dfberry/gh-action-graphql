/* eslint no-console: 0 */ // --> OFF
import {
  OrgReposAgExtended_V3QueryVariables,
  RepoFieldsFragment_V3Fragment,
  Sdk
} from '../../generated/graphql.sdk'
import { waitfor } from '../utils/utils'

/**
 * Org Repos extended (last commit, pr, issue)
 * @param sdk
 * @param personal_access_token
 * @param org_name such as 'Azure-samples'
 * @max_data how many repos to return, -1 means all
 * @page_size 100 items max for GiHub
 * @rate_limit_ms impose rate limit for query
 * @returns
 */
export async function gitHubGraphQLOrgReposAgExtendedV3(
  sdk: Sdk,
  personal_access_token: string,
  org_name: string,
  max_data: number, // Number of repos to return in total, -1 means all data
  page_size: number, // Max page size for GitHub
  rate_limit_ms: number
): Promise<RepoFieldsFragment_V3Fragment[]> {
  // list of repos

  if (!personal_access_token)
    throw new Error('gitHubGraphQLOrgRepos::missing pat')
  const variables: OrgReposAgExtended_V3QueryVariables = {
    organization: org_name,
    pageSize: page_size,
    after: null
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  let hasNextPage = true
  const repos: RepoFieldsFragment_V3Fragment[] = []

  do {
    console.log(`variables = ${JSON.stringify(variables)}`)

    // Adjust page size to return correct number
    // if (currentData + page_size > max_data) {
    //   variables.pageSize = max_data - currentData
    // }

    const data = await sdk.OrgReposAgExtended_v3(variables, requestHeaders)

    // Get repos
    if (data?.organization?.repositories?.edges) {
      const flattenEdge = data?.organization.repositories.edges.map(
        (edge) => edge?.node as RepoFieldsFragment_V3Fragment
      )

      repos.push(...flattenEdge)

      // Manage cursor for next page
      hasNextPage =
        data.organization?.repositories.pageInfo.hasNextPage !== undefined
          ? data.organization?.repositories.pageInfo.hasNextPage
          : false
      console.log(`hasNextPage ${hasNextPage}`)
      variables.after =
        data?.organization?.repositories?.pageInfo?.endCursor !== undefined &&
        data?.organization?.repositories?.pageInfo?.endCursor !== null
          ? data?.organization?.repositories?.pageInfo?.endCursor
          : undefined

      // rate limit - TBD: Fix this
      if (hasNextPage && rate_limit_ms > 0) {
        console.log(`waiting ${rate_limit_ms}`)
        await waitfor(rate_limit_ms)
      }
    } else {
      console.log(`edges not returned`)
    }
  } while (hasNextPage)
  return repos
}
