let currentSport = 'soccer'; 

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
  document.getElementById(`tab-${viewName}`).classList.add('active');
  renderAllViews();
}

function switchSport(sport) {
  currentSport = sport;
  document.querySelectorAll('.sports-selector button').forEach(el => el.classList.remove('active'));
  document.getElementById(`btn-sport-${sport}`).classList.add('active');

  const soccerPitchDash = document.getElementById('dash-soccer-pitch');
  const bbPitchDash = document.getElementById('dash-basketball-pitch');
  const soccerPitchMgr = document.getElementById('manager-soccer-pitch');
  const bbPitchMgr = document.getElementById('manager-basketball-pitch');
  const btnAddPlayer = document.getElementById('btn-add-player');

  if (sport === 'soccer') {
    soccerPitchDash.style.display = 'block'; bbPitchDash.style.display = 'none';
    soccerPitchMgr.style.display = 'block'; bbPitchMgr.style.display = 'none';
    document.getElementById('dash-pitch-title').innerText = "실시간 라인업 전술판 (축구)";
    document.getElementById('manager-pitch-title').innerText = "라인업 전술 배치 (축구)";
    btnAddPlayer.style.backgroundColor = '#2e7d32';
  } else {
    soccerPitchDash.style.display = 'none'; bbPitchDash.style.display = 'block';
    soccerPitchMgr.style.display = 'none'; bbPitchMgr.style.display = 'block';
    document.getElementById('dash-pitch-title').innerText = "실시간 라인업 전술판 (농구)";
    document.getElementById('manager-pitch-title').innerText = "라인업 전술 배치 (농구)";
    btnAddPlayer.style.backgroundColor = '#e65100'; 
  }

  matchData.players.forEach(p => {
    p.state = 'bench'; p.x = null; p.y = null;
  });
  const bench = document.getElementById('player-bench');
  document.querySelectorAll('.pitch-soccer .player, .pitch-basketball .player').forEach(pEl => {
    bench.appendChild(pEl);
    pEl.style.left = 'auto'; pEl.style.top = 'auto';
  });

  renderAllViews();
}

const DEFAULT_TIME = 15 * 60;

let matchData = {
  teamNames: { home: "HOME", away: "AWAY" },
  scores: { home: 0, away: 0 },
  timeLeft: DEFAULT_TIME,
  isPlaying: false,
  players: []
};

let timerInterval = null;
let isDragging = false;
  let dragTarget = null;

function changeTeamNames() {
  const newHome = prompt("홈(HOME) 팀 이름을 입력해주세요:", matchData.teamNames.home);
  if (newHome === null) return;
  const newAway = prompt("어웨이(AWAY) 팀 이름을 입력해주세요:", matchData.teamNames.away);
  if (newAway === null) return;

  matchData.teamNames.home = newHome.trim() || "HOME";
  matchData.teamNames.away = newAway.trim() || "AWAY";
  renderAllViews();
}

function renderAllViews() {
  let min = Math.floor(matchData.timeLeft / 60).toString().padStart(2, '0');
  let sec = (matchData.timeLeft % 60).toString().padStart(2, '0');
  const timeStr = `${min}:${sec}`;

  if(document.getElementById('dash-home-name')) {
    document.getElementById('dash-home-name').innerText = matchData.teamNames.home;
    document.getElementById('dash-away-name').innerText = matchData.teamNames.away;
    document.getElementById('ref-home-name').innerText = matchData.teamNames.home;
    document.getElementById('ref-away-name').innerText = matchData.teamNames.away;
  }

  if(document.getElementById('dash-home-score')) {
    document.getElementById('dash-home-score').innerText = matchData.scores.home;
    document.getElementById('dash-away-score').innerText = matchData.scores.away;
    document.getElementById('dash-timer').innerText = timeStr;
    document.getElementById('dash-status').innerText = matchData.isPlaying ? "🔥 경기 진행 중" : "⏸️ 일시 정정됨";
  }

  const activeDashPitch = currentSport === 'soccer' 
    ? document.getElementById('dash-soccer-pitch') 
    : document.getElementById('dash-basketball-pitch');

  if(activeDashPitch) {
    const existingPlayers = activeDashPitch.querySelectorAll('.player');
    existingPlayers.forEach(p => p.remove());

    matchData.players.forEach(p => {
      if (p.state === 'pitch') {
        const pDiv = document.createElement('div');
        pDiv.className = 'player';
        pDiv.innerText = p.no;
        pDiv.setAttribute('data-name', p.name);
        pDiv.style.left = `${p.x}%`;
        pDiv.style.top = `${p.y}%`;
        activeDashPitch.appendChild(pDiv);
      }
    });
  }

  if(document.getElementById('ref-home-score')) {
    document.getElementById('ref-home-score').innerText = matchData.scores.home;
    document.getElementById('ref-away-score').innerText = matchData.scores.away;
    document.getElementById('ref-timer').innerText = timeStr;
  }
}

