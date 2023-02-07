# 1.15.1

* update @diberry/github-magic@2.1.1

# 1.15.0

* update @diberry/github-magic@2.1.0 - more extended properties

# 1.14.9

* update @diberry/github-magic@2.0.3 - break loop cursor and max items

# 1.14.8

* update @diberry/github-magic:2.0.2 - break loop when cursor is empty

# 1.14.7

* `repos_extended`: log each iteration

# 1.14.6

* Fix main loop

# 1.14.5

* Retag only

# 1.14.4
* Add 'status' as query type - returns package.json version

# 1.14.3

* Expanded PullRequestFragment_v3 to include dates
* Added GraphQL comments to GraphQL schemas
* Fix build error with legacy dependencies "git install --legacy-peer-deps
* Removed old ./dist/main
* TBD: conflicing dependencies
    * Fix for now - 2 separate packages - 1 local and 1 build


# 1.14.2

* Added v3 query to main

# 1.14.1

* Node 18 
  * Added notes about how to publish action

    ```
    git add action.yml index.js node_modules/* package.json package-lock.json README.md
    git commit -m "My first action is ready"
    git tag -a -m "My first action release" v1.1
    git push --follow-tags
    ```

  * When I updated to Node 18, ncc failed with the following error which needed an env param in package.json script to fix. 
  
    ```json
    "package": "npm run build && NODE_OPTIONS='--openssl-legacy-provider' ncc build -o package --no-cache --source-map --license licenses.txt",
    ```

    ```error
    ncc: Version 0.31.1
    ncc: Compiling file index.js into CJS
    node:internal/crypto/hash:71
    this[kHandle] = new _Hash(algorithm, xofLen);
                    ^

    Error: error:0308010C:digital envelope routines::unsupported
        at new Hash (node:internal/crypto/hash:71:19)
        at Object.createHash (node:crypto:133:10)
        at BulkUpdateDecorator.hashFactory (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:1262958)
        at BulkUpdateDecorator.update (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:1261761)
        at OriginalSource.updateHash (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:1530933)
        at NormalModule._initBuildHash (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:421196)
        at handleParseResult (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:422270)
        at /Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:423657
        at processResult (/Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:419523)
        at /Users/dina/repos/dfberry/4.src.github-actions/gh-action-graphql/node_modules/@vercel/ncc/dist/ncc/index.js.cache.js:37:420632 {
    opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
    library: 'digital envelope routines',
    reason: 'unsupported',
    code: 'ERR_OSSL_EVP_UNSUPPORTED'
    }
    ```