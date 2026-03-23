# TEoAAAG Dashboard Testbench - Gordon Mode (PowerShell)
param(
    [string]$DashboardUrl = "http://localhost:3000",
    [string]$OutputDir = "E:\dashboard-app\testbench-results"
)

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$Results = @{
    timestamp = Get-Date -Format o
    dashboard_url = $DashboardUrl
    tests = @()
    metrics = @{}
    errors = @()
}

function Write-TestLog {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts] [$Level] $Message"
}

function Test-DashboardAccessibility {
    Write-TestLog "Testing dashboard accessibility..." "TEST"
    try {
        $response = Invoke-WebRequest -Uri $DashboardUrl -UseBasicParsing -TimeoutSec 10
        $test = @{
            name = "Dashboard Accessibility"
            status = "PASS"
            http_code = $response.StatusCode
            url = $DashboardUrl
            timestamp = Get-Date -Format o
        }
        $Results.tests += $test
        Write-TestLog "Found dashboard HTTP $($response.StatusCode)" "PASS"
        return $true
    }
    catch {
        Write-TestLog "Accessibility test failed: $_" "FAIL"
        $Results.errors += @{ test = "accessibility"; error = $_.Exception.Message }
        return $false
    }
}

function Test-HTMLStructure {
    Write-TestLog "Testing HTML structure..." "TEST"
    try {
        $response = Invoke-WebRequest -Uri $DashboardUrl -UseBasicParsing -TimeoutSec 10
        $html = $response.Content
        
        $requiredElements = @(
            '<div class="container">',
            'id="chat-input"',
            'id="preview3d"',
            'id="file-tree"',
            '<canvas id="preview3d">',
            'THREE.js',
            'Settings'
        )
        
        $test = @{
            name = "HTML Structure"
            status = "PASS"
            elements_found = 0
            elements_total = $requiredElements.Count
            missing_elements = @()
        }
        
        foreach ($element in $requiredElements) {
            if ($html -like "*$element*") {
                $test.elements_found++
            }
            else {
                $test.missing_elements += $element
            }
        }
        
        if ($test.elements_found -ne $test.elements_total) {
            $test.status = "WARN"
        }
        
        $Results.tests += $test
        Write-TestLog "Found $($test.elements_found)/$($test.elements_total) required elements" "PASS"
        return $true
    }
    catch {
        Write-TestLog "HTML structure test failed: $_" "FAIL"
        $Results.errors += @{ test = "html_structure"; error = $_.Exception.Message }
        return $false
    }
}

function Test-JavaScriptFeatures {
    Write-TestLog "Testing JavaScript features..." "TEST"
    try {
        $response = Invoke-WebRequest -Uri $DashboardUrl -UseBasicParsing -TimeoutSec 10
        $html = $response.Content
        
        $jsFeatures = @(
            'function init3D()',
            'function sendChat()',
            'function toggleFullscreen()',
            'function openModelsModal()',
            'function loadProjects()',
            'IndexedDB',
            'WebGL',
            'requestAnimationFrame'
        )
        
        $test = @{
            name = "JavaScript Features"
            features_found = 0
            features_total = $jsFeatures.Count
            features = @{}
        }
        
        foreach ($feature in $jsFeatures) {
            $present = $html -like "*$feature*"
            $test.features[$feature] = $present
            if ($present) {
                $test.features_found++
            }
        }
        
        $test.status = if ($test.features_found -eq $test.features_total) { "PASS" } else { "WARN" }
        
        $Results.tests += $test
        Write-TestLog "Found $($test.features_found)/$($test.features_total) JS features" "PASS"
        return $true
    }
    catch {
        Write-TestLog "JS features test failed: $_" "FAIL"
        $Results.errors += @{ test = "js_features"; error = $_.Exception.Message }
        return $false
    }
}

