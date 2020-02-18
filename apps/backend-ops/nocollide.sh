#! /usr/bin/env bash

# This script is used to transform a golden database backup to
# alternate version with organization names suffixed.
# say you have a golden data with "OrgA", "OrgB", "OrgC", etc.
# It'll generate a DEMO1 version with "OrgA 1", "OrgB 1",...
# and a DEMO2 version with "OrgA 2", "OrgB 2",...
# this is a last minute quick fix to get the demos working for Toronto

FILE="$1"
RAW="${FILE%.jsonl}"

echo "INPUT=${FILE}"
echo "NAME=${RAW}"

for i in {1..4}; do
  OUTPUT="${RAW}-DEMO${i}.jsonl"
  echo "OUTPUT TO: ${OUTPUT}"
  cat "${FILE}" | sed -E "s;({\"docPath\":\"orgs/[a-zA-Z0-9]+\".*\"name\":)\"([^\"]+)\"(.*);\1\"\2 ${i}\"\3;" >"${OUTPUT}"
done
