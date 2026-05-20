param(
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    [string]$BackendDsn,
    [string]$AdminDsn,
    [string]$WebDsn,
    [ValidateRange(0, 1)]
    [double]$TracesSampleRate = 0,
    [switch]$ConfigureSourceMaps,
    [string]$SentryOrg,
    [string]$AdminSentryProject = "nolita-admin",
    [string]$WebSentryProject = "nolita-web",
    [string]$SentryAuthToken,
    [switch]$NoPrompt,
    [switch]$NoBackendCacheClear
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
    param(
        [string]$Path,
        [string]$Key
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    $pattern = "^\s*$([regex]::Escape($Key))=(.*)$"
    foreach ($line in Get-Content -Path $Path -ErrorAction SilentlyContinue) {
        if ($line -match $pattern) {
            return $matches[1].Trim().Trim('"')
        }
    }

    return $null
}

function Set-EnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [AllowNull()]
        [string]$Value
    )

    if ($null -eq $Value) {
        $Value = ""
    }

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

function Protect-EnvValue {
    param([string]$Value)

    if (-not $Value) {
        return ""
    }

    if ($Value -match "\s") {
        return '"' + ($Value -replace '"', '\"') + '"'
    }

    return $Value
}

function Read-PlainValue {
    param(
        [string]$Label,
        [string]$CurrentValue
    )

    if ($NoPrompt) {
        return $CurrentValue
    }

    $suffix = if ($CurrentValue) { " [keep current]" } else { "" }
    $value = Read-Host "$Label$suffix"

    if ([string]::IsNullOrWhiteSpace($value)) {
        return $CurrentValue
    }

    return $value.Trim()
}

