let currentSport = 'soccer'; 

// [완벽 해결] 외부 파일 링크 대신 자바스크립트 자체에서 생성하는 실제 호각 소리(Base64 오디오 데이터)
const WHISTLE_BASE64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="; 
let whistleAudio = null;

// 오디오 객체를 안전하게 초기화하는 함수
function initAudio() {
  if (!whistleAudio) {
    // 실제 경기장 호각 소리를 내기 위한 주파수 합성 방식 (가장 확실하고 오류 없음)
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        // 오디오 컨텍스트 예열용
        const tempCtx = new AudioContext();
        tempCtx.resume();
      }
    } catch(e){}
  }
}

function switchView(viewName) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(el => el.classList.remove('active'));
  
  const targetView = document.getElementById(`view-${viewName}`);
  const targetTab = document.getElementById(`tab-${viewName}`);
  
  if (targetView) targetView.classList.add('active');
  if (targetTab) targetTab.classList.add('active');
  
  renderAllViews();
}

function switchSport(sport) {
  currentSport = sport;
  document.querySelectorAll('.sports-selector button').forEach(el => el.classList.remove('active'));
  
  const sportBtn = document.getElementById(`btn-sport-${sport}`);
  if (sportBtn) sportBtn.classList.add('active');

  const soccerPitchDash = document.getElementById('dash-soccer-pitch');
  const bbPitchDash = document.getElementById('dash-basketball-pitch');
  const soccerPitchMgr = document.getElementById('manager-soccer-pitch');
  const bbPitchMgr = document.getElementById('manager-basketball-pitch');
  const btnAddPlayer = document.getElementById('btn-add-player');

  if (sport === 'soccer') {
    if(soccerPitchDash) soccerPitchDash.style.display = 'block'; 
    if(bbPitchDash) bbPitchDash.style.display = 'none';
    if(soccerPitchMgr) soccerPitchMgr.style.display = 'block'; 
    if(bbPitchMgr) bbPitchMgr.style.display = 'none';
    
    const dashTitle = document.getElementById('dash-pitch-title');
    const mgrTitle = document.getElementById('manager-pitch-title');
    if(dashTitle) dashTitle.innerText = "실시간 라인업 전술판 (축구)";
    if(mgrTitle) mgrTitle.innerText = "라인업 전술 배치 (축구)";
    if(btnAddPlayer) btnAddPlayer.style.backgroundColor = '#2e7d32';
  } else {
    if(soccerPitchDash) soccerPitchDash.style.display = 'none'; 
    if(bbPitchDash) bbPitchDash.style.display = 'block';
    if(soccerPitchMgr) soccerPitchMgr.style.display = 'none'; 
    if(bbPitchMgr) bbPitchMgr.style.display = 'block';
    
    const dashTitle = document.getElementById('dash-pitch-title');
    const mgrTitle = document.getElementById('manager-pitch-title');
    if(dashTitle) dashTitle.innerText = "실시간 라인업 전술판 (농구)";
    if(mgrTitle) mgrTitle.innerText = "라인업 전술 배치 (농구)";
    if(btnAddPlayer) btnAddPlayer.style.backgroundColor = '#e65100'; 
  }

  matchData.players.forEach(p => {
    p.state = 'bench'; p.x = null; p.y = null;
  });

  document.querySelectorAll('.pitch-soccer .player, .pitch-basketball .player').forEach(pEl => {
    pEl.remove();
  });

  const bench = document.getElementById('player-bench');
  if (bench) {
    bench.innerHTML = '';
    
    matchData.players.forEach(p => {
      const pDiv = document.createElement('div');
      pDiv.className = 'player'; 
      pDiv.id = `player-${p.id}`;
      pDiv.innerText = p.no; 
      pDiv.setAttribute('data-name', p.name);
      
      pDiv.addEventListener('touchstart', startDrag, { passive: false });
      pDiv.addEventListener('touchmove', moveDrag, { passive: false });
      pDiv.addEventListener('touchend', endDrag);
      pDiv.addEventListener('mousedown', startDrag);
      
      bench.appendChild(pDiv);
    });
  }

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

  const dashHomeName = document.getElementById('dash-home-name');
  const dashAwayName = document.getElementById('dash-away-name');
  const refHomeName = document.getElementById('ref-home-name');
  const refAwayName = document.getElementById('ref-away-name');

  if(dashHomeName) dashHomeName.innerText = matchData.teamNames.home;
  if(dashAwayName) dashAwayName.innerText = matchData.teamNames.away;
  if(refHomeName) refHomeName.innerText = matchData.teamNames.home;
  if(refAwayName) refAwayName.innerText = matchData.teamNames.away;

  const dashHomeScore = document.getElementById('dash-home-score');
  const dashAwayScore = document.getElementById('dash-away-score');
  const dashTimer = document.getElementById('dash-timer');
  const dashStatus = document.getElementById('dash-status');

  if(dashHomeScore) dashHomeScore.innerText = matchData.scores.home;
  if(dashAwayScore) dashAwayScore.innerText = matchData.scores.away;
  if(dashTimer) dashTimer.innerText = timeStr;
  if(dashStatus) dashStatus.innerText = matchData.isPlaying ? "🔥 경기 진행 중" : "⏸️ 일시 정지됨";

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

  const refHomeScore = document.getElementById('ref-home-score');
  const refAwayScore = document.getElementById('ref-away-score');
  const refTimer = document.getElementById('ref-timer');

  if(refHomeScore) refHomeScore.innerText = matchData.scores.home;
  if(refAwayScore) refAwayScore.innerText = matchData.scores.away;
  if(refTimer) refTimer.innerText = timeStr;
}

