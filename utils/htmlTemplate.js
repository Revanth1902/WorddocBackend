module.exports = (title, content) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        line-height: 1.6;
      }
      img {
        max-width: 100%;
      }
      h1, h2, h3 {
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    ${content}
  </body>
  </html>
  `;
};
