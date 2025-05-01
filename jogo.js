// Versão 1.1 - Obstáculos com espaçamento aleatório (corrigido) e aumento gradual da velocidade

const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

let dino = {
    x: 50,
    y: 100,
    largura: 40,
    altura: 40,
    pulando: false,
    gravidade: 0
};

let obstaculos = [];
let velocidadeJogo = 6;
let frame = 0;
let score = 0;
let tempoProximoObstaculo = 0;

document.addEventListener('keydown', function(event){
    if(event.code === 'Space' && !dino.pulando){
        dino.gravidade = -10;
        dino.pulando = true;
    }
});

function desenhaDino(){
    ctx.fillStyle = '#555';
    ctx.fillRect(dino.x, dino.y, dino.largura, dino.altura);
}

function atualizaDino(){
    dino.y += dino.gravidade;
    dino.gravidade += 0.5;

    if(dino.y >= 100){
        dino.y = 100;
        dino.pulando = false;
    }
}

function criaObstaculo(){
    obstaculos.push({
        x: canvas.width,
        y: 120,
        largura: 10,
        altura: 20
    });

    // Gera tempo aleatório para o próximo obstáculo com base na velocidade
    const minEspaco = Math.max(60, 120 - velocidadeJogo * 5); // distância mínima de segurança
    const maxEspaco = 200;
    tempoProximoObstaculo = frame + Math.floor(Math.random() * (maxEspaco - minEspaco) + minEspaco);
}

function desenhaObstaculos(){
    ctx.fillStyle = '#888';
    obstaculos.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
    });
}

function atualizaObstaculos(){
    obstaculos.forEach(obs => {
        obs.x -= velocidadeJogo;
    });
    obstaculos = obstaculos.filter(obs => obs.x + obs.largura > 0);
}

function colisao(){
    return obstaculos.some(obs => {
        return dino.x < obs.x + obs.largura &&
               dino.x + dino.largura > obs.x &&
               dino.y < obs.y + obs.altura &&
               dino.y + dino.altura > obs.y;
    });
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    desenhaDino();
    atualizaDino();

    if (frame === tempoProximoObstaculo) {
        criaObstaculo();
    }

    desenhaObstaculos();
    atualizaObstaculos();

    if(colisao()){
        alert(`Fim de jogo! Pontuação: ${score}`);
        document.location.reload();
    } else {
        score++;
        frame++;

        // Aumenta gradualmente a velocidade
        if (frame % 500 === 0) {
            velocidadeJogo += 0.5;
        }

        requestAnimationFrame(loop);
    }
}

criaObstaculo(); // Inicia com o primeiro obstáculo já agendado
loop();

