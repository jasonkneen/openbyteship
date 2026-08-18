import{s as e}from"./link-DF2nwegC.js";import{n as t,t as n}from"./docs-layout-C4Q1Aa7P.js";import{t as r}from"./code-block-5xfwUllb.js";var i=e();function a(){return(0,i.jsxs)(t,{title:`Python SDK`,lede:`Use from backend services to upload files, create browser upload tokens, and generate signed URLs.`,children:[(0,i.jsx)(n,{title:`Install`,children:(0,i.jsx)(r,{label:`bash`,code:`pip install openbyteship`})}),(0,i.jsx)(n,{title:`Upload a file`,children:(0,i.jsx)(r,{label:`python`,code:`import os
from openbyteship import OpenByteShipClient, Visibility

client = OpenByteShipClient(api_key=os.environ["OPENBYTESHIP_API_KEY"])

with open("photo.jpg", "rb") as photo:
    uploaded = client.upload(
        photo,
        filename="photo.jpg",
        content_type="image/jpeg",
        path="uploads/photo.jpg",
        visibility=Visibility.PUBLIC,
    )

print(uploaded.id, uploaded.url)`})}),(0,i.jsx)(n,{title:`Private files`,children:(0,i.jsx)(r,{label:`python`,code:`signed = client.create_signed_url(
    private_file.path,
    expires_in_seconds=15 * 60,
)
download_url = signed.signed_url.url`})})]})}export{a as component};