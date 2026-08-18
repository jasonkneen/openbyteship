import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`React SDK`,lede:`Helpers for uploads, progress state, and image placeholders. Built on the JavaScript client.`,children:[(0,i.jsxs)(n,{title:`Single upload`,children:[(0,i.jsxs)(`p`,{children:[`Mint a token from your server, then pass the client into a hook or call `,(0,i.jsx)(`code`,{className:`text-fg`,children:`upload`}),` directly.`]}),(0,i.jsx)(r,{label:`tsx`,code:`import { OpenByteShipClient } from "@openbyteship/js"
import { useMemo, useState } from "react"

function ReadyUploader({ uploadToken }: { uploadToken: string }) {
  const obs = useMemo(
    () => new OpenByteShipClient({ uploadToken }),
    [uploadToken],
  )
  const [progress, setProgress] = useState(0)

  return (
    <input
      type="file"
      onChange={(event) => {
        const file = event.currentTarget.files?.[0]
        if (file) {
          void obs.upload(file, {
            path: \`avatars/\${file.name}\`,
            onProgress: (p) => setProgress(p.percent),
          })
        }
      }}
    />
  )
}`})]}),(0,i.jsx)(n,{title:`Displaying images`,children:(0,i.jsx)(r,{label:`tsx`,code:`export function Avatar({ file }: { file: UploadedFile }) {
  const image = file.metadata?.image as { dominantColor?: string } | undefined
  return (
    <img
      alt="User avatar"
      src={file.url ?? undefined}
      width={400}
      height={400}
      style={{ background: image?.dominantColor ?? "#121214" }}
    />
  )
}`})})]})}export{a as component};