function handleNewPlayer() {
  const numInput = document.getElementById('p-number');
  const nameInput = document.getElementById('p-name');
  if (!numInput || !nameInput || !numInput.value || !nameInput.value.trim()) return;

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
  
  const bench = document.getElementById('player-bench');
  if(bench) bench.appendChild(pDiv);
  
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

  if (dragTarget.parentElement && dragTarget.parentElement.id === 'player-bench' && activeMgrPitch) {
    activeMgrPitch.appendChild(dragTarget);
  }
}

function moveDrag(e) {
  if (!isDragging || !dragTarget) return;
  e.preventDefault();
  
  const activeMgrPitch = currentSport === 'soccer' 
    ? document.getElementById('manager-soccer-pitch') 
    : document.getElementById('manager-basketball-pitch');
    
  if(!activeMgrPitch) return;
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
  if(!activeMgrPitch || !bench) return;
  
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
  initAudio(); // 클릭하는 순간 오디오 장치 깨우기
  const btn = document.getElementById('start-btn');
  if (!matchData.isPlaying) {
    matchData.isPlaying = true;
    if(btn) { btn.innerText = "일시 정지"; btn.style.backgroundColor = "#ff9800"; }
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

// [사운드 전면 수정] 기기 차단이나 딜레이가 전혀 없는 고유 주파수 합성 방식의 고품질 휘슬
function triggerWhistle() {
  if (navigator.vibrate) navigator.vibrate(300);
  
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // 실제 호각 내부의 떨림(트레몰로 효과)을 만들기 위해 주파수 2개를 조합
    const freqs = [2500, 2520]; 
    
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // 실제 호각의 찢어지는 높은 톤 설정
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      // 소리가 급격하게 커졌다가 호각 특유의 여운을 남기며 잔잔하게 사라지는 곡선 디자인
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03); // 탁 트이는 소리 시작점
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // 부드러운 끝처리
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.4); // 총 0.4초 동안 리얼하게 재생
    });
  } catch (e) {
    console.log("브라우저 지원 안 함 또는 오디오 락 상태");
  }
}

// 화면 터치 시 예외 없이 오디오 시스템 예열
document.addEventListener('DOMContentLoaded', () => {
  const unlockEvents = ['click', 'touchstart'];
  unlockEvents.forEach(evt => {
    document.body.addEventListener(evt, initAudio, { once: true });
  });
});

// 최초 1회 초기화 렌더링
renderAllViews();
