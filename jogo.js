// Versão 1.4 - Dino com movimento lateral e canvas expandido

const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

let dino = {
    x: 100,
    y: 400,
    largura: 40,
    altura: 40,
    pulando: false,
    gravidade: 0,
    velocidadeX: 0
};

let meteoros = [];
let velocidadeJogo = 2;
let frame = 0;
let score = 0;
let tempoProximoMeteoro = 0;
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
    // Movimento horizontal
    if (teclasPressionadas['ArrowLeft']) {
        dino.x -= 5;
    }
    if (teclasPressionadas['ArrowRight']) {
        dino.x += 5;
    }

    // Limites da tela
    dino.x = Math.max(0, Math.min(canvas.width - dino.largura, dino.x));

    // Gravidade e pulo
    dino.y += dino.gravidade;
    dino.gravidade += 0.5;

    if(dino.y >= canvas.height - 50){
        dino.y = canvas.height - 50;
        dino.pulando = false;
    }
}

function criaMeteoro(){
    const origemX = Math.floor(Math.random() * canvas.width);
    meteoros.push({
        x: origemX,
        y: -20,
        largura: 20,
        altura: 20,
        velocidadeX: -1.5 + Math.random() * 3,
        velocidadeY: velocidadeJogo + Math.random() * 2
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

    meteoros = meteoros.filter(m => m.y < canvas.height + 20);
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

    desenhaMeteoros();
    atualizaMeteoros();

    if(colisao()){
        alert(`Extinção! Pontuação: ${score}`);
        document.location.reload();
    } else {
        score++;
        frame++;

        if (frame % 400 === 0) {
            velocidadeJogo += 0.3;
        }

        requestAnimationFrame(loop);
    }
}

criaMeteoro();
loop();

