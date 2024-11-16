const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(
  "/",
  createProxyMiddleware({
    target: process.env.REDIRECT_TARGET,
    changeOrigin: true,
  }),
);

app.listen(process.env.PORT || 80, () => {
  console.log(`App listening on port ${process.env.PORT || 80}`);
});
