const fs = require('fs');

// Update index.html
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace('<title>Obra Social Cristo Rei - Corrente de Carinho 💖</title>', '<title>Obra Social Cristo Rei - Jogo do Orfanato 💖</title>');
html = html.replace('<p>Corrente de Carinho</p>', '<p>Jogo do Orfanato</p>');
fs.writeFileSync('index.html', html, 'utf-8');

// Update game.js
let js = fs.readFileSync('game.js', 'utf-8');
js = js.replace('Obra Social Cristo Rei - Corrente de Carinho Game Logic', 'Obra Social Cristo Rei - Jogo do Orfanato Game Logic');
js = js.replace('jogo "Corrente de Carinho"', 'Jogo do Orfanato');
fs.writeFileSync('game.js', js, 'utf-8');
