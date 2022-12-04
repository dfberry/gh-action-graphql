import {
  RepoInfoAgFragment,
  OrgReposAgQueryVariables,
  Sdk
} from './generated/graphql.sdk'

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
  org_name: string
): Promise<unknown> {
  if (!personal_access_token)
    throw new Error('gitHubGraphQLOrgRepos::missing pat')
  const variables: OrgReposAgQueryVariables = {
    organization: org_name,
    pageSize: 100,
    after: undefined
  }
  const requestHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${personal_access_token}`
  }

  let hasNextPage = true
  const repos: RepoInfoAgFragment[] = []

  do {
    const data = await sdk.OrgReposAg(variables, requestHeaders)

    // Get repos
    if (data?.organization?.repositories?.edges) {
      const flattenEdge = data?.organization.repositories.edges.map(
        (edge) => edge?.node as RepoInfoAgFragment
      )
      repos.push(...flattenEdge)

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
  } while (hasNextPage)
  return repos
}
