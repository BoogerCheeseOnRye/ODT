powershell -Command "
\$folder = 'E:\dashboard-appv2'
\$oldPath = 'E:/dashboard-app'
\$newPath = 'E:/dashboard-appv2'
\$oldPath2 = 'E:\\dashboard-app'
\$newPath2 = 'E:\\dashboard-appv2'

Get-ChildItem -Path \$folder -Include '*.bat','*.ps1','*.html','*.js' -Recurse | ForEach-Object {
    \$file = \$_.FullName
    \$content = Get-Content -Path \$file -Raw
    
    if (\$content -match 'dashboard-app') {
        \$newContent = \$content -replace [regex]::Escape(\$oldPath), \$newPath
        \$newContent = \$newContent -replace [regex]::Escape(\$oldPath2), \$newPath2
        \$newContent = \$newContent -replace 'E:\\\\dashboard-app(?!v2)', 'E:\\\\dashboard-appv2'
        \$newContent = \$newContent -replace 'E:/dashboard-app(?!v2)', 'E:/dashboard-appv2'
        
        Set-Content -Path \$file -Value \$newContent -Encoding UTF8
        Write-Host \"Updated: \$(\$_.Name)\"
    }
}
Write-Host 'Path replacement complete'
"