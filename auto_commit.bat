@echo off
:: ============================================================
:: auto_commit.bat  —  thin wrapper around auto_commit.ps1
:: One-shot: auto_commit.bat
:: Watch:    auto_commit.bat -Watch
:: ============================================================
powershell -ExecutionPolicy Bypass -File "%~dp0auto_commit.ps1" %* -Watch -IntervalMinutes 2 
