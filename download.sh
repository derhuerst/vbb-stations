#!/bin/sh

curl -L https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/stops.txt > stops.txt
curl -L https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/routes.txt > routes.txt
curl -L https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/trips.txt > trips.txt
curl -L https://raw.githubusercontent.com/derhuerst/vbb-gtfs/master/stop_times.txt > stop_times.txt
