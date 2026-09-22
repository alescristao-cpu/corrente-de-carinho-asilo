/* ==========================================================================
   Obra Social Cristo Rei - Jogo do Orfanato Game Logic
   - Web Audio API Sound Engine
   - Mode 1: Chuva de Carinho (HTML5 Canvas Arcade)
   - Mode 2: Memórias de Afeto (3D Flip Memory Card Game)
   - Pix & Social Share Integration
   ========================================================================== */

(function () {
  'use strict';

  // Chave Pix Oficial da Obra Social Cristo Rei
  const PIX_KEY = ""; // CNPJ oficial da Obra Social Cristo Rei
  const DONATION_URL = "https://obrasocialcristorei.org.br/doe/";

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('orfanato_sound_muted') === 'true';
      this.updateIcon();
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
    }

    toggle() {
      this.muted = !this.muted;
      localStorage.setItem('orfanato_sound_muted', this.muted);
      this.updateIcon();
      if (!this.muted) {
        this.playCollect();
      }
    }

    updateIcon() {
      const soundIcon = document.getElementById('soundIcon');
      if (soundIcon) {
        soundIcon.textContent = this.muted ? '🔇' : '🔊';
      }
    }

    playCollect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playCoin() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    }

    playHurt() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    }

    playCardFlip() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.05);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }

    playVictory() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.1;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    }
  }

  const sound = new SoundEngine();

  // --- ELEMENTOS DOM ---
  const screens = {
    menu: document.getElementById('menuScreen'),
    catchGame: document.getElementById('catchGameScreen'),
    memoryGame: document.getElementById('memoryGameScreen'),
    jumpGame: document.getElementById('jumpGameScreen'),
    balloonGame: document.getElementById('balloonGameScreen')
  };

  const buttons = {
    startCatch: document.getElementById('startCatchMode'),
    startMemory: document.getElementById('startMemoryMode'),
    startJump: document.getElementById('startJumpMode'),
    startBalloon: document.getElementById('startBalloonMode'),
    soundToggle: document.getElementById('soundToggle'),
    shareWhatsApp: document.getElementById('shareWhatsAppBtn'),
    backToMenu1: document.getElementById('backToMenuBtn1'),
    backToMenu2: document.getElementById('backToMenuBtn2'),
    backToMenu3: document.getElementById('backToMenuBtn3'),
    backToMenu4: document.getElementById('backToMenuBtn4'),
    restartMemory: document.getElementById('restartMemoryBtn'),
    pauseCatch: document.getElementById('pauseCatchBtn'),
    closeModal: document.getElementById('closeModalBtn')
  };

  const modal = document.getElementById('resultModal');
  const toast = document.getElementById('toastNotification');

  // --- FUNÇÕES UTILITÁRIAS ---
  function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
      if (key === screenName) {
        screens[key].classList.add('active');
      } else {
        screens[key].classList.remove('active');
      }
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function copyPixKey() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      showToast("CNPJ / Chave Pix copiada com sucesso: " + PIX_KEY);
    }).catch(() => {
      // Fallback manual
      const input = document.createElement('input');
      input.value = PIX_KEY;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast("Chave Pix copiada para a área de transferência!");
    });
  }

  function shareWhatsApp(score, mode) {
    const text = encodeURIComponent(
      `💖 Fiz ${score} pontos no Jogo do Orfanato apoiando a Obra Social Cristo Rei (${mode})!\n\n` +
      `Doe um pouquinho e transforme o ano inteiro dos crianças e adolescentes! Venha jogar e doar você também:\n` +
      DONATION_URL
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  function openResultModal(score, mode, extraMsg = '') {
    sound.playVictory();
    const finalScoreEl = document.getElementById('finalScore');
    const playerTitleEl = document.getElementById('playerTitle');
    const resultTitleEl = document.getElementById('resultTitle');
    const impactTextEl = document.getElementById('impactText');
    const badgeIconEl = document.getElementById('resultBadgeIcon');

    finalScoreEl.textContent = score;

    let title = "Amigo dos Crianças";
    let badge = "🌟";
    if (score >= 300) {
      title = "Embaixador da Obra Social Cristo Rei";
      badge = "🏆";
    } else if (score >= 150) {
      title = "Guardião do Carinho";
      badge = "💖";
    }

    playerTitleEl.textContent = title;
    badgeIconEl.textContent = badge;
    resultTitleEl.textContent = score > 0 ? "Parabéns, " + title + "!" : "Obrigado por Jogar!";

    if (extraMsg) {
      impactTextEl.textContent = extraMsg;
    } else {
      impactTextEl.textContent = "Na Obra Social Cristo Rei, cuidamos diariamente de dezenas de crianças que dependem da nossa união para ter alimentação nutritiva, medicamentos, fisioterapia e carinho!";
    }

    // Configurar evento do botão de compartilhamento com a pontuação atual
    if (buttons.shareWhatsApp) {
      buttons.shareWhatsApp.onclick = () => shareWhatsApp(score, mode);
    }

    modal.classList.add('active');
  }

  // --- MODO 1: CHUVA DE CARINHO (CANVAS GAME) ---
  class CatchGame {
    constructor() {
      this.canvas = document.getElementById('catchCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.scoreEl = document.getElementById('catchScore');
      this.levelEl = document.getElementById('catchLevel');
      this.happinessBar = document.getElementById('happinessBar');

      this.running = false;
      this.paused = false;
      this.score = 0;
      this.level = 1;
      this.happiness = 100; // 0 a 100%
      this.lastTime = 0;
      this.spawnTimer = 0;
      this.spawnInterval = 1000; // ms

      // Paddle / Basket
      this.basket = {
        x: 250,
        y: 630,
        width: 100,
        height: 40,
        speed: 8
      };

      // Control states
      this.keys = { left: false, right: false };
      this.touchX = null;

      // Game objects
      this.items = [];
      this.particles = [];
      this.floatingTexts = [];

      // Item definitions
      this.itemTypes = [
        { type: 'heart', emoji: '❤️', points: 10, happy: 6, speed: 3.5, prob: 0.35 },
        { type: 'meal', emoji: '🍲', points: 15, happy: 8, speed: 3.8, prob: 0.20 },
        { type: 'blanket', emoji: '🧣', points: 20, happy: 10, speed: 4.0, prob: 0.15 },
        { type: 'health', emoji: '🩺', points: 25, happy: 12, speed: 4.2, prob: 0.12 },
        { type: 'coin', emoji: '🪙', points: 50, happy: 15, speed: 4.8, prob: 0.08 },
        { type: 'cloud', emoji: '☁️', points: -15, happy: -18, speed: 4.5, prob: 0.10 }
      ];

      this.bindEvents();
    }

    bindEvents() {
      // Keyboard
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
      });

      window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
      });

      // Mouse/Touch controls on Canvas
      const handleMove = (clientX) => {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const canvasX = (clientX - rect.left) * scaleX;
        this.basket.x = Math.max(0, Math.min(this.canvas.width - this.basket.width, canvasX - this.basket.width / 2));
      };

      this.canvas.addEventListener('mousemove', (e) => {
        if (this.running && !this.paused) handleMove(e.clientX);
      });

      this.canvas.addEventListener('touchmove', (e) => {
        if (this.running && !this.paused && e.touches.length > 0) {
          e.preventDefault();
          handleMove(e.touches[0].clientX);
        }
      }, { passive: false });

      if (buttons.pauseCatch) {
        buttons.pauseCatch.addEventListener('click', () => this.togglePause());
      }
    }

    start() {
      this.score = 0;
      this.level = 1;
      this.happiness = 100;
      this.items = [];
      this.particles = [];
      this.floatingTexts = [];
      this.spawnInterval = 1000;
      this.running = true;
      this.paused = false;

      this.basket.x = (this.canvas.width - this.basket.width) / 2;
      this.updateHUD();

      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    togglePause() {
      if (!this.running) return;
      this.paused = !this.paused;
      buttons.pauseCatch.textContent = this.paused ? '▶️ Continuar' : '⏸️ Pausa';
      if (!this.paused) {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
      }
    }

    spawnItem() {
      const rand = Math.random();
      let cumulative = 0;
      let selectedType = this.itemTypes[0];

      for (let item of this.itemTypes) {
        cumulative += item.prob;
        if (rand <= cumulative) {
          selectedType = item;
          break;
        }
      }

      const itemX = Math.random() * (this.canvas.width - 40) + 20;
      this.items.push({
        x: itemX,
        y: -30,
        size: 32,
        speed: selectedType.speed + (this.level * 0.4),
        ...selectedType
      });
    }

    createParticles(x, y, color) {
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          radius: Math.random() * 4 + 2,
          color: color,
          alpha: 1,
          life: 0.04
        });
      }
    }

    addFloatingText(text, x, y, color) {
      this.floatingTexts.push({
        text: text,
        x: x,
        y: y,
        vy: -1.5,
        alpha: 1,
        color: color
      });
    }

    update(deltaTime) {
      // Keyboard basket movement
      if (this.keys.left) {
        this.basket.x = Math.max(0, this.basket.x - this.basket.speed);
      }
      if (this.keys.right) {
        this.basket.x = Math.min(this.canvas.width - this.basket.width, this.basket.x + this.basket.speed);
      }

      // Spawning
      this.spawnTimer += deltaTime;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnItem();
      }

      // Decay happiness slightly over time
      this.happiness = Math.max(0, this.happiness - 0.035);

      // Level progression
      const newLevel = Math.floor(this.score / 100) + 1;
      if (newLevel !== this.level) {
        this.level = newLevel;
        this.spawnInterval = Math.max(450, 1000 - (this.level * 80));
        sound.playVictory();
        this.addFloatingText(`NÍVEL ${this.level}!`, this.canvas.width / 2, 200, '#FFB800');
      }

      // Update Items
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        item.y += item.speed;

        // Check collision with basket
        if (
          item.y + item.size >= this.basket.y &&
          item.y <= this.basket.y + this.basket.height &&
          item.x + item.size >= this.basket.x &&
          item.x <= this.basket.x + this.basket.width
        ) {
          // Catch item!
          if (item.type === 'cloud') {
            sound.playHurt();
            this.happiness = Math.max(0, this.happiness + item.happy);
            this.createParticles(item.x, item.y, '#888888');
            this.addFloatingText('-15 Cloud!', item.x, item.y, '#D93B18');
          } else {
            if (item.type === 'coin') sound.playCoin();
            else sound.playCollect();

            this.score += item.points;
            this.happiness = Math.min(100, this.happiness + item.happy);
            this.createParticles(item.x, item.y, item.type === 'coin' ? '#FFB800' : '#C20C2D');
            this.addFloatingText(`+${item.points}`, item.x, item.y, '#28A745');
          }

          this.items.splice(i, 1);
          this.updateHUD();
          continue;
        }

        // Missed item (passed bottom)
        if (item.y > this.canvas.height) {
          if (item.type !== 'cloud') {
            this.happiness = Math.max(0, this.happiness - 3); // Penalty for missing love items
            this.updateHUD();
          }
          this.items.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.life;
        if (p.alpha <= 0) this.particles.splice(i, 1);
      }

      // Update Floating Texts
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
      }

      // Check Game Over
      if (this.happiness <= 0) {
        this.running = false;
        openResultModal(
          this.score,
          "Chuva de Carinho",
          "A barra de felicidade acabou, mas a sua solidariedade pode reacender o sorriso dos crianças da Obra Social Cristo Rei!"
        );
      }
    }

    draw() {
      // Clear Canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw Basket
      const b = this.basket;
      this.ctx.save();
      
      // Shadow
      this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      this.ctx.beginPath();
      this.ctx.ellipse(b.x + b.width / 2, b.y + b.height + 2, b.width / 2, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Cesta/Mãos de Carinho
      this.ctx.fillStyle = '#C20C2D';
      this.ctx.beginPath();
      this.ctx.roundRect(b.x, b.y, b.width, b.height, 12);
      this.ctx.fill();

      // Detalhe da cesta
      this.ctx.fillStyle = '#FFB800';
      this.ctx.font = '22px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🧺 💖', b.x + b.width / 2, b.y + 28);
      this.ctx.restore();

      // Draw Items
      this.items.forEach(item => {
        this.ctx.font = '32px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.emoji, item.x, item.y);
      });

      // Draw Particles
      this.particles.forEach(p => {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });

      // Draw Floating Texts
      this.floatingTexts.forEach(ft => {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, ft.alpha);
        this.ctx.font = 'bold 20px Fredoka, sans-serif';
        this.ctx.fillStyle = ft.color;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(ft.text, ft.x, ft.y);
        this.ctx.restore();
      });

      // Draw Pause overlay if paused
      if (this.paused) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 36px Fredoka, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('JOGO PAUSADO', this.canvas.width / 2, this.canvas.height / 2);
      }
    }

    updateHUD() {
      this.scoreEl.textContent = this.score;
      this.levelEl.textContent = this.level;
      this.happinessBar.style.width = `${Math.max(0, Math.min(100, this.happiness))}%`;

      if (this.happiness < 30) {
        this.happinessBar.style.background = '#D93B18';
      } else {
        this.happinessBar.style.background = 'linear-gradient(90deg, #FF6B4A, #C20C2D)';
      }
    }

    loop(timestamp) {
      if (!this.running) return;

      if (!this.paused) {
        const deltaTime = timestamp - this.lastTime;
        this.update(deltaTime);
        this.draw();
      }

      this.lastTime = timestamp;
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  // --- MODO 2: MEMÓRIAS DE AFETO (JOGO DA MEMÓRIA) ---
  class MemoryGame {
    constructor() {
      this.gridEl = document.getElementById('memoryGrid');
      this.pairsEl = document.getElementById('memoryPairs');
      this.movesEl = document.getElementById('memoryMoves');
      this.timerEl = document.getElementById('memoryTimer');

      this.cards = [];
      this.hasFlippedCard = false;
      this.lockBoard = false;
      this.firstCard = null;
      this.secondCard = null;
      this.matchedPairs = 0;
      this.moves = 0;
      this.timer = 0;
      this.timerInterval = null;

      this.cardData = [
        { img: 'images/img1.jpg', emoji: '🎁', name: 'Alegria e Presentes' },
        { img: 'images/img2.jpg', emoji: '🍲', name: 'Refeição com Amor' },
        { img: 'images/img3.jpg', emoji: '🧩', name: 'Jogos e Aprendizado' },
        { img: 'images/img4.jpg', emoji: '📚', name: 'Cantinho da Leitura' },
        { img: 'images/img5.jpg', emoji: '🥰', name: 'Sorrisos e Carinho' },
        { img: 'images/logo.png', emoji: '💙', name: 'Cristo Rei' },
        { img: 'images/img6.jpg', emoji: '📸', name: 'História e Memória' },
        { img: 'images/img7.jpg', emoji: '🏗️', name: 'Oficina Criativa' }
      ];
    }

    start() {
      this.reset();
      this.createBoard();
      this.startTimer();
    }

    reset() {
      clearInterval(this.timerInterval);
      this.hasFlippedCard = false;
      this.lockBoard = false;
      this.firstCard = null;
      this.secondCard = null;
      this.matchedPairs = 0;
      this.moves = 0;
      this.timer = 0;

      this.pairsEl.textContent = `0 / ${this.cardData.length}`;
      this.movesEl.textContent = '0';
      this.timerEl.textContent = '00:00';
    }

    startTimer() {
      this.timerInterval = setInterval(() => {
        this.timer++;
        const mins = String(Math.floor(this.timer / 60)).padStart(2, '0');
        const secs = String(this.timer % 60).padStart(2, '0');
        this.timerEl.textContent = `${mins}:${secs}`;
      }, 1000);
    }

    createBoard() {
      this.gridEl.innerHTML = '';
      const deck = [...this.cardData, ...this.cardData];
      deck.sort(() => Math.random() - 0.5);

      deck.forEach(item => {
        const cardNode = document.createElement('div');
        cardNode.classList.add('memory-card');
        cardNode.dataset.name = item.name;

        let frontContent = '';
        if (item.img) {
          const fileName = item.img.split('/').pop();
          frontContent = `
            <img src="${item.img}" alt="${item.name}" class="card-photo" onerror="
              if(!this.dataset.tried){
                this.dataset.tried='1';
                this.src='${fileName}';
              } else if(this.dataset.tried==='1'){
                this.dataset.tried='2';
                this.src='./images/${fileName}';
              }
            " />
            <div class="card-label-overlay">${item.emoji} ${item.name}</div>
          `;
        } else {
          frontContent = `
            <div class="special-logo-card">
              <div class="card-emoji" style="font-size:38px; margin-bottom:4px;">${item.emoji}</div>
              <div class="card-text" style="font-size:12px; font-weight:800; color:var(--primary-dark);">${item.name}</div>
            </div>
          `;
        }

        cardNode.innerHTML = `
          <div class="card-face card-back">
            <div class="card-back-icon">💖</div>
          </div>
          <div class="card-face card-front">
            ${frontContent}
          </div>
        `;

        cardNode.addEventListener('click', () => this.flipCard(cardNode));
        this.gridEl.appendChild(cardNode);
      });
    }

    flipCard(card) {
      if (this.lockBoard) return;
      if (card === this.firstCard) return;
      if (card.classList.contains('matched')) return;

      sound.playCardFlip();
      card.classList.add('flipped');

      if (!this.hasFlippedCard) {
        this.hasFlippedCard = true;
        this.firstCard = card;
        return;
      }

      this.secondCard = card;
      this.moves++;
      this.movesEl.textContent = this.moves;

      this.checkForMatch();
    }

    checkForMatch() {
      const isMatch = this.firstCard.dataset.name === this.secondCard.dataset.name;
      if (isMatch) {
        this.disableCards();
      } else {
        this.unflipCards();
      }
    }

    disableCards() {
      sound.playCollect();
      this.firstCard.classList.add('matched');
      this.secondCard.classList.add('matched');

      this.matchedPairs++;
      this.pairsEl.textContent = `${this.matchedPairs} / ${this.cardData.length}`;

      this.resetBoardState();

      if (this.matchedPairs === this.cardData.length) {
        clearInterval(this.timerInterval);
        const finalScore = Math.max(50, 400 - (this.moves * 10) - (this.timer * 2));
        setTimeout(() => {
          openResultModal(
            finalScore,
            "Memórias de Afeto",
            `Você completou o jogo em ${this.moves} jogadas e ${this.timerEl.textContent}! Cada par de memória reforça os momentos felizes proporcionados aos crianças na Obra Social Cristo Rei.`
          );
        }, 500);
      }
    }

    unflipCards() {
      this.lockBoard = true;
      setTimeout(() => {
        if (this.firstCard) this.firstCard.classList.remove('flipped');
        if (this.secondCard) this.secondCard.classList.remove('flipped');
        this.resetBoardState();
      }, 1000);
    }

    resetBoardState() {
      [this.hasFlippedCard, this.lockBoard] = [false, false];
      [this.firstCard, this.secondCard] = [null, null];
    }
  }

  
  class JumpGame {
    constructor() {
      this.canvas = document.getElementById('jumpCanvas');
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.scoreEl = document.getElementById('jumpScore');
      this.phaseEl = document.getElementById('jumpPhase');
      
      this.running = false;
      this.score = 0;
      this.speed = 5;
      
      this.player = {
        x: 50,
        y: 200,
        width: 40,
        height: 40,
        vy: 0,
        gravity: 0.8,
        jumpStrength: -14,
        isGrounded: false,
        emoji: '👶'
      };
      
      this.obstacles = [];
      this.spawnTimer = 0;
      this.nextSpawn = 100;
      
      this.bindEvents();
    }
    
    bindEvents() {
      const jump = (e) => {
        if(e) e.preventDefault();
        if(!this.running) return;
        if(this.player.isGrounded) {
          this.player.vy = this.player.jumpStrength;
          this.player.isGrounded = false;
          sound.playCardFlip();
        }
      };
      
      window.addEventListener('keydown', (e) => {
        if(e.code === 'Space' || e.code === 'ArrowUp') jump(e);
      });
      
      if(this.canvas) {
        this.canvas.addEventListener('touchstart', jump, {passive: false});
        this.canvas.addEventListener('mousedown', jump);
      }
    }
    
    start() {
      this.running = true;
      this.score = 0;
      this.speed = 5;
      this.obstacles = [];
      this.spawnTimer = 0;
      this.nextSpawn = 100;
      this.player.y = this.canvas.height - 50 - this.player.height;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.emoji = '👶';
      this.updateHUD();
      
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
    
    spawnObstacle() {
      const types = ['🚧', '🪨', '🛑'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.obstacles.push({
        x: this.canvas.width,
        y: this.canvas.height - 50 - 30, // 50 ground height, 30 obs height
        width: 30,
        height: 30,
        emoji: type
      });
    }
    
    update() {
      this.player.vy += this.player.gravity;
      this.player.y += this.player.vy;
      
      const groundY = this.canvas.height - 50;
      if (this.player.y + this.player.height >= groundY) {
        this.player.y = groundY - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
      
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        let obs = this.obstacles[i];
        obs.x -= this.speed;
        
        if (
          this.player.x < obs.x + obs.width - 5 &&
          this.player.x + this.player.width - 5 > obs.x &&
          this.player.y < obs.y + obs.height - 5 &&
          this.player.y + this.player.height - 5 > obs.y
        ) {
          this.running = false;
          sound.playHurt();
          setTimeout(() => {
             openResultModal(Math.floor(this.score), "Jornada da Vida", "Cada obstáculo superado representa um passo na jornada de nossas crianças. Sua doação ajuda a pavimentar esse caminho!");
          }, 300);
          return;
        }
        
        if (obs.x + obs.width < 0) {
          this.obstacles.splice(i, 1);
        }
      }
      
      this.spawnTimer++;
      if (this.spawnTimer >= this.nextSpawn) {
        this.spawnObstacle();
        this.spawnTimer = 0;
        this.nextSpawn = Math.max(50, 100 - this.speed * 2) + Math.random() * 50;
      }
      
      this.score += 0.1;
      this.speed = 5 + (this.score / 200);
      
      let newEmoji = '👶';
      if (this.score > 1000) newEmoji = '👨‍🎓';
      else if (this.score > 600) newEmoji = '🧑';
      else if (this.score > 300) newEmoji = '👦';
      
      if(newEmoji !== this.player.emoji) {
         this.player.emoji = newEmoji;
         sound.playVictory();
         this.player.width = 40 + (this.score > 300 ? 5 : 0) + (this.score > 600 ? 5 : 0);
         this.player.height = this.player.width;
      }
      
      this.updateHUD();
    }
    
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#A3E4D7';
      this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
      
      this.ctx.font = `${this.player.height}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText(this.player.emoji, this.player.x + this.player.width/2, this.player.y + this.player.height);
      
      this.ctx.font = '30px Arial';
      this.obstacles.forEach(obs => {
        this.ctx.fillText(obs.emoji, obs.x + obs.width/2, obs.y + obs.height);
      });
    }
    
    updateHUD() {
      this.scoreEl.textContent = Math.floor(this.score);
      this.phaseEl.textContent = this.player.emoji;
    }
    
    loop(timestamp) {
      if (!this.running) return;
      this.update();
      this.draw();
      requestAnimationFrame((t) => this.loop(t));
    }
  }


  class BalloonGame {
    constructor() {
      this.canvas = document.getElementById('balloonCanvas');
      if(!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.scoreEl = document.getElementById('balloonScore');
      this.timeEl = document.getElementById('balloonTime');
      
      this.running = false;
      this.score = 0;
      this.timeLeft = 30;
      
      this.balloons = [];
      this.particles = [];
      this.spawnTimer = 0;
      this.nextSpawn = 60;
      
      this.emojis = ['🎈', '🌟', '🧸', '🎨', '⚽'];
      
      this.bindEvents();
    }
    
    bindEvents() {
      const handleTap = (e) => {
        if(!this.running) return;
        e.preventDefault();
        
        let clientX, clientY;
        if(e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        
        for(let i = this.balloons.length - 1; i >= 0; i--) {
          const b = this.balloons[i];
          const dist = Math.hypot(b.x - x, b.y - y);
          if(dist <= b.radius * 1.5) {
             this.score += 10;
             sound.playCoin();
             this.createParticles(b.x, b.y);
             this.balloons.splice(i, 1);
             this.updateHUD();
             break;
          }
        }
      };
      
      if(this.canvas) {
        this.canvas.addEventListener('touchstart', handleTap, {passive: false});
        this.canvas.addEventListener('mousedown', handleTap);
      }
    }
    
    start() {
      this.running = true;
      this.score = 0;
      this.timeLeft = 30;
      this.balloons = [];
      this.particles = [];
      this.updateHUD();
      
      this.lastTime = performance.now();
      
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateHUD();
        if(this.timeLeft <= 0) {
           this.endGame();
        }
      }, 1000);
      
      requestAnimationFrame((t) => this.loop(t));
    }
    
    endGame() {
       this.running = false;
       clearInterval(this.timerInterval);
       setTimeout(() => {
          openResultModal(this.score, "Balões dos Sonhos", "Você realizou " + (this.score/10) + " sonhos! A Obra Social Cristo Rei trabalha para que os sonhos decolem.");
       }, 500);
    }
    
    spawnBalloon() {
      const type = this.emojis[Math.floor(Math.random() * this.emojis.length)];
      const radius = 30 + Math.random() * 15;
      const x = radius + Math.random() * (this.canvas.width - radius * 2);
      this.balloons.push({
        x: x,
        y: this.canvas.height + radius,
        radius: radius,
        speed: 2 + Math.random() * 3,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.05,
        emoji: type
      });
    }
    
    createParticles(x, y) {
      for(let i=0; i<6; i++) {
         this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0
         });
      }
    }
    
    update() {
      this.spawnTimer++;
      if(this.spawnTimer >= this.nextSpawn) {
        this.spawnBalloon();
        this.spawnTimer = 0;
        this.nextSpawn = Math.max(15, 40 - (30 - this.timeLeft));
      }
      
      for(let i = this.balloons.length - 1; i >= 0; i--) {
         let b = this.balloons[i];
         b.y -= b.speed;
         b.wobble += b.wobbleSpeed;
         b.x += Math.sin(b.wobble) * 1.5;
         
         if(b.y < -b.radius) {
            this.balloons.splice(i, 1);
         }
      }
      
      for(let i = this.particles.length - 1; i >= 0; i--) {
         let p = this.particles[i];
         p.x += p.vx;
         p.y += p.vy;
         p.life -= 0.05;
         if(p.life <= 0) this.particles.splice(i, 1);
      }
    }
    
    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.balloons.forEach(b => {
         this.ctx.beginPath();
         this.ctx.moveTo(b.x, b.y + b.radius * 0.8);
         this.ctx.lineTo(b.x + Math.sin(b.wobble)*5, b.y + b.radius * 2.5);
         this.ctx.strokeStyle = 'rgba(255,255,255,0.7)';
         this.ctx.lineWidth = 2;
         this.ctx.stroke();
         
         this.ctx.font = Math.floor(b.radius * 1.8) + 'px Arial';
         this.ctx.fillText(b.emoji, b.x, b.y);
      });
      
      this.ctx.fillStyle = '#FFC107';
      this.particles.forEach(p => {
         this.ctx.globalAlpha = Math.max(0, p.life);
         this.ctx.beginPath();
         this.ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
         this.ctx.fill();
      });
      this.ctx.globalAlpha = 1.0;
    }
    
    updateHUD() {
      this.scoreEl.textContent = this.score;
      this.timeEl.textContent = this.timeLeft + 's';
    }
    
    loop(timestamp) {
      if (!this.running) return;
      this.update();
      this.draw();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  // --- INICIALIZAÇÃO DOS INSTÂNCIAS ---
  const catchGame = new CatchGame();
  const jumpGame = new JumpGame();
  const balloonGame = new BalloonGame();
  const memoryGame = new MemoryGame();

  // --- EVENT LISTENERS GERAIS ---
  if (buttons.startCatch) {
    buttons.startCatch.addEventListener('click', () => {
      showScreen('catchGame');
      catchGame.start();
    });
  }

  if (buttons.startMemory) {
    buttons.startMemory.addEventListener('click', () => {
      showScreen('memoryGame');
      memoryGame.start();
    });
  }

  if (buttons.startJump) {
    buttons.startJump.addEventListener('click', () => {
      showScreen('jumpGame');
      jumpGame.start();
    });
  }

  if (buttons.startBalloon) {
    buttons.startBalloon.addEventListener('click', () => {
      showScreen('balloonGame');
      balloonGame.start();
    });
  }

  if (buttons.backToMenu3) {
    buttons.backToMenu3.addEventListener('click', () => {
      jumpGame.running = false;
      showScreen('menu');
    });
  }

  if (buttons.backToMenu4) {
    buttons.backToMenu4.addEventListener('click', () => {
      balloonGame.running = false;
      clearInterval(balloonGame.timerInterval);
      showScreen('menu');
    });
  }

  if (buttons.soundToggle) {
    buttons.soundToggle.addEventListener('click', () => sound.toggle());
  }

  if (buttons.backToMenu1) {
    buttons.backToMenu1.addEventListener('click', () => {
      catchGame.running = false;
      showScreen('menu');
    });
  }

  if (buttons.backToMenu2) {
    buttons.backToMenu2.addEventListener('click', () => {
      clearInterval(memoryGame.timerInterval);
      showScreen('menu');
    });
  }

  if (buttons.restartMemory) {
    buttons.restartMemory.addEventListener('click', () => {
      memoryGame.start();
    });
  }

  if (buttons.closeModal) {
    buttons.closeModal.addEventListener('click', () => {
      modal.classList.remove('active');
      showScreen('menu');
    });
  }

  const aboutModal = document.getElementById('aboutOrfanatoModal');
  const aboutBtn = document.getElementById('aboutOrfanatoBtn');
  const closeAboutBtn = document.getElementById('closeAboutModalBtn');

  if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', () => {
      aboutModal.classList.add('active');
    });
  }

  if (closeAboutBtn && aboutModal) {
    closeAboutBtn.addEventListener('click', () => {
      aboutModal.classList.remove('active');
    });
  }

})();