function Read-SecretValue {
    param(
        [string]$Label,
        [string]$CurrentValue
    )

    if ($NoPrompt) {
        return $CurrentValue
    }

    $suffix = if ($CurrentValue) { " [keep current]" } else { "" }
    $secure = Read-Host "$Label$suffix" -AsSecureString

    if ($secure.Length -eq 0) {
        return $CurrentValue
    }

    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Read-ChoiceValue {
    param(
        [string]$Label,
        [string[]]$Choices,
        [string]$DefaultValue
    )

    if ($NoPrompt) {
        return $DefaultValue
    }

    Write-Host $Label
    for ($index = 0; $index -lt $Choices.Count; $index++) {
        $number = $index + 1
        $choice = $Choices[$index]
        $defaultMarker = if ($choice -eq $DefaultValue) { " (default)" } else { "" }
        Write-Host "  $number. $choice$defaultMarker"
    }

    $answer = Read-Host "Choose an option"
    if ([string]::IsNullOrWhiteSpace($answer)) {
        return $DefaultValue
    }

    $selected = 0
    if ([int]::TryParse($answer, [ref]$selected)) {
        if ($selected -ge 1 -and $selected -le $Choices.Count) {
            return $Choices[$selected - 1]
        }
    }

    if ($Choices -contains $answer) {
        return $answer
    }

    Write-Warning "Invalid option '$answer'. Using default: $DefaultValue"
    return $DefaultValue
}

function Read-YesNo {
    param(
        [string]$Label,
        [bool]$DefaultValue = $false
    )

    if ($NoPrompt) {
        return $DefaultValue
    }

    $suffix = if ($DefaultValue) { "Y/n" } else { "y/N" }
    $answer = Read-Host "$Label [$suffix]"

    if ([string]::IsNullOrWhiteSpace($answer)) {
        return $DefaultValue
    }

    return $answer.Trim().ToLowerInvariant().StartsWith("y")
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $Environment) {
    $Environment = Read-ChoiceValue -Label "Select Sentry environment" -Choices @("development", "staging", "production") -DefaultValue "development"
}

if (-not $ConfigureSourceMaps.IsPresent) {
    $ConfigureSourceMaps = Read-YesNo -Label "Configure source map upload values? Usually no for local development." -DefaultValue $false
}

$backendEnv = Join-Path $root "admin/backend/.env"
$backendExample = Join-Path $root "admin/backend/.env.example"
$adminEnvLocal = Join-Path $root "admin/frontend/.env.local"
$webEnvLocal = Join-Path $root "web/.env.local"

if (-not (Test-Path $backendEnv) -and (Test-Path $backendExample)) {
    Copy-Item -Path $backendExample -Destination $backendEnv
}

if (-not $BackendDsn) {
    $BackendDsn = Get-EnvValue -Path $backendEnv -Key "SENTRY_LARAVEL_DSN"
}
if (-not $AdminDsn) {
    $AdminDsn = Get-EnvValue -Path $adminEnvLocal -Key "VITE_SENTRY_DSN"
}
if (-not $WebDsn) {
    $WebDsn = Get-EnvValue -Path $webEnvLocal -Key "NEXT_PUBLIC_SENTRY_DSN"
}

$BackendDsn = Read-PlainValue -Label "Laravel backend DSN (nolita-backend)" -CurrentValue $BackendDsn
$AdminDsn = Read-PlainValue -Label "React admin DSN (nolita-admin)" -CurrentValue $AdminDsn
$WebDsn = Read-PlainValue -Label "Next storefront DSN (nolita-web)" -CurrentValue $WebDsn

Set-EnvValue -Path $backendEnv -Key "SENTRY_LARAVEL_DSN" -Value (Protect-EnvValue $BackendDsn)
Set-EnvValue -Path $backendEnv -Key "SENTRY_ENVIRONMENT" -Value $Environment
Set-EnvValue -Path $backendEnv -Key "SENTRY_TRACES_SAMPLE_RATE" -Value $TracesSampleRate.ToString([Globalization.CultureInfo]::InvariantCulture)
Set-EnvValue -Path $backendEnv -Key "SENTRY_SEND_DEFAULT_PII" -Value "false"

Set-EnvValue -Path $adminEnvLocal -Key "VITE_SENTRY_DSN" -Value (Protect-EnvValue $AdminDsn)
Set-EnvValue -Path $adminEnvLocal -Key "VITE_SENTRY_ENVIRONMENT" -Value $Environment
Set-EnvValue -Path $adminEnvLocal -Key "VITE_SENTRY_TRACES_SAMPLE_RATE" -Value $TracesSampleRate.ToString([Globalization.CultureInfo]::InvariantCulture)

Set-EnvValue -Path $webEnvLocal -Key "NEXT_PUBLIC_SENTRY_DSN" -Value (Protect-EnvValue $WebDsn)
Set-EnvValue -Path $webEnvLocal -Key "SENTRY_ENVIRONMENT" -Value $Environment
Set-EnvValue -Path $webEnvLocal -Key "SENTRY_TRACES_SAMPLE_RATE" -Value $TracesSampleRate.ToString([Globalization.CultureInfo]::InvariantCulture)

if ($ConfigureSourceMaps) {
    if (-not $SentryOrg) {
        $SentryOrg = Read-PlainValue -Label "Sentry org slug" -CurrentValue (Get-EnvValue -Path $webEnvLocal -Key "SENTRY_ORG")
    }
    if (-not $SentryAuthToken) {
        $SentryAuthToken = Read-SecretValue -Label "Sentry auth token for source map uploads" -CurrentValue (Get-EnvValue -Path $webEnvLocal -Key "SENTRY_AUTH_TOKEN")
    }

    Set-EnvValue -Path $adminEnvLocal -Key "SENTRY_ORG" -Value $SentryOrg
    Set-EnvValue -Path $adminEnvLocal -Key "SENTRY_PROJECT" -Value $AdminSentryProject
    Set-EnvValue -Path $adminEnvLocal -Key "SENTRY_AUTH_TOKEN" -Value (Protect-EnvValue $SentryAuthToken)

    Set-EnvValue -Path $webEnvLocal -Key "SENTRY_ORG" -Value $SentryOrg
    Set-EnvValue -Path $webEnvLocal -Key "SENTRY_PROJECT" -Value $WebSentryProject
    Set-EnvValue -Path $webEnvLocal -Key "SENTRY_AUTH_TOKEN" -Value (Protect-EnvValue $SentryAuthToken)
}

if (-not $NoBackendCacheClear) {
    $php = Get-Command php -ErrorAction SilentlyContinue
    if ($php) {
        Push-Location (Join-Path $root "admin/backend")
        try {
            php artisan config:clear
        } finally {
            Pop-Location
        }
    } else {
        Write-Warning "PHP was not found in PATH. Run 'php artisan config:clear' inside admin/backend after PHP is available."
    }
}

Write-Host ""
Write-Host "Sentry environment configured."
Write-Host "Environment: $Environment"
Write-Host "Backend env: admin/backend/.env"
Write-Host "Admin env: admin/frontend/.env.local"
Write-Host "Storefront env: web/.env.local"
Write-Host ""
Write-Host "Restart the admin frontend and storefront dev servers so they load the updated environment."
Write-Host "Use 'php artisan sentry:test' inside admin/backend to test the backend event pipeline."
