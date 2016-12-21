#!/bin/sh

curl -L --compressed https://vbb-gtfs.jannisr.de/latest/stops.txt > stops.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/routes.txt > routes.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/trips.txt > trips.txt
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/stop_times.txt > stop_times.txt
