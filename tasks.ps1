<#
.SYNOPSIS
    Auralis centralized tasks runner for Windows PowerShell.
.DESCRIPTION
    Standardized entry points for setup, linting, testing, benchmarking, and execution.
#>

param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet("setup", "smoke", "run-backend", "run-frontend", "test", "bench", "lint")]
    [string]$Target
)

$ErrorActionPreference = "Stop"

switch ($Target) {
    "setup" {
        Write-Host "=== Setting up Auralis environment ===" -ForegroundColor Cyan
        python -m pip install --upgrade pip
        python -m pip install -e .
        python -m pip install ruff pytest pytest-asyncio pyyaml pydantic numpy
    }
    "lint" {
        Write-Host "=== Running Ruff Linter ===" -ForegroundColor Cyan
        ruff check src tests
    }
    "test" {
        Write-Host "=== Running Pytest Suite ===" -ForegroundColor Cyan
        pytest tests/ -v
    }
    "smoke" {
        Write-Host "=== Running Smoke Tests ===" -ForegroundColor Cyan
        python -c "import src; print('Auralis package imports cleanly:', src.__version__)"
    }
    "run-backend" {
        Write-Host "=== Launching Auralis Backend ===" -ForegroundColor Cyan
        python -m src.main
    }
    "run-frontend" {
        Write-Host "=== Launching Auralis Frontend ===" -ForegroundColor Cyan
        Set-Location frontend
        npm run dev
    }
    "bench" {
        Write-Host "=== Running Benchmark Harness ===" -ForegroundColor Cyan
        Write-Host "Benchmark harness will be activated in Phase 2."
    }
}
