#!/bin/sh

curl -L --compressed https://vbb-gtfs.jannisr.de/latest/stops.csv > stops.csv
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/routes.csv > routes.csv
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/trips.csv > trips.csv
curl -L --compressed https://vbb-gtfs.jannisr.de/latest/stop_times.csv > stop_times.csv
