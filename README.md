# GraphQL Data Scrape action

Get GraphQL data in action. 

## Inputs

### `github_personal_access_token`

**Required** Your GitHub personal access token. It should be configured to query or mutate your data based on your query. Use the `classic` personal access token because the newer version doesn't work with the GraphQL endpoint.

### `query_type`

Query selected to run. Default is `whoami`. Other options include:

* `org_repos`: Defaults to `Azure-Samples` org. Use `github_org` input to set a different org.

### `github_org`

The name of the org used by `github_org` query. Default is `Azure-Samples`.

### `save_to_file` 

Save output to file instead of output data to save runtime memory. Defaults to true.

### `save_to_file_name`

Output file name in root. Default is `graphql_data.json`.

## Outputs

### `data`

Query or mutuation information is returned in the `data` output.

## Example usage

Get name of user associated with personal access token

```yaml
- name: Who Am I
  id: whoami
  uses: dfberry/gh-action-graphql@v1.0
  with:
    github_personal_access_token: ${{ secrets.PAT }}
# Use the output from the `hello` step
- name: Get the data
  run: echo "The output was ${{ steps.whoami.data }}"
```