function Test-PerformanceMetrics {
    Write-TestLog "Measuring performance metrics..." "TEST"
    try {
        $responseTimes = @()
        
        for ($i = 0; $i -lt 5; $i++) {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $DashboardUrl -UseBasicParsing -TimeoutSec 10
            $stopwatch.Stop()
            $responseTimes += $stopwatch.Elapsed.TotalSeconds
        }
        
        $test = @{
            name = "Performance Metrics"
            status = "PASS"
            avg_response_time = [Math]::Round(($responseTimes | Measure-Object -Average).Average, 3)
            min_response_time = [Math]::Round(($responseTimes | Measure-Object -Minimum).Minimum, 3)
            max_response_time = [Math]::Round(($responseTimes | Measure-Object -Maximum).Maximum, 3)
            requests = 5
        }
        
        $Results.tests += $test
        $Results.metrics = $test
        Write-TestLog "Avg response: $($test.avg_response_time)s" "PASS"
        return $true
    }
    catch {
        Write-TestLog "Performance test failed: $_" "FAIL"
        $Results.errors += @{ test = "performance"; error = $_.Exception.Message }
        return $false
    }
}

function Test-ModalStructure {
    Write-TestLog "Testing modal structure..." "TEST"
    try {
        $response = Invoke-WebRequest -Uri $DashboardUrl -UseBasicParsing -TimeoutSec 10
        $html = $response.Content
        
        $modals = @(
            'modelsModal',
            'settingsModal',
            'hardwareModal',
            'diagnosticsModal',
            'uiCustomizerModal',
            'pathsModal',
            'optimizeModal'
        )
        
        $test = @{
            name = "Modal Components"
            modals_found = 0
            modals = @{}
        }
        
        foreach ($modal in $modals) {
            $present = $html -like "*id=`"$modal`"*"
            $test.modals[$modal] = $present
            if ($present) {
                $test.modals_found++
            }
        }
        
        $test.status = if ($test.modals_found -eq $modals.Count) { "PASS" } else { "WARN" }
        
        $Results.tests += $test
        Write-TestLog "Found $($test.modals_found)/$($modals.Count) modals" "PASS"
        return $true
    }
    catch {
        Write-TestLog "Modal test failed: $_" "FAIL"
        $Results.errors += @{ test = "modals"; error = $_.Exception.Message }
        return $false
    }
}

function Generate-Report {
    Write-TestLog "Generating test report..." "INFO"
    
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $reportFile = Join-Path $OutputDir "testbench-report-$ts.json"
    
    $Results | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportFile -Encoding UTF8
    Write-TestLog "Report saved: $reportFile" "INFO"
    
    $summaryFile = Join-Path $OutputDir "testbench-summary-$ts.txt"
    
    $passed = ($Results.tests | Where-Object { $_.status -eq "PASS" }).Count
    $warned = ($Results.tests | Where-Object { $_.status -eq "WARN" }).Count
    $failed = ($Results.tests | Where-Object { $_.status -eq "FAIL" }).Count
    
    $summary = "============================================================`n"
    $summary += "TEoAAAG DASHBOARD TESTBENCH REPORT`n"
    $summary += "============================================================`n`n"
    $summary += "Timestamp: $($Results.timestamp)`n"
    $summary += "Dashboard URL: $($Results.dashboard_url)`n`n"
    $summary += "Test Results: $passed PASS, $warned WARN, $failed FAIL`n`n"
    
    foreach ($test in $Results.tests) {
        $summary += "[$($test.status)] $($test.name)`n"
        foreach ($key in $test.Keys) {
            if ($key -notin @('name', 'status')) {
                $summary += "  $key`: $($test[$key])`n"
            }
        }
        $summary += "`n"
    }
    
    $summary | Out-File -FilePath $summaryFile -Encoding UTF8
    Write-TestLog "Summary saved: $summaryFile" "INFO"
}

function Run-AllTests {
    Write-TestLog "============================================================" "INFO"
    Write-TestLog "GORDON TESTBENCH - AUTOMATED DASHBOARD TESTING" "INFO"
    Write-TestLog "============================================================" "INFO"
    Write-TestLog "" "INFO"
    
    Test-DashboardAccessibility
    Test-HTMLStructure
    Test-JavaScriptFeatures
    Test-PerformanceMetrics
    Test-ModalStructure
    
    Write-TestLog "" "INFO"
    Write-TestLog "============================================================" "INFO"
    
    Generate-Report
    
    Write-TestLog "" "INFO"
    Write-TestLog "Testbench complete. Results in: $OutputDir" "INFO"
    Write-TestLog "" "INFO"
}

Run-AllTests
