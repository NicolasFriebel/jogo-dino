// Versão 1.3 - Obstáculos agora são meteoros caindo em diagonal em direção ao dinossauro

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

let meteoros = [];
let velocidadeJogo = 2; // usado na queda dos meteoros
let frame = 0;
let score = 0;
let tempoProximoMeteoro = 0;

document.addEventListener('keydown', function(event){
    if((event.code === 'Space' || event.code === 'ArrowUp') && !dino.pulando){
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

function criaMeteoro(){
    const origemX = Math.floor(Math.random() * canvas.width);
    meteoros.push({
        x: origemX,
        y: -20,
        largura: 20,
        altura: 20,
        velocidadeX: -1.5 + Math.random() * 3, // entre -1.5 e +1.5
        velocidadeY: velocidadeJogo + Math.random() * 2 // variação na queda
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

    meteoros = meteoros.filter(m => m.y < canvas.height + 20); // remove meteoros fora da tela
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
            velocidadeJogo += 0.2;
        }

        requestAnimationFrame(loop);
    }
}

criaMeteoro();
loop();

