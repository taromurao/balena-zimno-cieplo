#!/bin/bash

hciconfig hci0 down
hciconfig hci0 up

sleep 1

btmon > /var/ble-emitter/scan.txt &

./ibeacon_scan 1>/dev/null &

npm run start

balena-idle 