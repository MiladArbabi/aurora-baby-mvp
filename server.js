const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Aurora Baby MVP Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});