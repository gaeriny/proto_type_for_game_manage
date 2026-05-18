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
    if(soccerPitchDash) soccerPitchDash.style.display = 'block'; 
    if(bbPitchDash) bbPitchDash.style.display = 'none';
    if(soccerPitchMgr) soccerPitchMgr.style.display = 'block'; 
    if(bbPitchMgr) bbPitchMgr.style.display = 'none';
    document.getElementById('dash-pitch-title').innerText = "실시간 라인업 전술판 (축구)";
    document.getElementById('manager-pitch-title').innerText = "라인업 전술 배치 (축구)";
    btnAddPlayer.style.backgroundColor = '#2e7d32';
  } else {
    if(soccerPitchDash) soccerPitchDash.style.display = 'none'; 
    if(bbPitchDash) bbPitchDash.style.display = 'block';
    if(soccerPitchMgr) soccerPitchMgr.style.display = 'none'; 
    if(bbPitchMgr) bbPitchMgr.style.display = 'block';
    document.getElementById('dash-pitch-title').innerText = "실시간 라인업 전술판 (농구)";
    document.getElementById('manager-pitch-title').innerText = "라인업 전술 배치 (농구)";
    btnAddPlayer.style.backgroundColor = '#e65100'; 
  }

  // 데이터 상태를 모두 대기석으로 초기화
  matchData.players.forEach(p => {
    p.state = 'bench'; p.x = null; p.y = null;
  });

  // [버그 해결 핵심] 기존 코트(축구장/농구장) 위에 배치되어 있던 모든 HTML 선수 칩들을 화면에서 완전히 깨끗하게 지웁니다.
  document.querySelectorAll('.pitch-soccer .player, .pitch-basketball .player').forEach(pEl => {
    pEl.remove();
  });

  // 감독 모드의 대시보드(선수 대기석) 화면을 처음 상태로 되돌립니다.
  const bench = document.getElementById('player-bench');
  if(bench) {
    // 기존 대기석에 있던 칩들도 싹 비우고 데이터 기반으로 온전하게 다시 그려줍니다.
    bench.innerHTML = '';
    
    matchData.players.forEach(p => {
      const pDiv = document.createElement('div');
      pDiv.className = 'player'; 
      pDiv.id = `player-${p.id}`;
      pDiv.innerText = p.no; 
      pDiv.setAttribute('data-name', p.name);
      
      // 드래그 이벤트를 처음 등록할 때와 똑같이 새롭게 바인딩해 줍니다.
      pDiv.addEventListener('touchstart', startDrag, { passive: false });
      pDiv.addEventListener('touchmove', moveDrag, { passive: false });
      pDiv.addEventListener('touchend', endDrag);
      pDiv.addEventListener('mousedown', startDrag);
      
      bench.appendChild(pDiv);
    });
  }

  renderAllViews();
}
