

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const sequelize = require('./config/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const expenseRoutes = require('./routes/expenseRoutes');
const userRoutes = require('./routes/userRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const testMailRoute = require("./routes/testMail");
const passwordRoutes = require('./routes/passwordRoutes');
require('./models/ForgotPasswordRequest');

app.use('/password', passwordRoutes);
app.use("/mail", testMailRoute);
app.use('/expense', expenseRoutes);
app.use('/user', userRoutes);
app.use('/premium', premiumRoutes);



app.post("/test-ai", async (req, res) => {
  try {
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give one category for: Lunch at Domino's"
    });

    res.json({ category: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI test failed" });
  }
});

const PORT = process.env.PORT || 4000;

sequelize.sync()
.then(() => {

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

})
.catch(err => {
  console.log(err);
});

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});
