const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: "https://myuniqprefix-chatbot-ca-acr-002.kindpond-e24c3f7b.northeurope.azurecontainerapps.io",
    changeOrigin: true,
  }),
);

app.listen(process.env.PORT || 80, () => {
  console.log(`App listening on port ${process.env.PORT || 80}`);
});
