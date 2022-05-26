# result=$(curl --location --request PUT 'http://localhost:8001/setting/client' \
# --header 'Content-Type: application/json')
# echo "Response from server"
# echo $result
# exit

ts-node ../server/src/utils/seed/seeding.ts