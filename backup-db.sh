#!/bin/bash

SOURCE="/root/wedding/data/dbase.sqlite"
DEST="/var/backups/wedding"
DATE=$(date +%Y-%m-%d_%H-%M)

sqlite3 "$SOURCE" ".backup '${DEST}/dbase_${DATE}.sqlite'"

gzip "${DEST}/dbase_${DATE}.sqlite"

find "$DEST" -type f -name "dbase_*.sqlite.gz" -mtime +14 -delete
