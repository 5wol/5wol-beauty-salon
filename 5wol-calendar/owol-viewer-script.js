document.addEventListener("DOMContentLoaded", () => {
  // ===== Config =====
  const JSON_FILE_PATH = './assets/5wol-calendar-schedule.json';

  // ===== Elements =====
  const calendarBody = document.getElementById('viewer-calendar-body');
  const currentMonthElement = document.getElementById('current-month');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');

  // Today's date (YYYY-MM-DD)
  const pad2 = (n)=>String(n).padStart(2,'0');
  const _today = new Date();
  const todayStr = `${_today.getFullYear()}-${pad2(_today.getMonth()+1)}-${pad2(_today.getDate())}`;

  // Modal elements (define BEFORE any use)
  const modal      = document.getElementById('event-modal');
  const modalDate  = document.getElementById('modal-date');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc  = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const modalPrev  = document.getElementById('modal-prev');
  const modalNext  = document.getElementById('modal-next');

  // ===== State =====
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonthIndex = today.getMonth();

  // month data for modal navigation
  let monthEvents = {};        // {'YYYY-MM-DD': {title, description, colorNumber}}
  let sortedEventDates = [];   // ['YYYY-MM-DD', ...]
  let activeDate = null;

  // ===== Utils =====
  const colorMap = { 1:"#FFF4E1", 2:"#D6F3F9", 3:"#FFEBD8", 4:"#DBEFE0" };

  function fmtKDate(isoStr){
    const [y,m,d] = isoStr.split('-').map(s=>parseInt(s,10));
    return `${y}년 ${m}월 ${d}일 일정`;
  }

  function openModal(dateStr){
    activeDate = dateStr;
    const evt = monthEvents[dateStr] || {};
    modalDate.textContent  = fmtKDate(dateStr);
    modalTitle.textContent = evt.title || '(제목 없음)';
    const desc = (evt.description ?? '').trim();
    modalDesc.textContent  = desc || evt.title || '내용이 없습니다.';
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    modalClose.focus();
  }

  function closeModal(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    activeDate = null;
  }

  function moveModal(delta){
    if(!activeDate || !sortedEventDates.length) return;
    const idx = sortedEventDates.indexOf(activeDate);
    if(idx < 0) return;
    let ni = idx + delta;
    if(ni < 0) ni = sortedEventDates.length - 1;
    if(ni >= sortedEventDates.length) ni = 0;
    openModal(sortedEventDates[ni]);
  }

  // ===== Data =====
  async function loadSchedule(){
    const res = await fetch(`${JSON_FILE_PATH}?_=${Date.now()}`);
    if(!res.ok) throw new Error('일정 JSON을 불러오지 못했습니다.');
    const data = await res.json();
    updateCalendar(currentYear, currentMonthIndex, data);
  }

  // ===== Render =====
  function updateCalendar(year, month, events){
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    currentMonthElement.textContent = `${year}년 ${month + 1}월`;
    calendarBody.innerHTML = '';

    // reset month data
    monthEvents = {};

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');

        if (i === 0 && j < firstDay) {
          cell.textContent = '';
        } else if (date > daysInMonth) {
          break;
        } else {
          const fullDate = `${year}-${String(month + 1).padStart(2,'0')}-${String(date).padStart(2,'0')}`;
          cell.dataset.date = fullDate; // <= later click handler uses this
          if (events[fullDate]){
            monthEvents[fullDate] = events[fullDate];
            const { title, colorNumber } = events[fullDate];
            const color = colorNumber ? colorMap[colorNumber] : "#FFF4E1";
            cell.innerHTML = `
              <div class="scheduled-datePrint">${date}</div>
              <div class="scheduled-title">${title || ''}</div>
            `;
            cell.classList.add('has-event');
            cell.style.backgroundColor = color;
          } else {
            cell.innerHTML = `<div class="scheduled-datePrint">${date}</div>`;
          }
          if (fullDate === todayStr) cell.classList.add('today');
          date++;
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }

    // sorted dates for prev/next navigation
    sortedEventDates = Object.keys(monthEvents).sort();
  }

  // ===== Listeners =====
  prevBtn.addEventListener('click', () => {
    if (currentMonthIndex === 0){ currentMonthIndex = 11; currentYear--; }
    else { currentMonthIndex--; }
    loadSchedule();
  });
  nextBtn.addEventListener('click', () => {
    if (currentMonthIndex === 11){ currentMonthIndex = 0; currentYear++; }
    else { currentMonthIndex++; }
    loadSchedule();
  });

  // open modal on cell click (single handler, not inside update)
  calendarBody.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if(!cell || !cell.dataset.date) return;
    const d = cell.dataset.date;
    if(monthEvents[d]) openModal(d);
  });

  // modal controls
  modalClose.addEventListener('click', closeModal);
  document.getElementById('event-modal').addEventListener('click', (e)=>{
    if(e.target.classList.contains('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(modal.classList.contains('hidden')) return;
    if(e.key === 'Escape') closeModal();
    if(e.key === 'ArrowLeft') moveModal(-1);
    if(e.key === 'ArrowRight') moveModal(1);
  });
  modalPrev.addEventListener('click', ()=>moveModal(-1));
  modalNext.addEventListener('click', ()=>moveModal(1));

  // ===== GO! =====
  loadSchedule().catch(err => {
    console.error(err);
    alert('일정을 로드하는 중 문제가 발생했습니다.');
  });
});
