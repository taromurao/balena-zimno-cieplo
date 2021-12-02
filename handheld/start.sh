#!/bin/bash

# see https://github.com/janvda/balena-pulseaudio/issues/13
unset DISPLAY

hciconfig hci0 down
hciconfig hci0 up

sleep 1

echo "Listing all cards (=bluetooth):"
pactl list cards | grep "Card\|Name\|description\|Active Profile"

if [ "$card_profile" != "" ]; then
   if [ "$card_index" = "" ]; then
      card_index=0
   fi
   echo "Set card profile of card $card_index to $card_profile "
   pactl set-card-profile $card_index $card_profile
fi

echo "Listing all sinks (= playback devices):"
pactl list sinks short

if [ "$default_sink" != "" ]; then
   echo "Set default sink to $default_sink"
   pactl set-default-sink $default_sink
fi

echo "Listing default sink and source:"
pactl info | grep "Sink\|Source"

btmon > scan.txt &

./ibeacon_scan 1>/dev/null &

npm run start
