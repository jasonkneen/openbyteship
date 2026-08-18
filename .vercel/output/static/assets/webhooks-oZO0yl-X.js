import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`Webhooks`,lede:`Project-level endpoints. OpenByteShip delivers a signed JSON envelope when files change.`,children:[(0,i.jsx)(n,{title:`Overview`,children:(0,i.jsxs)(`ul`,{className:`list-disc space-y-2 pl-5`,children:[(0,i.jsx)(`li`,{children:`Use HTTPS endpoint URLs in production. Localhost HTTP URLs are allowed in development.`}),(0,i.jsx)(`li`,{children:`Store the signing secret when it is shown. It is revealed only on creation.`}),(0,i.jsx)(`li`,{children:`Failed deliveries are recorded in the console delivery log.`})]})}),(0,i.jsx)(n,{title:`Events`,children:(0,i.jsxs)(`ul`,{className:`list-disc space-y-2 pl-5`,children:[(0,i.jsxs)(`li`,{children:[(0,i.jsx)(`code`,{className:`text-fg`,children:`file.uploaded`}),` — file marked ready. Payload includes `,(0,i.jsx)(`code`,{className:`text-fg`,children:`source`}),`.`]}),(0,i.jsxs)(`li`,{children:[(0,i.jsx)(`code`,{className:`text-fg`,children:`file.deleted`}),` — after a file is marked deleted.`]}),(0,i.jsxs)(`li`,{children:[(0,i.jsx)(`code`,{className:`text-fg`,children:`image.metadata.created`}),` — image dimensions extracted.`]})]})}),(0,i.jsx)(n,{title:`Signatures`,children:(0,i.jsx)(r,{label:`ts`,code:`const timestamp = request.headers.get("openbyteship-webhook-timestamp")
const signature = request.headers.get("openbyteship-webhook-signature")
const body = await request.text()

const expected = await hmacSha256Hex(
  endpointSecret,
  \`\${timestamp}.\${body}\`,
)

if (signature !== \`v1=\${expected}\`) {
  throw new Error("Invalid webhook signature")
}`})})]})}export{a as component};