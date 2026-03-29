@echo off
echo 🔥 Starting Wings 101 Chatbot...
echo.
echo Starting Server (port 5000)...
start "Wings101-Server" cmd /k "cd /d %~dp0server && npx nodemon index.js"
echo Starting Client (port 3000)...
start "Wings101-Client" cmd /k "cd /d %~dp0client && npm run dev"
echo.
echo ✅ Both server and client are starting!
echo    Server: http://localhost:5000
echo    Client: http://localhost:3000
echo.
start http://localhost:3000
