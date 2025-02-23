#!/bin/bash

export PGPASSWORD="RP2001MINHAJ.CSECU"

echo "Starting database configuration..."
psql -U postgres cpms < ./bin/sql/database.sql
echo "Finished database configuration !"