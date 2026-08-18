import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`Frameworks`,lede:`Mint an upload token on the server, then upload from the browser. Same pattern in every stack.`,children:[(0,i.jsx)(n,{title:`TanStack Start`,children:(0,i.jsx)(r,{label:`tsx`,code:`export const Route = createFileRoute("/api/obs/upload-token")({
  server: {
    handlers: {
      POST: async () => {
        const { uploadToken } = await obs.createUploadToken({
          folder: "uploads",
          visibility: "public",
          maxUploadBytes: 10 * 1024 * 1024,
        })
        return Response.json({
          token: uploadToken.token,
          expiresAt: uploadToken.expiresAt,
        })
      },
    },
  },
})`})}),(0,i.jsx)(n,{title:`Next.js`,children:(0,i.jsx)(r,{label:`ts`,code:`// app/api/obs/upload-token/route.ts
export async function POST() {
  const { uploadToken } = await obs.createUploadToken({
    folder: "uploads",
    visibility: "public",
    maxUploadBytes: 10 * 1024 * 1024,
  })
  return NextResponse.json({
    token: uploadToken.token,
    expiresAt: uploadToken.expiresAt,
  })
}`})}),(0,i.jsx)(n,{title:`Also documented`,children:(0,i.jsxs)(`p`,{children:[`Astro, Remix, SvelteKit, Express, Hono, Elysia, and NestJS follow the same split: keep`,` `,(0,i.jsx)(`code`,{className:`text-fg`,children:`OPENBYTESHIP_API_KEY`}),` on the server, return an`,` `,(0,i.jsx)(`code`,{className:`text-fg`,children:`obut_`}),` token to the client, then call`,` `,(0,i.jsx)(`code`,{className:`text-fg`,children:`upload()`}),`.`]})})]})}export{a as component};