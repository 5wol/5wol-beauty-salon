document.addEventListener("DOMContentLoaded", () => {
    // JSON 파일 경로
    const JSON_FILE_PATH = './assets/5wol-schedule.json';

    // HTML 요소 가져오기
    const calendarBody = document.getElementById('viewer-calendar-body');
    const currentMonthElement = document.getElementById('current-month');
    const broadcastLinkButton = document.getElementById("broadcast-link-button");
    const pricelistButton = document.getElementById("pricelist-button");
    const pricePopup = document.getElementById("price-popup");
    const closePricePopup = document.getElementById("close-price-popup");

    // 현재 연도와 월을 PC 시간에서 가져오기
    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonthIndex = today.getMonth(); // 현재 월 (0-based)

    // JSON 데이터를 로드하여 캘린더에 표시
    async function loadSchedule() {
        try {
            const response = await fetch(`${JSON_FILE_PATH}?_=${new Date().getTime()}`);
            if (!response.ok) throw new Error('JSON 파일을 불러오지 못했습니다.');
            const data = await response.json();

            // JSON 데이터로 캘린더 갱신
            updateCalendar(currentYear, currentMonthIndex, data);
        } catch (error) {
            console.error('에러 발생:', error);
            alert('일정을 로드하는 중 문제가 발생했습니다.');
        }
    }

    // 캘린더 갱신 함수
    function updateCalendar(year, month, events) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthElement.textContent = `${year}년 ${month + 1}월`;
        calendarBody.innerHTML = '';

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
                    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

                    // 일정이 있는 날짜 표시
                    if (events[fullDate]) {
                        cell.innerHTML = `
                        <div class="scheduled-datePrint">${date}</div>
                        <div class="scheduled-title">${events[fullDate].title}</div>                      
                        `;
                        cell.style.backgroundColor = "#FFF4E1";
                    } else {
                        cell.innerHTML = `<div class="scheduled-datePrint">${date}</div>`;
                    }
                    date++;
                }
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
    }

    // 이전/다음 버튼 기능
    document.getElementById('prev-month').addEventListener('click', () => {
        if (currentMonthIndex === 0) {
            currentMonthIndex = 11;
            currentYear--;
        } else {
            currentMonthIndex--;
        }
        loadSchedule();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        if (currentMonthIndex === 11) {
            currentMonthIndex = 0;
            currentYear++;
        } else {
            currentMonthIndex++;
        }
        loadSchedule();
    });

    // 방송국 버튼 클릭 시
    broadcastLinkButton.addEventListener("click", () => {
        window.open("https://ch.sooplive.co.kr/5wolindeyo/post/136049221", "_blank");
    });

    // 가격표 보기 버튼 클릭 시
    pricelistButton.addEventListener("click", () => {
        pricePopup.classList.remove("hidden");
    });

    // 가격표 닫기 버튼 클릭 시
    if (closePricePopup) {
        closePricePopup.addEventListener("click", () => {
            pricePopup.classList.add("hidden"); // 강제로 클래스 추가
        });
    }

    // JSON 데이터 로드 및 캘린더 초기화
    loadSchedule();
});