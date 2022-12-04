import { GITHUB_GRAPHQL } from '../constants'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test
} from '@jest/globals'
import dotenv from 'dotenv'
import { getSdk, WhoAmIQuery } from '../generated/graphql.sdk'
import { gitHubGraphQLWhoAmI, gitHubGraphQLOrgReposAg } from '../getdata'
import { GraphQLClient } from 'graphql-request'
import * as mockOrgReposAgData from '../mockdata/orgreposag1.json'
import * as mockWhoAmIData from '../mockdata/whoami1.json'

dotenv.config()

let realSdk = getSdk(new GraphQLClient(GITHUB_GRAPHQL))
// @ts-ignore

describe('whoAmI', () => {
  let pat: string

  beforeAll(() => {
    pat = process.env.PAT || ''
  })

  test('WhoAmI success', async () => {
    let spy = jest
      .spyOn(realSdk, 'WhoAmI')
      .mockImplementation(async () => Promise.resolve(mockWhoAmIData))
    const user = await gitHubGraphQLWhoAmI(realSdk, pat)
    expect(user).toEqual(mockWhoAmIData.viewer.login)
    spy.mockReset()
  })
  test('Repos success', async () => {
    let spy = jest
      .spyOn(realSdk, 'OrgReposAg')
      .mockImplementation(async () => Promise.resolve(mockOrgReposAgData))
    const repos = await gitHubGraphQLOrgReposAg(realSdk, pat, 'Azure-Sample')
    expect(typeof repos).toEqual('Array')
    spy.mockReset()
  })
})
