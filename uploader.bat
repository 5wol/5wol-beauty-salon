@echo off
:: 현재 작업 디렉토리 확인
echo 현재 작업 디렉토리: %cd%

:: Git 초기화 확인
if not exist ".git" (
    echo 현재 폴더는 Git 저장소가 아니래 오월아. 나한테 다시 물어봐라.
    pause
    exit /b
)

:: Git 상태 출력
echo 현재 Git 상태:
git status

:: 변경사항 추가
echo 변경사항을 추가합니다...
git add .

:: 커밋 메시지 입력
set /p commit_message="커밋 메시지를 입력하세요: "

:: 커밋 실행
git commit -m "%commit_message%"

:: 원격 저장소로 푸시
echo 변경사항을 원격 저장소로 푸시합니다...
git push

:: 완료 메시지
echo 작업이 완료되었습니다!
pause