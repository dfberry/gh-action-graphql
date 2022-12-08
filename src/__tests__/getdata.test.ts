import { GITHUB_GRAPHQL, TIME_0_SECONDS } from '../constants'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test
} from '@jest/globals'
import dotenv from 'dotenv'
import { getSdk, MyRepoFieldsFragment } from '../generated/graphql.sdk'
import { gitHubGraphQLWhoAmI, gitHubGraphQLOrgReposAg } from '../getdata'
import { GraphQLClient } from 'graphql-request'
import { TEST_DATA_WHOAMI_1 } from '../mockdata/whoami.data'
import { TEST_DAT_ORG_REPO_ITEM_1 } from '../mockdata/orgrepoag.data'

console.log(`mockWhoAmIData 1 = ${JSON.stringify(TEST_DATA_WHOAMI_1)}`)

dotenv.config()

let realSdk = getSdk(new GraphQLClient(GITHUB_GRAPHQL))
// @ts-ignore

describe('whoAmI', () => {
  let pat: string

  beforeAll(() => {
    pat = process.env.github_personal_access_token || ''
  })

  test('WhoAmI success', async () => {
    console.log(`mockWhoAmIData 2 = ${JSON.stringify(TEST_DATA_WHOAMI_1)}`)

    let spy = jest
      .spyOn(realSdk, 'WhoAmI')
      .mockImplementation(async () => Promise.resolve(TEST_DATA_WHOAMI_1))
    const user = await gitHubGraphQLWhoAmI(realSdk, pat)
    expect(user).toEqual(TEST_DATA_WHOAMI_1)
    spy.mockReset()
  })
  test('Repos success', async () => {
    let spy = jest
      .spyOn(realSdk, 'OrgReposAg')
      .mockImplementation(async () => Promise.resolve(TEST_DAT_ORG_REPO_ITEM_1))

    // These values are based on current mock data
    const numberOfRecordsReturned = 2 // crosses a page
    const pageSize = 2
    const rateLimitMs = TIME_0_SECONDS

    const repos = await gitHubGraphQLOrgReposAg(
      realSdk,
      pat,
      'Azure-Sample',
      numberOfRecordsReturned,
      pageSize,
      rateLimitMs
    )
    expect(Array.isArray(repos)).toBe(true)
    expect(repos.length).toEqual(100)
    expect(typeof repos[0].id).toEqual('string')
    expect(typeof repos[0].updatedAt).toEqual('string')
    spy.mockReset()
  })
})
