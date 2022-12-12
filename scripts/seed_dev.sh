# result=$(curl --location --request PUT 'http://0.0.0.0:8001/setting/client' \
# --header 'Content-Type: application/json')
# echo "Response from server"
# echo $result
# exit

ts-node ../server/src/utils/seed/seeding.ts