// --- LÓGICA DE NAVEGAÇÃO ---
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        history.pushState({ modalOpen: modalId }, "", `#${modalId}`);
    }
}

function fecharModal() {
    history.back();
}

window.onpopstate = function(event) {
    const modais = document.querySelectorAll('.modal');
    modais.forEach(m => m.style.display = 'none');
};

// --- LÓGICA DE CÁLCULO ---
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularINSS(bruto) {
    let desconto = 0;
    if (bruto <= 1412.00) {
        desconto = bruto * 0.075;
    } else if (bruto <= 2666.68) {
        desconto = (1412.00 * 0.075) + ((bruto - 1412.00) * 0.09);
    } else if (bruto <= 4000.03) {
        desconto = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((bruto - 2666.68) * 0.12);
    } else if (bruto <= 7786.02) {
        desconto = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((bruto - 4000.03) * 0.14);
    } else {
        desconto = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((7786.02 - 4000.03) * 0.14);
    }
    return desconto;
}

function calcularIRRF(baseCalculo) {
    let desconto = 0;
    if (baseCalculo <= 2112.00) {
        desconto = 0;
    } else if (baseCalculo <= 2826.65) {
        desconto = (baseCalculo * 0.075) - 158.40;
    } else if (baseCalculo <= 3751.05) {
        desconto = (baseCalculo * 0.15) - 370.40;
    } else if (baseCalculo <= 4664.68) {
        desconto = (baseCalculo * 0.225) - 651.73;
    } else {
        desconto = (baseCalculo * 0.275) - 884.96;
    }
    return Math.max(0, desconto);
}

function calcularSalarioLiquido() {
    const bruto = parseFloat(document.getElementById('salario-bruto').value);
    const deps = parseInt(document.getElementById('dependentes').value) || 0;
    const outros = parseFloat(document.getElementById('outros-descontos').value) || 0;

    if (!bruto) return alert('Digite o salário bruto!');

    const inss = calcularINSS(bruto);
    const deducaoDeps = deps * 189.59;
    const baseIRRF = bruto - inss - deducaoDeps;
    const irrf = calcularIRRF(baseIRRF);
    const liquido = bruto - inss - irrf - outros;

    document.getElementById('res-inss').innerText = `- ${formatarMoeda(inss)}`;
    document.getElementById('res-irrf').innerText = `- ${formatarMoeda(irrf)}`;
    document.getElementById('res-liquido').innerText = formatarMoeda(liquido);
    document.getElementById('resultado-salario').style.display = 'block';
}

function calcularFerias() {
    const bruto = parseFloat(document.getElementById('ferias-salario').value);
    const dias = parseInt(document.getElementById('ferias-dias').value) || 30;
    const vender = document.getElementById('ferias-vender').value === 'sim';

    if (!bruto) return alert('Digite o salário!');

    let valorFerias = (bruto / 30) * dias;
    let umTerco = valorFerias / 3;
    let abono = 0;
    let umTercoAbono = 0;

    if (vender) {
        abono = (bruto / 30) * 10;
        umTercoAbono = abono / 3;
    }

    const totalBruto = valorFerias + umTerco + abono + umTercoAbono;
    const totalLiquido = totalBruto * 0.90; 

    document.getElementById('res-total-ferias').innerText = formatarMoeda(totalLiquido);
    document.getElementById('resultado-ferias').style.display = 'block';
}

function calcularDecimo() {
    const bruto = parseFloat(document.getElementById('decimo-salario').value);
    const meses = parseInt(document.getElementById('decimo-meses').value);

    if (!bruto) return alert('Digite o salário!');

    const total = (bruto / 12) * meses;
    const primeira = total / 2;
    const segunda = total / 2 - (total * 0.08); 

    document.getElementById('res-decimo-1').innerText = formatarMoeda(primeira);
    document.getElementById('res-decimo-2').innerText = formatarMoeda(segunda);
    document.getElementById('resultado-decimo').style.display = 'block';
}

function calcularRescisao() {
    const salario = parseFloat(document.getElementById('resc-salario').value);
    const saldoFGTS = parseFloat(document.getElementById('resc-fgts').value) || 0;
    const motivo = document.getElementById('resc-motivo').value;

    if (!salario) return alert('Digite o salário!');

    const verbasBasicas = salario + (salario/12 * 6);
    let total = motivo === 'sem_justa_causa' ? verbasBasicas + (saldoFGTS * 0.40) + saldoFGTS : verbasBasicas;

    document.getElementById('res-total-rescisao').innerText = formatarMoeda(total);
    document.getElementById('resultado-rescisao').style.display = 'block';
}