// Versão 2.9 - Meteoros mais frequentes com o tempo, evitando glitch do canto direito

const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

let dino = {
    x: 100,
    y: 400,
    largura: 40,
    altura: 40,
    pulando: false,
    gravidade: 0
};

let meteoros = [];
let crateras = [];
let decoracoes = [];
let pontosVisuais = [];

let velocidadeCenario = 4;
let velocidadeMeteoro = 3;
let frame = 0;
let score = 0;
let tempoProximoMeteoro = 60;
let tempoProximaDecoracao = 0;
let teclasPressionadas = {};
let intervaloBaseMeteoro = 140;
let variacaoMeteoro = 30;
const intervaloMinimoMeteoro = 70;

ctx.font = '18px Arial';
ctx.fillStyle = '#333';

// EVENT LISTENERS

document.addEventListener('keydown', (e) => {
    teclasPressionadas[e.code] = true;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !dino.pulando) {
        dino.gravidade = -12;
        dino.pulando = true;
    }
});

document.addEventListener('keyup', (e) => {
    teclasPressionadas[e.code] = false;
});

// DESENHO

function desenhaDino(){
    ctx.fillStyle = '#555';
    ctx.fillRect(dino.x, dino.y, dino.largura, dino.altura);
}

function desenhaPontos(){
    ctx.fillStyle = '#000';
    ctx.fillText(`Score: ${score}`, 10, 20);
    pontosVisuais.forEach(p => {
        ctx.fillStyle = '#2e7d32';
        ctx.fillText(p.texto, p.x, p.y);
    });
}

// DECORACAO

function criaDecoracao(){
    if (frame % 4 !== 0) return;
    const tipo = Math.random() < 0.5 ? 'grama' : 'pedra';
    const profundidade = Math.random() < 0.5 ? 'tras' : 'frente';
    decoracoes.push({
        x: canvas.width,
        y: canvas.height - 50 + 30,
        largura: 10,
        altura: 10,
        tipo,
        profundidade
    });
    tempoProximaDecoracao = frame + Math.floor(Math.random() * 20 + 10);
}

function desenhaDecoracoes(profundidade){
    decoracoes.forEach(d => {
        if (d.profundidade === profundidade) {
            ctx.fillStyle = d.tipo === 'grama' ? '#4caf50' : '#888';
            ctx.fillRect(d.x, d.y, d.largura, d.altura);
        }
    });
}

function atualizaDecoracoes(){
    decoracoes.forEach(d => d.x -= velocidadeCenario);
    decoracoes = decoracoes.filter(d => d.x + d.largura > 0);
}

// METEOROS E CRATERAS

function existeCrateraProxima(x, raio) {
    return crateras.some(c => Math.abs(c.x - x) < c.largura / 2 + raio + 20);
}

function criaMeteoro() {
    let origemX;
    if (Math.random() < 0.7) {
        origemX = dino.x + Math.random() * (canvas.width - dino.x);
    } else {
        origemX = Math.floor(canvas.width * 0.5 + Math.random() * canvas.width * 0.8);
    }
    const pesos = [20, 20, 20, 20, 40, 40, 60];
    const tamanho = pesos[Math.floor(Math.random() * pesos.length)];
    const raioCratera = tamanho * 1.5;
    if (existeCrateraProxima(origemX, raioCratera)) {
        tempoProximoMeteoro += 10;
        return;
    }
    meteoros.push({
        x: origemX,
        y: -tamanho,
        largura: tamanho,
        altura: tamanho,
        velocidadeX: -1.5 + Math.random() * 3 - velocidadeCenario,
        velocidadeY: velocidadeMeteoro + Math.random() * 1.5,
        pontuado: false
    });
    tempoProximoMeteoro = frame + intervaloBaseMeteoro + Math.floor(Math.random() * variacaoMeteoro);
}

// (restante do código permanece igual)

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenhaDecoracoes('tras');
    desenhaDino();
    desenhaDecoracoes('frente');
    desenhaPontos();

    atualizaDino();
    verificaPontuacoes();

    if (frame >= tempoProximoMeteoro) criaMeteoro();
    if (frame >= tempoProximaDecoracao) criaDecoracao();

    desenhaMeteoros();
    atualizaMeteoros();

    desenhaCrateras();
    atualizaCrateras();

    atualizaDecoracoes();

    if (colisao()) {
        alert(`Extinção! Pontuação: ${score}`);
        document.location.reload();
    } else {
        frame++;
        if (frame % 400 === 0) {
            velocidadeCenario += 0.2;
            velocidadeMeteoro += 0.3;
            if (intervaloBaseMeteoro > intervaloMinimoMeteoro) intervaloBaseMeteoro -= 5;
        }
        requestAnimationFrame(loop);
    }
}

tempoProximoMeteoro = 60;
loop();
