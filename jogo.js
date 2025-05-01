// Versão 1.6 - Meteoros sempre caem mais rápido que o deslocamento lateral

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
let decoracoes = [];
let velocidadeCenario = 2;
let frame = 0;
let score = 0;
let tempoProximoMeteoro = 0;
let tempoProximaDecoracao = 0;
let teclasPressionadas = {};

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

function desenhaDino(){
    ctx.fillStyle = '#555';
    ctx.fillRect(dino.x, dino.y, dino.largura, dino.altura);
}

function atualizaDino(){
    if (teclasPressionadas['ArrowLeft']) {
        dino.x -= 5;
    }
    if (teclasPressionadas['ArrowRight']) {
        dino.x += 5;
    }

    dino.x = Math.max(0, Math.min(canvas.width - dino.largura, dino.x));

    dino.y += dino.gravidade;
    dino.gravidade += 0.5;

    if(dino.y >= canvas.height - 50){
        dino.y = canvas.height - 50;
        dino.pulando = false;
    }
}

function criaMeteoro(){
    const origemX = Math.floor(Math.random() * canvas.width);
    const variacao = Math.random() * 1.5; // pequena aleatoriedade
    meteoros.push({
        x: origemX,
        y: -20,
        largura: 20,
        altura: 20,
        velocidadeX: -1.5 + Math.random() * 3 - velocidadeCenario,
        velocidadeY: velocidadeCenario * 1.2 + variacao // sempre maior que o scroll
    });

    const minEspaco = 40;
    const maxEspaco = 100;
    tempoProximoMeteoro = frame + Math.floor(Math.random() * (maxEspaco - minEspaco) + minEspaco);
}

function desenhaMeteoros(){
    ctx.fillStyle = '#a33';
    meteoros.forEach(m => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.largura / 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function atualizaMeteoros(){
    meteoros.forEach(m => {
        m.x += m.velocidadeX;
        m.y += m.velocidadeY;
    });

    meteoros = meteoros.filter(m => m.y < canvas.height + 20 && m.x + m.largura > 0);
}

function criaDecoracao(){
    const tipo = Math.random() < 0.5 ? 'grama' : 'pedra';
    decoracoes.push({
        x: canvas.width,
        y: canvas.height - 10,
        largura: 10,
        altura: 10,
        tipo: tipo
    });

    tempoProximaDecoracao = frame + Math.floor(Math.random() * 20 + 10);
}

function desenhaDecoracoes(){
    decoracoes.forEach(d => {
        ctx.fillStyle = d.tipo === 'grama' ? '#4caf50' : '#888';
        ctx.fillRect(d.x, d.y, d.largura, d.altura);
    });
}

function atualizaDecoracoes(){
    decoracoes.forEach(d => {
        d.x -= velocidadeCenario;
    });

    decoracoes = decoracoes.filter(d => d.x + d.largura > 0);
}

function colisao(){
    return meteoros.some(m => {
        return dino.x < m.x + m.largura &&
               dino.x + dino.largura > m.x &&
               dino.y < m.y + m.altura &&
               dino.y + dino.altura > m.y;
    });
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenhaDino();
    atualizaDino();

    if (frame === tempoProximoMeteoro) {
        criaMeteoro();
    }

    if (frame === tempoProximaDecoracao) {
        criaDecoracao();
    }

    desenhaMeteoros();
    atualizaMeteoros();

    desenhaDecoracoes();
    atualizaDecoracoes();

    if(colisao()){
        alert(`Extinção! Pontuação: ${score}`);
        document.location.reload();
    } else {
        score++;
        frame++;

        if (frame % 400 === 0) {
            velocidadeCenario += 0.3;
        }

        requestAnimationFrame(loop);
    }
}

criaMeteoro();
loop();
