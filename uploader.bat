@echo off
:: 유니코드 출력 설정
chcp 65001 >nul

:: Git 자동 커밋 및 푸시 스크립트

:: 저장소 디렉토리로 이동
cd /d %~dp0

:: 현재 디렉토리가 Git 저장소인지 확인
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo 이 디렉토리는 Git 저장소가 아니다 오월아. 나한테 다시 물어봐라.
    exit /b
)

:: Git 상태 출력
echo 현재 Git 상태를 확인합니다...
git status

:: 모든 변경사항 스테이징
echo 변경된 파일을 추가합니다...
git add .

:: 커밋 메시지 입력
set /p commitMessage="커밋 메시지를 입력하세요 (유니코드 지원): "
if "%commitMessage%"=="" (
    echo 커밋 메시지가 입력되지 않았습니다. 기본 메시지를 사용합니다.
    set commitMessage="Update files"
)

:: 커밋 수행
echo 커밋을 수행합니다...
git commit -m "%commitMessage%"

:: 원격 저장소로 푸시
echo 원격 저장소로 푸시합니다...
git push origin main

:: 완료 메시지
if errorlevel 1 (
    echo 푸시 중 문제가 발생했습니다.
    exit /b
) else (
    echo 모든 작업이 완료되었습니다!
)

pause
