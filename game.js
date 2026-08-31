/* ==========================================================================
   Asilo de Vitória - Corrente de Carinho Game Logic
   - Web Audio API Sound Engine
   - Mode 1: Chuva de Carinho (HTML5 Canvas Arcade)
   - Mode 2: Memórias de Afeto (3D Flip Memory Card Game)
   - Pix & Social Share Integration
   ========================================================================== */

(function () {
  'use strict';

  // Chave Pix Oficial do Asilo de Vitória
  const PIX_KEY = "27.126.790/0001-38"; // CNPJ oficial do Asilo de Vitória
  const DONATION_URL = "https://asilodevitoria.org.br/doacao/doe-um-pouquinho-transforme-o-ano-inteiro/";

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('asilo_sound_muted') === 'true';
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
      localStorage.setItem('asilo_sound_muted', this.muted);
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
    memoryGame: document.getElementById('memoryGameScreen')
  };

  const buttons = {
    startCatch: document.getElementById('startCatchMode'),
    startMemory: document.getElementById('startMemoryMode'),
    soundToggle: document.getElementById('soundToggle'),
    copyPixMenu: document.getElementById('copyPixMenuBtn'),
    copyPixModal: document.getElementById('copyPixModalBtn'),
    shareWhatsApp: document.getElementById('shareWhatsAppBtn'),
    backToMenu1: document.getElementById('backToMenuBtn1'),
    backToMenu2: document.getElementById('backToMenuBtn2'),
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
      `💖 Fiz ${score} pontos no jogo "Corrente de Carinho" apoiando o Asilo de Vitória (${mode})!\n\n` +
      `Doe um pouquinho e transforme o ano inteiro dos vovôs e vovás! Venha jogar e doar você também:\n` +
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

    let title = "Amigo dos Idosos";
    let badge = "🌟";
    if (score >= 300) {
      title = "Embaixador do Asilo de Vitória";
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
      impactTextEl.textContent = "No Asilo de Vitória, cuidamos diariamente de dezenas de idosos que dependem da nossa união para ter alimentação nutritiva, medicamentos, fisioterapia e carinho!";
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
          "A barra de felicidade acabou, mas a sua solidariedade pode reacender o sorriso dos idosos do Asilo de Vitória!"
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
        { img: 'images/foto1.png', emoji: '🤗', name: 'Abraço Afetivo' },
        { img: 'images/foto2.png', emoji: '😊', name: 'Sorriso Radiante' },
        { img: 'images/foto3.png', emoji: '🌸', name: 'Oficina de Flores' },
        { img: 'images/foto4.png', emoji: '📖', name: 'Atividades e Jogos' },
        { img: 'images/foto5.png', emoji: '💙', name: 'Vovôs do Asilo' },
        { img: 'images/foto6.png', emoji: '📝', name: 'Momentos Especiais' },
        { img: 'images/foto7.png', emoji: '🩺', name: 'Equipe de Cuidados' },
        { img: null, emoji: '💖', name: 'Asilo de Vitória' }
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
          frontContent = `
            <img src="${item.img}" alt="${item.name}" class="card-photo" />
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
            `Você completou o jogo em ${this.moves} jogadas e ${this.timerEl.textContent}! Cada par de memória reforça os momentos felizes proporcionados aos idosos no Asilo de Vitória.`
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

  // --- INICIALIZAÇÃO DOS INSTÂNCIAS ---
  const catchGame = new CatchGame();
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

  if (buttons.soundToggle) {
    buttons.soundToggle.addEventListener('click', () => sound.toggle());
  }

  if (buttons.copyPixMenu) {
    buttons.copyPixMenu.addEventListener('click', copyPixKey);
  }

  if (buttons.copyPixModal) {
    buttons.copyPixModal.addEventListener('click', copyPixKey);
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

})();
