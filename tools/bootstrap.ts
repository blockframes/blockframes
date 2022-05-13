#!/usr/bin/env npx ts-node -r tsconfig-paths/register -r dotenv/config -P tools/tsconfig.tools.json

import { resolve } from "node:path";

require(resolve(process.cwd(), 'apps/backend-ops/src/main.ts'));
