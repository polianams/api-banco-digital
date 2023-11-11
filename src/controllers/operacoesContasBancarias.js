const {
  contas,
  depositos,
  saques,
  transferencias,
} = require("../database/bancodedados");
const {
  encontrarNumeroDaConta,
  encontrarSenhaDaConta,
  criarDataFormatada,
  extratoDaConta,
  contaNaoEncontrada,
} = require("../utils/funcoesSecundarias");

let novoIdContaBancaria = contas.length + 1;
const listarContasBancarias = (req, res) => {
  return res.json(contas);
};

const criarContaBancaria = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json();
  }

  const encontrarCPF = contas.find((conta) => {
    return conta.usuario.cpf === cpf;
  });

  const encontrarEmail = contas.find((conta) => {
    return conta.usuario.email === email;
  });

  if (encontrarCPF || encontrarEmail) {
    return res.status(400).json({
      mensagem: "Já existe uma conta com o cpf ou e-mail informado!",
    });
  }

  const novaContaBancaria = {
    numero: novoIdContaBancaria,
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  novoIdContaBancaria++;
  contas.push(novaContaBancaria);
  return res.status(201).json();
};

const atualizarContaBancaria = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  const numero_conta = req.params.numeroConta;

  if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
    return res.status(400).json({
      mensagem: "Todos os campos devem ser preenchidos.",
    });
  }

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  const encontrarCPF = contas.find((conta) => {
    return conta.usuario.cpf === cpf && conta.numero !== numeroDaConta.numero;
  });

  const encontrarEmail = contas.find((conta) => {
    return (
      conta.usuario.email === email && conta.numero !== numeroDaConta.numero
    );
  });

  if (encontrarCPF) {
    return res.status(400).json({
      mensagem: "O CPF informado já foi cadastrado!",
    });
  }

  if (encontrarEmail) {
    return res.status(400).json({
      mensagem: "O E-mail informado já foi cadastrado!",
    });
  }

  numeroDaConta.usuario = {
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha,
  };

  return res.status(200).json();
};

const deletarContaBancaria = (req, res) => {
  const numero_conta = Number(req.params.numeroConta);

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  if (numeroDaConta.saldo !== 0) {
    return res.status(403).json({
      mensagem: "A conta só pode ser removida se o saldo for zero!",
    });
  }

  contas.splice(numeroDaConta.numero - 1, 1)[0];

  return res.status(200).json();
};

const depositarNaContaBancaria = (req, res) => {
  const { numero_conta, valor } = req.body;

  if (!numero_conta || !valor) {
    return res.status(400).json({
      mensagem: "O número da conta e o valor são obrigatórios!",
    });
  }

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  if (valor <= 0) {
    return res.status(400).json({
      mensagem: "Valor permitido para depósitos acima de zero reais.",
    });
  }

  numeroDaConta.saldo += valor;

  const formatarData = criarDataFormatada();

  const deposito = {
    data: formatarData,
    numero_conta,
    valor,
  };

  depositos.push(deposito);

  return res.status(200).json();
};

const sacarNaContaBancaria = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  if (!numero_conta || !valor || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  const senhaDaConta = encontrarSenhaDaConta(contas, senha, numero_conta);

  if (!senhaDaConta) {
    return res.status(400).json({
      mensagem: "Senha incorreta.",
    });
  }

  if (numeroDaConta.saldo < valor) {
    return res.status(400).json({
      mensagem: "O valor não pode ser menor que zero!",
    });
  }

  numeroDaConta.saldo -= valor;

  const dataFormatada = criarDataFormatada();

  const sacarRecurso = {
    data: dataFormatada,
    numero_conta,
    valor,
  };

  saques.push(sacarRecurso);
  return res.status(200).json();
};

const transferenciaBancaria = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta, valor e senha são obrigatórios!",
    });
  }

  const numeroContaOrigem = encontrarNumeroDaConta(contas, numero_conta_origem);
  const numeroContaDestino = encontrarNumeroDaConta(
    contas,
    numero_conta_destino
  );

  if (!numeroContaDestino) {
    return contaNaoEncontrada(res, "destino");
  }

  if (!numeroContaOrigem) {
    return contaNaoEncontrada(res, "origem");
  }

  if (numeroContaOrigem === numeroContaDestino) {
    return res.status(400).json({
      mensagem:
        "Não é possível realizar transferências bancárias para a sua própria conta!",
    });
  }

  const senhaContaOrigem = contas.find((conta) => {
    return (
      conta.usuario.senha === senha &&
      conta.numero === Number(numero_conta_origem)
    );
  });

  if (!senhaContaOrigem) {
    return res.status(400).json({
      mensagem: "Senha incorreta, não foi possível realizar a transferência.",
    });
  }

  if (senhaContaOrigem.saldo < valor) {
    return res.status(400).json({
      mensagem: "Saldo insuficiente!",
    });
  }

  numeroContaOrigem.saldo -= valor;
  numeroContaDestino.saldo += valor;

  const dataFormatada = criarDataFormatada();

  const transferencia = {
    data: dataFormatada,
    numero_conta_origem,
    numero_conta_destino,
    valor,
  };

  transferencias.push(transferencia);

  return res.status(200).json();
};

const verificarSaldo = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta e a senha são obrigatórios!",
    });
  }

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  const senhaDaConta = encontrarSenhaDaConta(contas, senha, numero_conta);

  if (!senhaDaConta) {
    return res.status(400).json({
      mensagem: "Senha incorreta.",
    });
  }

  return res.status(200).json({
    saldo: numeroDaConta.saldo,
  });
};

const extratoContaBancaria = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res.status(400).json({
      mensagem: "O número da conta e a senha são obrigatórios!",
    });
  }

  const numeroDaConta = encontrarNumeroDaConta(contas, numero_conta);

  if (!numeroDaConta) {
    return res.status(400).json({
      mensagem: "Conta bancária não encontada!",
    });
  }

  const senhaDaConta = encontrarSenhaDaConta(contas, senha, numero_conta);

  if (!senhaDaConta) {
    return res.status(400).json({
      mensagem: "Senha incorreta.",
    });
  }

  const transferenciaEnviada = transferencias.filter((transferencia) => {
    return transferencia.numero_conta_origem === numero_conta;
  });

  const transferenciaRecebida = transferencias.filter((transferencia) => {
    return transferencia.numero_conta_destino === numero_conta;
  });

  return res.status(200).json({
    depositos: extratoDaConta(depositos, numero_conta),
    saques: extratoDaConta(saques, numero_conta),
    transferenciasEnviadas: transferenciaEnviada,
    transferenciasRecebidas: transferenciaRecebida,
  });
};

module.exports = {
  listarContasBancarias,
  criarContaBancaria,
  atualizarContaBancaria,
  deletarContaBancaria,
  depositarNaContaBancaria,
  sacarNaContaBancaria,
  transferenciaBancaria,
  verificarSaldo,
  extratoContaBancaria,
};
