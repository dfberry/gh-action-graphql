# GraphQL Data Scrape action

Get GraphQL data in action. 

## Inputs

### `github_personal_access_token`

**Required** Your GitHub personal access token. It should be configured to query or mutate your data based on your query. Use the `classic` personal access token because the newer version doesn't work with the GraphQL endpoint.

### `query_type`

Query selected to run. Default is `whoami`. Other options include:

* `org_repos`: Defaults to `Azure-Samples` org. Use `github_org` input to set a different org. Uses v2 query.
* `org_repos_extended`: Include last pr, commit, issue. Uses v3 query.

### `github_org`

The name of the org used by `github_org` query. Default is `Azure-Samples`.

### `save_to_file` 

Save output to file instead of output data to save runtime memory. Default is true.

### `save_to_file_name`

Output file name in root. Default is `graphql_data.json`.

### `max_page_size`

Page size used in query, if query can return a page. Default is 100.

### `rate_limit_delay`

If paging, use rate limit to stay within rate limits. Time in milliseconds. Default is 5000.

## Outputs

### `data`

Query or mutuation information is returned in the `data` output.

## Example usage - who am i

Get name of user associated with personal access token

```yaml
- name: Who Am I
  id: whoami
  uses: dfberry/gh-action-graphql@v1.8
  with:
    github_personal_access_token: ${{ secrets.PAT }}
# Use the output from the `hello` step
- name: Get the data
  run: echo "The output was ${{ steps.whoami.data }}"
```

## Example usage - get repos and save to Azure Blob Storage

The `Azure-Samples` org takes about 12 minutes to generate data. 

```yaml
name: GraphQL - repos

on: 
  workflow_dispatch:

jobs:
  graphql:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    name: GraphQL data scrape repos
    outputs:
      output1: ${{ steps.repos.outputs.data }}
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3    
      - name: Get data
        id: repos
        uses: dfberry/gh-action-graphql@v1.8
        with:
          github_personal_access_token: ${{ secrets.PAT }}
          query_type: 'org_repos'
          save_to_file: 'true'
          save_to_file_name: repos.json          
      - name: Create file from cat
        run: |
          cat <<EOF > repos.cat.json
          ${{ steps.repos.outputs.data }}
      - name: List files
        id: list_files
        run: |
            pwd && ls -la 
      - name: Example 1: Upload action's file to Azure Storage
        uses: fixpoint/azblob-upload-artifact@v4
        with:
          connection-string: ${{ secrets.AZURE_STORAGE_CONNECTION_STRING }}
          path: ./
          name: graphql_data.json
      - name: Example 2: Upload actions file to repo artifacts
        uses: actions/upload-artifact@v3
        with:
          name: graphql_data.json
          path: ./
```