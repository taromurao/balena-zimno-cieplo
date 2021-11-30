#!/bin/bash

hciconfig hci0 down
hciconfig hci0 up

btmon > scan.txt &

./ibeacon_scan 1>/dev/null &

npm run start &

balena-idle