const express = require("express");
const { validarSenha } = require("../middleware/intermediario");
const {
  listarContasBancarias,
  criarContaBancaria,
  atualizarContaBancaria,
  deletarContaBancaria,
  depositarNaContaBancaria,
  sacarNaContaBancaria,
  transferenciaBancaria,
  verificarSaldo,
  extratoContaBancaria,
} = require("../controllers/operacoesContasBancarias");

const rota = express();

rota.get("/contas", validarSenha, listarContasBancarias);
rota.post("/contas", criarContaBancaria);
rota.put("/contas/:numeroConta/usuario", atualizarContaBancaria);
rota.delete("/contas/:numeroConta", deletarContaBancaria);
rota.post("/transacoes/depositar", depositarNaContaBancaria);
rota.post("/transacoes/sacar", sacarNaContaBancaria);
rota.post("/transacoes/transferir", transferenciaBancaria);
rota.get("/contas/saldo", verificarSaldo);
rota.get("/contas/extrato", extratoContaBancaria);

module.exports = { rota };
