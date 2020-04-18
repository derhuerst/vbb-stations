#!/bin/bash

set -e

cd $(dirname $0)

base_url='https://vbb-gtfs.jannisr.de/latest/'
download () {
	curl -z -L --compressed --etag-compare "$1.etag" --etag-save "$1.etag" $base_url$1 -o $1
}

download 'stops.csv'
download 'routes.csv'
download 'trips.csv'
download 'stop_times.csv'

ls -lh *.csv
