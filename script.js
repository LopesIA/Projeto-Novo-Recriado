// --- ESTADO GLOBAL ---
let calculoPendente = null;

// --- NAVEGAÇÃO ---
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Esconde resultados anteriores para limpar a tela
        const boxes = document.querySelectorAll('.resultado-box');
        boxes.forEach(b => b.classList.add('hidden'));
        
        // Manipula o histórico para o botão voltar do celular funcionar
        window.scrollTo(0, 0);
        history.pushState({ modalOpen: modalId }, "", `#${modalId}`);
    }
}

function fecharModal() {
    // Se o modal de anúncio estiver aberto, bloqueia o voltar
    if(document.getElementById('overlay-anuncio').style.display === 'flex') return;
    history.back();
}

// Ouve o botão voltar do Android/Navegador
window.onpopstate = function(event) {
    const modais = document.querySelectorAll('.modal');
    modais.forEach(m => m.style.display = 'none');
    document.getElementById('overlay-anuncio').style.display = 'none';
};

// --- LÓGICA DE ANÚNCIO (O Pulo do Gato) ---
function prepararCalculo(tipo) {
    calculoPendente = tipo;

    // 1. Valida antes de mostrar anúncio
    if (!validarCampos(tipo)) return;

    // 2. Mostra o Overlay (Simula Interstitial)
    const overlay = document.getElementById('overlay-anuncio');
    overlay.style.display = 'flex';

    // 3. Trava o botão de fechar
    const btnFechar = document.getElementById('btn-fechar-anuncio');
    btnFechar.style.opacity = '0'; 
    btnFechar.style.pointerEvents = 'none'; // Impede clique

    // 4. Libera o botão após 3 segundos
    setTimeout(() => {
        btnFechar.style.opacity = '1';
        btnFechar.style.pointerEvents = 'all';
    }, 3000);
}

function fecharAnuncioE_MostrarResultado() {
    document.getElementById('overlay-anuncio').style.display = 'none';
    executarCalculo(calculoPendente);
}

// --- VALIDAÇÃO ---
function validarCampos(tipo) {
    if (tipo === 'salario' && !document.getElementById('salario-bruto').value) { alert('Digite o salário!'); return false; }
    if (tipo === 'ferias' && !document.getElementById('ferias-salario').value) { alert('Digite o salário!'); return false; }
    if (tipo === 'decimo' && !document.getElementById('decimo-salario').value) { alert('Digite o salário!'); return false; }
    if (tipo === 'rescisao') {
        if(!document.getElementById('resc-salario').value) { alert('Digite o salário!'); return false; }
        if(!document.getElementById('resc-inicio').value || !document.getElementById('resc-fim').value) { alert('Preencha as datas!'); return false; }
    }
    return true;
}

