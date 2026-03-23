# TEoAAAG Library Manager GUI
# WPF-based Windows UI for library management

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName System.Windows.Forms

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="TEoAAAG Library Manager" 
        Height="700" Width="1000"
        Background="#0d1117"
        Foreground="#c9d1d9"
        WindowStartupLocation="CenterScreen">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="60"/>
            <RowDefinition Height="1*"/>
            <RowDefinition Height="60"/>
        </Grid.RowDefinitions>
        
        <StackPanel Grid.Row="0" Background="#161b22" Orientation="Horizontal" Padding="15">
            <TextBlock Text="📚 TEoAAAG Library Manager" FontSize="18" FontWeight="Bold" VerticalAlignment="Center" Foreground="#58a6ff"/>
        </StackPanel>
        
        <Grid Grid.Row="1" Margin="15">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="300"/>
                <ColumnDefinition Width="1*"/>
            </Grid.ColumnDefinitions>
            
            <!-- Left Panel: Libraries -->
            <StackPanel Grid.Column="0" Margin="0,0,10,0">
                <TextBlock Text="Libraries" FontWeight="Bold" Foreground="#58a6ff" Margin="0,0,0,10"/>
                <ListBox Name="LibraryList" Height="400" Background="#0d1117" BorderBrush="#30363d" Foreground="#c9d1d9"/>
                <Button Name="RefreshBtn" Content="🔄 Refresh" Margin="0,10,0,5" Padding="10" Background="#1f2937" Foreground="#e5e7eb"/>
                <Button Name="BundleBtn" Content="📦 Bundle All" Margin="0,5,0,5" Padding="10" Background="#3b82f6" Foreground="#fff"/>
                <Button Name="CheckBtn" Content="🔍 Check Issues" Margin="0,5,0,0" Padding="10" Background="#f59e0b" Foreground="#fff"/>
            </StackPanel>
            
            <!-- Right Panel: Details -->
            <StackPanel Grid.Column="1" Margin="10,0,0,0">
                <TextBlock Text="Details" FontWeight="Bold" Foreground="#58a6ff" Margin="0,0,0,10"/>
                <TextBox Name="DetailsBox" Height="500" Background="#0d1117" Foreground="#58a6ff" BorderBrush="#30363d" 
                         VerticalScrollBarVisibility="Auto" IsReadOnly="True" FontFamily="Courier New" FontSize="10"/>
                <StackPanel Orientation="Horizontal" Margin="0,10,0,0">
                    <Button Name="GenerateBtn" Content="📄 Generate Report" Margin="0,0,5,0" Padding="10" Background="#10b981" Foreground="#fff" Width="200"/>
                    <Button Name="OpenBtn" Content="📂 Open in Explorer" Padding="10" Background="#6b7280" Foreground="#fff"/>
                </StackPanel>
            </StackPanel>
        </Grid>
        
        <StackPanel Grid.Row="2" Background="#161b22" Orientation="Horizontal" Padding="15" HorizontalAlignment="Right">
            <TextBlock Name="StatusText" VerticalAlignment="Center" Foreground="#34d399" Margin="0,0,15,0"/>
            <Button Name="CloseBtn" Content="Close" Padding="15,8" Background="#1f2937" Foreground="#e5e7eb" Width="100"/>
        </StackPanel>
    </Grid>
</Window>
"@

$reader = [System.Xml.XmlNodeReader]::new([xml]$xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

# Get controls
$libraryList = $window.FindName("LibraryList")
$detailsBox = $window.FindName("DetailsBox")
$statusText = $window.FindName("StatusText")
$refreshBtn = $window.FindName("RefreshBtn")
$bundleBtn = $window.FindName("BundleBtn")
$checkBtn = $window.FindName("CheckBtn")
$generateBtn = $window.FindName("GenerateBtn")
$openBtn = $window.FindName("OpenBtn")
$closeBtn = $window.FindName("CloseBtn")

function Update-Libraries {
    $libraryList.Items.Clear()
    $libs = @(Get-ChildItem -Path "." -Filter "*.lib.js" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    
    foreach ($lib in $libs) {
        $item = New-Object System.Windows.Controls.TextBlock
        $item.Text = $lib
        $item.Foreground = "#58a6ff"
        $libraryList.Items.Add($item) | Out-Null
    }
    
    $statusText.Text = "Found $($libs.Count) libraries"
}

function Show-Details {
    param([string]$Text)
    $detailsBox.Text = $Text
}

$refreshBtn.Add_Click({
    Update-Libraries
    Show-Details "Libraries refreshed"
})

$bundleBtn.Add_Click({
    Show-Details "Bundling libraries..."
    $statusText.Text = "Bundling..."
    
    & powershell -NoProfile -ExecutionPolicy Bypass -Command {
        param($detailsBox, $statusText)
        $output = & .\lib-manager.ps1 -Action "bundle" 2>&1 | Out-String
    } -ArgumentList $detailsBox, $statusText
    
    Show-Details "Bundle complete!`n`nRun: lib-manager auto"
    $statusText.Text = "Complete"
})

$checkBtn.Add_Click({
    Show-Details "Checking for issues..."
    $statusText.Text = "Checking..."
    
    $output = & powershell -NoProfile -ExecutionPolicy Bypass -Command {
        $libs = Get-ChildItem -Path "." -Filter "*.lib.js" -ErrorAction SilentlyContinue
        $result = ""
        $result += "Libraries Found: $($libs.Count)`n`n"
        
        foreach ($lib in $libs) {
            $content = Get-Content -Path $lib.Name
            $funcs = [regex]::Matches($content, 'function\s+(\w+)\s*\(') | ForEach-Object { $_.Groups[1].Value }
            $result += "$($lib.Name): $($funcs.Count) functions`n"
        }
        
        return $result
    } 2>&1 | Out-String
    
    Show-Details $output
    $statusText.Text = "Check complete"
})

$generateBtn.Add_Click({
    $statusText.Text = "Generating report..."
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\lib-manager.ps1" -Action "fullreport" | Out-Null
    Show-Details "Report generated!`n`nLocation: .\lib\bundle-report.txt"
    $statusText.Text = "Report ready"
})

$openBtn.Add_Click({
    $libDir = ".\lib"
    if (Test-Path $libDir) {
        Invoke-Item $libDir
    } else {
        [System.Windows.MessageBox]::Show("Lib directory not found", "Error")
    }
})

$closeBtn.Add_Click({
    $window.Close()
})

# Initialize
Update-Libraries
Show-Details "Welcome to TEoAAAG Library Manager`n`n- Select a library to view`n- Click 'Bundle All' to combine libraries`n- Click 'Check Issues' to find problems`n- Click 'Generate Report' for detailed analysis"
$statusText.Text = "Ready"

$window.ShowDialog() | Out-Null
