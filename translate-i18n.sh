#!/bin/bash
set -ex
node "./translate-prepare.js"
pnpm translate
node "./translate-finish.js"