// --- MATEMÁTICA ---
function calcularINSS(bruto) {
    let desconto = 0;
    if (bruto <= 1412.00) desconto = bruto * 0.075;
    else if (bruto <= 2666.68) desconto = (1412.00 * 0.075) + ((bruto - 1412.00) * 0.09);
    else if (bruto <= 4000.03) desconto = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((bruto - 2666.68) * 0.12);
    else if (bruto <= 7786.02) desconto = (1412.00 * 0.075) + ((2666.68 - 1412.00) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((bruto - 4000.03) * 0.14);
    else desconto = 908.85; 
    return desconto;
}

function calcularIRRF(base) {
    let desc = 0;
    if (base <= 2259.20) desc = 0;
    else if (base <= 2826.65) desc = (base * 0.075) - 169.44;
    else if (base <= 3751.05) desc = (base * 0.15) - 381.44;
    else if (base <= 4664.68) desc = (base * 0.225) - 662.77;
    else desc = (base * 0.275) - 896.00;
    return Math.max(0, desc);
}

function executarCalculo(tipo) {
    if (tipo === 'salario') {
        const bruto = parseFloat(document.getElementById('salario-bruto').value);
        const deps = parseInt(document.getElementById('dependentes').value) || 0;
        const outros = parseFloat(document.getElementById('outros-descontos').value) || 0;

        const inss = calcularINSS(bruto);
        const deducaoDeps = deps * 189.59;
        const baseIRRF = bruto - inss - deducaoDeps;
        const irrf = calcularIRRF(baseIRRF);
        const liquido = bruto - inss - irrf - outros;

        document.getElementById('res-inss').innerText = `- ${formatarMoeda(inss)}`;
        document.getElementById('res-irrf').innerText = `- ${formatarMoeda(irrf)}`;
        document.getElementById('res-liquido').innerText = formatarMoeda(liquido);
        document.getElementById('resultado-salario').classList.remove('hidden');
    }

    if (tipo === 'ferias') {
        const bruto = parseFloat(document.getElementById('ferias-salario').value);
        const dias = parseInt(document.getElementById('ferias-dias').value) || 30;
        const vender = document.getElementById('ferias-vender').value === 'sim';
        
        let valorFerias = (bruto / 30) * dias;
        let terco = valorFerias / 3;
        let abono = 0;
        let tercoAbono = 0;

        if (vender) {
            abono = (bruto / 30) * 10;
            tercoAbono = abono / 3;
        }

        const baseTotal = valorFerias + terco + abono + tercoAbono;
        const inssEst = calcularINSS(baseTotal);
        const irrfEst = calcularIRRF(baseTotal - inssEst);
        const liquido = baseTotal - inssEst - irrfEst;

        document.getElementById('res-ferias-bruto').innerText = formatarMoeda(valorFerias);
        document.getElementById('res-ferias-terco').innerText = formatarMoeda(terco);
        document.getElementById('res-ferias-abono').innerText = formatarMoeda(abono + tercoAbono);
        document.getElementById('res-ferias-descontos').innerText = `- ${formatarMoeda(inssEst + irrfEst)}`;
        document.getElementById('res-total-ferias').innerText = formatarMoeda(liquido);
        document.getElementById('resultado-ferias').classList.remove('hidden');
    }

    if (tipo === 'decimo') {
        const bruto = parseFloat(document.getElementById('decimo-salario').value);
        const meses = parseInt(document.getElementById('decimo-meses').value);
        
        const total = (bruto / 12) * meses;
        const primeira = total / 2;
        const inss = calcularINSS(total);
        const irrf = calcularIRRF(total - inss);
        const segunda = total - primeira - inss - irrf;

        document.getElementById('res-decimo-1').innerText = formatarMoeda(primeira);
        document.getElementById('res-decimo-2').innerText = formatarMoeda(segunda);
        document.getElementById('resultado-decimo').classList.remove('hidden');
    }

    if (tipo === 'rescisao') {
        const salario = parseFloat(document.getElementById('resc-salario').value);
        // Corrige fuso horario pegando a data como string e criando data local
        const inicioStr = document.getElementById('resc-inicio').value;
        const fimStr = document.getElementById('resc-fim').value;
        
        const inicio = new Date(inicioStr + 'T00:00:00');
        const fim = new Date(fimStr + 'T00:00:00');
        
        const motivo = document.getElementById('resc-motivo').value;
        const saldoFGTS = parseFloat(document.getElementById('resc-fgts').value) || 0;
        const feriasVencidas = document.getElementById('resc-ferias-vencidas').value === 'sim';

        // Lógica simplificada de meses trabalhados
        const mesesTrabalhadosAno = fim.getMonth() + 1;

        // Férias proporcionais (diferença de meses aproximada)
        let mesesProporcionais = (fim.getMonth() - inicio.getMonth()) + (12 * (fim.getFullYear() - inicio.getFullYear()));
        if (mesesProporcionais > 12) mesesProporcionais = mesesProporcionais % 12; 
        if (mesesProporcionais < 0) mesesProporcionais = 0;

        // Saldo Salário
        const diasTrabalhadosMes = fim.getDate();
        const saldoSalario = (salario / 30) * diasTrabalhadosMes;

        // 13º e Férias
        const decimoProp = (salario / 12) * mesesTrabalhadosAno;
        const feriasProp = (salario / 12) * mesesProporcionais;
        const tercoFerias = feriasProp / 3;

        let total = saldoSalario + decimoProp + feriasProp + tercoFerias;

        if (feriasVencidas) {
            total += salario + (salario/3);
        }

        let multaFGTS = 0;
        if (motivo === 'sem_justa_causa') {
            multaFGTS = saldoFGTS * 0.40;
            total += multaFGTS;
        }

        document.getElementById('res-resc-saldo').innerText = formatarMoeda(saldoSalario);
        document.getElementById('res-resc-13').innerText = formatarMoeda(decimoProp);
        document.getElementById('res-resc-ferias').innerText = formatarMoeda(feriasProp + tercoFerias);
        document.getElementById('res-resc-multa').innerText = formatarMoeda(multaFGTS);
        document.getElementById('res-total-rescisao').innerText = formatarMoeda(total);
        document.getElementById('resultado-rescisao').classList.remove('hidden');
    }
}

function formatarMoeda(val) {
    if(isNaN(val)) return "R$ 0,00";
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}