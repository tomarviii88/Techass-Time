const express = require('express');
const app = express();
const connectDB = require('./config/db');

app.use(express.json({ extended: false }));

//Connecting Database
connectDB();

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', ['*']);
  next();
});

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/user', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
