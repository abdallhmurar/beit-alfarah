import {env} from "cloudflare:workers";
export async function GET(_r:Request,{params}:{params:Promise<{key:string[]}>}){const{key}=await params,o=await env.BUCKET.get(key.join("/"));if(!o)return new Response("Not found",{status:404});const h=new Headers();o.writeHttpMetadata(h);h.set("cache-control","public, max-age=31536000, immutable");return new Response(o.body,{headers:h})}
