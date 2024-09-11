const express = require('express');
const app = express();
const port = 3000;

// 提供靜態文件
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`伺服器正在運行在 http://localhost:${port}`);
});
