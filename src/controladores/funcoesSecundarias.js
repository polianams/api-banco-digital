const { format } = require('date-fns');

const encontrarNumeroDaConta = (contas, numero_conta) => {
    return contas.find((conta) => conta.numero === Number(numero_conta));
}

const encontrarSenhaDaConta = (contas, senha, numero_conta) => {
    return contas.find((conta) => conta.usuario.senha === senha && conta.numero === Number(numero_conta));
}

const criarDataFormatada = () => {
    const data = new Date();
    return format(data, 'yyyy-MM-dd HH:mm:ss');
};

const extratoDaConta = (funcaoExtrato, numero_conta) => {
    return funcaoExtrato.filter(tipoDeExtrato => tipoDeExtrato.numero_conta === numero_conta);
}

module.exports = {
    encontrarNumeroDaConta,
    encontrarSenhaDaConta,
    criarDataFormatada,
    extratoDaConta
}