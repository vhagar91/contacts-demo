#!/bin/bash

# Number of concurrent requests
concurrency=5

# Endpoint URL
url='http://localhost:3000/api/v1/contacts'

# Payload data
payload='{"github_username": "sdax", "fresdesk_subdomain": "quickbase4553"}'
# Define the curl command with necessary headers
curl_command="curl '${url}' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'Connection: keep-alive' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: adminer_key=1eee7ddc098e37533faffc97ce2bbbcb; adminer_settings=; adminer_version=4.8.1; adminer_permanent=c2VydmVy-bXlzcWxfZGI%3D-cm9vdA%3D%3D-%3A8%2Fr6wLO85n%2B2ofaS; adminer_sid=ke9fh7qd9bbvltugtbmu7i7kq8; contacts-session-id=s%3Ap3knv1R3YfqsGiTRgai7EmFDBApOrvwi.lMq9AdsxVTN37hLUEoe8UQkaaLFD6ATJwwCVpwD6YpM' \
  -H 'Origin: http://localhost:3000' \
  -H 'Referer: http://localhost:3000/api-docs' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' \
  -H 'accept: */*' \
  -H 'sec-ch-ua: \"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: \"macOS\"' \
  --data-raw '${payload}'"

# Function to execute curl commands concurrently
execute_concurrently() {
  for ((i=1; i<=$concurrency; i++))
  do
    eval "$curl_command" &  # Execute curl command in the background
  done

  wait  # Wait for all background jobs to complete
}

# Measure the total time taken for concurrent requests
echo "Executing ${concurrency} concurrent requests..."
start_time=$(date +%s.%N)
execute_concurrently
end_time=$(date +%s.%N)
total_time=$(echo "$end_time - $start_time" | bc)

# Display results
echo "Total execution time for ${concurrency} concurrent requests: ${total_time} seconds"
