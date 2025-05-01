// Versão 2.0 - Meteoros podem cair além da borda e tamanhos com probabilidade realista

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
    // spawn pode ir até 130% da largura da tela
    const origemX = Math.floor(canvas.width * 0.5 + Math.random() * canvas.width * 0.8);

    // tamanhos com probabilidade (4x P, 2x M, 1x G)
    const pesos = [20, 20, 20, 20, 40, 40, 60];
    const tamanho = pesos[Math.floor(Math.random() * pesos.length)];
    const variacao = Math.random() * 1.5;

    meteoros.push({
        x: origemX,
        y: -tamanho,
        largura: tamanho,
        altura: tamanho,
        velocidadeX: -1.5 + Math.random() * 3 - velocidadeCenario,
        velocidadeY: velocidadeCenario * 1.2 + variacao,
        raioCratera: tamanho * 1.5
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
    for (let i = meteoros.length - 1; i >= 0; i--) {
        const m = meteoros[i];
        m.x += m.velocidadeX;
        m.y += m.velocidadeY;

        if (m.y >= canvas.height - 50) {
            crateras.push({
                x: m.x,
                y: canvas.height - 50 + m.altura / 2,
                raio: m.raioCratera
            });
            meteoros.splice(i, 1);
        }
    }
}

function desenhaCrateras(){
    crateras.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.raio, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 80, 80, 0.4)';
        ctx.fill();
    });
}

function atualizaCrateras(){
    crateras.forEach(c => {
        c.x -= velocidadeCenario;
    });
    crateras = crateras.filter(c => c.x + c.raio > 0);
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
    const colideComMeteoro = meteoros.some(m => {
        return dino.x < m.x + m.largura &&
               dino.x + dino.largura > m.x &&
               dino.y < m.y + m.altura &&
               dino.y + dino.altura > m.y;
    });

    const colideComCratera = crateras.some(c => {
        const distX = dino.x + dino.largura / 2 - c.x;
        const distY = dino.y + dino.altura / 2 - c.y;
        const distancia = Math.sqrt(distX * distX + distY * distY);
        return distancia < c.raio;
    });

    return colideComMeteoro || colideComCratera;
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

    desenhaCrateras();
    atualizaCrateras();

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
