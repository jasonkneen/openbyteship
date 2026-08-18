import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`JavaScript SDK`,lede:`Wraps upload sessions, direct file uploads, upload tokens, signed URLs, file lookup, and deletes.`,children:[(0,i.jsxs)(n,{title:`Install`,children:[(0,i.jsx)(r,{label:`bash`,code:`npm add @openbyteship/js`}),(0,i.jsx)(`p`,{children:`The in-product playground uses the same client against this origin — copy the API, not a published package name, if you are running OpenByteShip itself.`})]}),(0,i.jsxs)(n,{title:`Create a client`,children:[(0,i.jsx)(r,{label:`ts`,code:`import { OpenByteShipClient } from "@openbyteship/js"

const obs = new OpenByteShipClient({
  apiKey: process.env.OPENBYTESHIP_API_KEY!,
})

// Browser
const browser = new OpenByteShipClient({ uploadToken: token })`}),(0,i.jsxs)(`p`,{children:[`Never ship an `,(0,i.jsx)(`code`,{className:`text-fg`,children:`obshp_...`}),` project API key to the browser.`]})]}),(0,i.jsx)(n,{title:`Upload a file`,children:(0,i.jsx)(r,{label:`ts`,code:`const uploaded = await obs.upload(file, {
  path: "invoices/2026/invoice.pdf",
  metadata: { customerId: "cus_123" },
  visibility: "public",
  onProgress: (progress) => {
    console.log(Math.round(progress.percent))
  },
})`})}),(0,i.jsx)(n,{title:`Multiple files`,children:(0,i.jsx)(r,{label:`ts`,code:`const results = await obs.uploadMany(files, {
  concurrency: 3,
  pathPrefix: "gallery",
  visibility: "public",
})

const uploaded = results
  .filter((item) => item.status === "fulfilled")
  .map((item) => item.result)`})}),(0,i.jsx)(n,{title:`File methods`,children:(0,i.jsx)(r,{label:`ts`,code:`const { file } = await obs.getFile("invoices/2026/invoice.pdf")
const { signedUrl } = await obs.createSignedUrl(file.path, {
  expiresInSeconds: 10 * 60,
})
const deleted = await obs.deleteFile(file.path)`})}),(0,i.jsx)(n,{title:`Manual flow`,children:(0,i.jsx)(r,{label:`ts`,code:`const created = await obs.createFileUpload("manual/invoice.pdf", {
  byteSize: file.size,
  contentType: file.type || "application/octet-stream",
  method: "single",
})

await fetch(created.upload.url, {
  method: "PUT",
  headers: created.upload.headers,
  body: file,
})

const completed = await obs.completePathUpload(created.file.path, {
  uploadId: created.upload.id,
})`})})]})}export{a as component};