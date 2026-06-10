





require('dotenv').config();

const express = require('express');
const cors = require('cors');
// const dotenv = require('dotenv');
const sequelize = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const premiumRoutes = require('./routes/premiumRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/premium', premiumRoutes);

sequelize.sync()
.then(() => {
  app.listen(4000, () => console.log('Server running on port 4000'));
});
