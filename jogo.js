// Versão 2.9 corrigida - Meteoros mais frequentes com o tempo, evitando glitch do canto direito + atualizaDino restaurado

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

// NOVA FUNÇÃO RESTAURADA
function atualizaDino(){
    if (teclasPressionadas['ArrowLeft']) dino.x -= 5;
    if (teclasPressionadas['ArrowRight']) dino.x += 5;
    dino.x = Math.max(0, Math.min(canvas.width - dino.largura, dino.x));
    dino.y += dino.gravidade;
    dino.gravidade += 0.5;
    if (dino.y >= canvas.height - 50) {
        dino.y = canvas.height - 50;
        dino.pulando = false;
    }
}

// (restante do código continua como na Versão 2.8 com os ajustes de frequência e origem dos meteoros)

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
