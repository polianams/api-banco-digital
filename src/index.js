const express = require("express");
const { rota } = require("./routes/rotas");

const app = express();

app.use(express.json());
app.use(rota);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`O Servidor está sendo executado na porta ${PORT}.`);
});
