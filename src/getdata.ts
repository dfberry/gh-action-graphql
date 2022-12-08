import {
  MyRepoFieldsFragment,
  OrgReposAgQueryVariables,
  Sdk
} from './generated/graphql.sdk'
import { TIME_30_SECONDS } from './constants'
import { waitfor } from './utils'
export async function gitHubGraphQLWhoAmI(
  sdk: Sdk,
  personal_access_token: string
): Promise<unknown> {
  if (!personal_access_token)
    throw new Error('gitHubGraphQLWhoAmI::missing pat')
  const variables = undefined
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }
  const data = await sdk.WhoAmI(variables, requestHeaders)
  return data
}

export async function gitHubGraphQLOrgReposAg(
  sdk: Sdk,
  personal_access_token: string,
  org_name: string,
  max_data = -1, // Number of repos to return in total, -1 means all data
  page_size = 100, // Max page size for GitHub
  rate_limit_ms = TIME_30_SECONDS
): Promise<MyRepoFieldsFragment[]> {
  if (!personal_access_token)
    throw new Error('gitHubGraphQLOrgRepos::missing pat')
  const variables: OrgReposAgQueryVariables = {
    organization: org_name,
    pageSize: page_size,
    after: undefined
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  let hasNextPage = true
  let currentData = 0
  const repos: MyRepoFieldsFragment[] = []

  do {
    // rate limit - TBD: Fix this
    if (rate_limit_ms > 0) {
      await waitfor(rate_limit_ms)
    }

    // Adjust page size to return correct number
    if (currentData + page_size > max_data) {
      variables.pageSize = max_data - currentData
    }

    const data = await sdk.OrgReposAg(variables, requestHeaders)

    // Get repos
    if (data?.organization?.repositories?.edges) {
      const flattenEdge = data?.organization.repositories.edges.map(
        (edge) => edge?.node as MyRepoFieldsFragment
      )
      repos.push(...flattenEdge)
      currentData += flattenEdge.length

      // Manage cursor for next page
      hasNextPage =
        data.organization?.repositories.pageInfo.hasNextPage !== undefined
          ? data.organization?.repositories.pageInfo.hasNextPage
          : false
      variables.after =
        data?.organization?.repositories?.pageInfo?.endCursor !== undefined &&
        data?.organization?.repositories?.pageInfo?.endCursor !== null
          ? data?.organization?.repositories?.pageInfo?.endCursor
          : undefined
    }
  } while (hasNextPage && currentData < max_data)
  return repos
}
