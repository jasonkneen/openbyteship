import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`Go SDK`,lede:`Use from trusted backend services to upload files, mint browser upload tokens, and create signed URLs.`,children:[(0,i.jsx)(n,{title:`Install`,children:(0,i.jsx)(r,{label:`bash`,code:`go get github.com/openbyteship/openbyteship-go`})}),(0,i.jsx)(n,{title:`Upload route`,children:(0,i.jsx)(r,{label:`go`,code:`uploaded, err := client.Upload(r.Context(), openbyteship.UploadInput{
  Reader:      file,
  Filename:    header.Filename,
  ContentType: header.Header.Get("Content-Type"),
  Path:        "uploads/" + header.Filename,
  Visibility:  openbyteship.VisibilityPublic,
})`})})]})}export{a as component};