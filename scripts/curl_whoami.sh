pat=$1
echo "$pat"

curl \
-H "Authorization: bearer $pat" \
-H "Content-Type: application/json" \
-X POST \
-d "@whoami_data.json" \
https://api.github.com/graphql