import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const projectRoot=dirname(fileURLToPath(import.meta.url));
const workspaceRoot=resolve(projectRoot,"../..");
const config: NextConfig={output:"standalone",outputFileTracingRoot:workspaceRoot,turbopack:{root:workspaceRoot},poweredByHeader:false,headers:async()=>[{source:"/(.*)",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"no-referrer"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},{key:"Content-Security-Policy",value:"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:8000"}]}]};
export default config;
