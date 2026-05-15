param(
    [string]$HostName,
    [string]$ApiUrl = "https://nolita.test/api/",
    [string]$ApiProxyTarget = "https://nolita.test",
    [switch]$UseViteProxy,
    [ValidateSet("http", "https")]
    [string]$ApiScheme = "http",
    [int]$ApiPort = 8000,
    [ValidateSet("http", "https")]
    [string]$AdminScheme = "http",
    [int]$AdminPort = 5173,
    [switch]$NoBackendEnv,
    [switch]$NoCacheClear
)

$ErrorActionPreference = "Stop"

function Get-DefaultLanHost {
    $addresses = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notmatch '^127\.' -and
            $_.IPAddress -notmatch '^169\.254\.' -and
            $_.PrefixOrigin -ne 'WellKnown'
        } |
        Sort-Object InterfaceMetric, IPAddress

    if (-not $addresses) {
        throw "No LAN IPv4 address was found. Pass -HostName explicitly."
    }

    return $addresses[0].IPAddress
}

function Join-Url {
    param(
        [string]$Scheme,
        [string]$HostValue,
        [int]$Port,
        [string]$Path = ""
    )

    $portPart = if ($Port -gt 0) { ":$Port" } else { "" }
    $pathPart = if ($Path) { "/" + $Path.Trim("/") } else { "" }

    return "${Scheme}://${HostValue}${portPart}${pathPart}"
}

function Format-ApiUrl {
    param([string]$Value)

    if (-not $Value) {
        return $null
    }

    $normalized = $Value.Trim()
    if (-not $normalized.EndsWith("/")) {
        $normalized += "/"
    }

    return $normalized
}

function Get-OriginFromUrl {
    param([string]$Value)

    $uri = [System.Uri]$Value
    return $uri.GetLeftPart([System.UriPartial]::Authority)
}

function Set-EnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )

    $line = "$Key=$Value"

    if (-not (Test-Path $Path)) {
        New-Item -ItemType File -Path $Path -Force | Out-Null
    }

    $content = @(Get-Content -Path $Path -ErrorAction SilentlyContinue)
    $pattern = "^\s*#?\s*$([regex]::Escape($Key))="

    if ($content -match $pattern) {
        $content = $content | ForEach-Object {
            if ($_ -match $pattern) { $line } else { $_ }
        }
    } else {
        if ($content.Count -gt 0 -and $content[-1] -ne "") {
            $content += ""
        }
        $content += $line
    }

    Set-Content -Path $Path -Value $content -Encoding UTF8
}

function Write-FrontendEnv {
    param(
        [string]$Path,
        [string]$ApiBaseUrl,
        [string]$ProxyTarget,
        [bool]$UseProxy
    )

    if ($UseProxy) {
        Set-EnvValue -Path $Path -Key "VITE_API_URL" -Value "/api/"
        Set-EnvValue -Path $Path -Key "VITE_API_PROXY_TARGET" -Value $ProxyTarget
    } else {
        Set-EnvValue -Path $Path -Key "VITE_API_URL" -Value $ApiBaseUrl
        Set-EnvValue -Path $Path -Key "VITE_API_PROXY_TARGET" -Value $ProxyTarget
    }

    Set-EnvValue -Path $Path -Key "VITE_APP_NAME" -Value '"Nolita Admin"'
    Set-EnvValue -Path $Path -Key "VITE_APP_ENV" -Value "development"
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $HostName) {
    $HostName = Get-DefaultLanHost
}

$apiBaseUrl = Format-ApiUrl $ApiUrl
if (-not $apiBaseUrl) {
    $apiBaseUrl = (Join-Url -Scheme $ApiScheme -HostValue $HostName -Port $ApiPort -Path "api") + "/"
}

$backendUrl = Get-OriginFromUrl $apiBaseUrl
$adminOrigin = Join-Url -Scheme $AdminScheme -HostValue $HostName -Port $AdminPort
$backendHost = ([System.Uri]$backendUrl).Host
$statefulDomains = @(
    $HostName,
    "${HostName}:$AdminPort",
    $backendHost,
    "localhost",
    "localhost:$AdminPort",
    "127.0.0.1",
    "127.0.0.1:$AdminPort"
) -join ","

$frontendEnvLocal = Join-Path $root "admin/frontend/.env.local"
$frontendEnvProductionLocal = Join-Path $root "admin/frontend/.env.production.local"

Write-FrontendEnv -Path $frontendEnvLocal -ApiBaseUrl $apiBaseUrl -ProxyTarget $ApiProxyTarget -UseProxy $UseViteProxy.IsPresent
Write-FrontendEnv -Path $frontendEnvProductionLocal -ApiBaseUrl $apiBaseUrl -ProxyTarget $ApiProxyTarget -UseProxy $false

if (-not $NoBackendEnv) {
    $backendDir = Join-Path $root "admin/backend"
    $backendEnv = Join-Path $backendDir ".env"
    $backendExample = Join-Path $backendDir ".env.example"

    if (-not (Test-Path $backendEnv) -and (Test-Path $backendExample)) {
        Copy-Item -Path $backendExample -Destination $backendEnv
    }

    Set-EnvValue -Path $backendEnv -Key "APP_URL" -Value $backendUrl
    Set-EnvValue -Path $backendEnv -Key "FRONTEND_URL" -Value $adminOrigin
    Set-EnvValue -Path $backendEnv -Key "SANCTUM_STATEFUL_DOMAINS" -Value $statefulDomains
    Set-EnvValue -Path $backendEnv -Key "SESSION_DOMAIN" -Value "null"

    if (-not $NoCacheClear) {
        $php = Get-Command php -ErrorAction SilentlyContinue
        if ($php) {
            Push-Location $backendDir
            try {
                php artisan optimize:clear
            } finally {
                Pop-Location
            }
        } else {
            Write-Warning "PHP was not found in PATH. Run 'php artisan optimize:clear' inside admin/backend after PHP is available."
        }
    }
}

Write-Host ""
Write-Host "Windows development environment configured."
Write-Host "Host: $HostName"
Write-Host "Admin origin: $adminOrigin"
Write-Host "VADMIN API: $apiBaseUrl"
if ($UseViteProxy) {
    Write-Host "Vite API proxy: /api -> $ApiProxyTarget"
}
Write-Host ""
Write-Host "Rebuild or restart the admin frontend so Vite loads the updated environment."