function handleNewPlayer() {
  const numInput = document.getElementById('p-number');
  const nameInput = document.getElementById('p-name');
  if (!numInput.value || !nameInput.value.trim()) return;

  const newId = Date.now();
  const newPlayer = { id: newId, no: numInput.value, name: nameInput.value.trim(), state: 'bench', x: null, y: null };
  matchData.players.push(newPlayer);
  
  const pDiv = document.createElement('div');
  pDiv.className = 'player'; pDiv.id = `player-${newId}`;
  pDiv.innerText = newPlayer.no; pDiv.setAttribute('data-name', newPlayer.name);
  
  pDiv.addEventListener('touchstart', startDrag, { passive: false });
  pDiv.addEventListener('touchmove', moveDrag, { passive: false });
  pDiv.addEventListener('touchend', endDrag);
  pDiv.addEventListener('mousedown', startDrag);
  
  document.getElementById('player-bench').appendChild(pDiv);
  numInput.value = ''; nameInput.value = '';
  renderAllViews();
}

function startDrag(e) {
  isDragging = true;
  dragTarget = e.target;
  dragTarget.style.borderColor = "#d32f2f";
  
  const activeMgrPitch = currentSport === 'soccer' 
    ? document.getElementById('manager-soccer-pitch') 
    : document.getElementById('manager-basketball-pitch');

  if (dragTarget.parentElement.id === 'player-bench') {
    activeMgrPitch.appendChild(dragTarget);
  }
}

function moveDrag(e) {
  if (!isDragging || !dragTarget) return;
  e.preventDefault();
  
  const activeMgrPitch = currentSport === 'soccer' 
    ? document.getElementById('manager-soccer-pitch') 
    : document.getElementById('manager-basketball-pitch');
    
  const pitchRect = activeMgrPitch.getBoundingClientRect();
  
  let clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  let clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

  let x = Math.max(0, Math.min(clientX - pitchRect.left, pitchRect.width));
  let y = Math.max(0, Math.min(clientY - pitchRect.top, pitchRect.height));
  let pctX = (x / pitchRect.width) * 100; 
  let pctY = (y / pitchRect.height) * 100;
  
  dragTarget.style.left = `${pctX}%`; 
  dragTarget.style.top = `${pctY}%`;

  const pId = dragTarget.id.split('-')[1];
  const pObj = matchData.players.find(p => p.id == pId);
  if(pObj) { pObj.state = 'pitch'; pObj.x = pctX; pObj.y = pctY; }
}

function endDrag(e) {
  if (!isDragging || !dragTarget) return;
  dragTarget.style.borderColor = "#f57f17";
  
  const activeMgrPitch = currentSport === 'soccer' 
    ? document.getElementById('manager-soccer-pitch') 
    : document.getElementById('manager-basketball-pitch');
    
  const bench = document.getElementById('player-bench');
  const pitchRect = activeMgrPitch.getBoundingClientRect();
  
  let clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
  let clientY = e.type.includes('touch') ? e.changedTouches[0].clientY : e.clientY;

  if (clientX < pitchRect.left || clientX > pitchRect.right ||
      clientY < pitchRect.top || clientY > pitchRect.bottom) {
    bench.appendChild(dragTarget);
    dragTarget.style.left = 'auto'; dragTarget.style.top = 'auto';
    const pId = dragTarget.id.split('-')[1];
    const pObj = matchData.players.find(p => p.id == pId);
    if(pObj) { pObj.state = 'bench'; pObj.x = null; pObj.y = null; }
  }
  isDragging = false;
  dragTarget = null;
  renderAllViews();
}

document.addEventListener('mousemove', (e) => { if(isDragging) moveDrag(e); });
document.addEventListener('mouseup', (e) => { if(isDragging) endDrag(e); });

function handleScore(team, val) {
  matchData.scores[team] = Math.max(0, matchData.scores[team] + val);
  renderAllViews();
}

function handleTimer() {
  const btn = document.getElementById('start-btn');
  if (!matchData.isPlaying) {
    matchData.isPlaying = true;
    btn.innerText = "일시 정지"; btn.style.backgroundColor = "#ff9800";
    triggerWhistle();
    timerInterval = setInterval(() => {
      matchData.timeLeft--;
      renderAllViews();
      if (matchData.timeLeft <= 0) {
        pauseTimerState();
        triggerWhistle();
        renderAllViews();
      }
    }, 1000);
  } else {
    pauseTimerState();
    clearInterval(timerInterval);
    triggerWhistle();
    renderAllViews();
  }
}

function pauseTimerState() {
  matchData.isPlaying = false;
  clearInterval(timerInterval);
  const btn = document.getElementById('start-btn');
  if(btn) {
    btn.innerText = matchData.timeLeft <= 0 ? "경기 시작" : "경기 재개";
    btn.style.backgroundColor = "#007bff";
  }
}

function modifyTimer(seconds) {
  matchData.timeLeft = Math.max(0, matchData.timeLeft + seconds);
  renderAllViews();
}

function resetTimer() {
  if(confirm("타이머를 처음(15:00)으로 초기화하시겠습니까? 스코어는 유지됩니다.")) {
    pauseTimerState();
    matchData.timeLeft = DEFAULT_TIME;
    renderAllViews();
  }
}

function triggerWhistle() {
  if (navigator.vibrate) navigator.vibrate(300);
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const freqs = [2100, 2400]; const now = ctx.currentTime;
    freqs.forEach(f => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.setValueAtTime(f, now); gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
    });
  } catch (e) {}
}

renderAllViews();
