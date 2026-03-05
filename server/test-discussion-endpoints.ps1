# Test Discussion System Endpoints
$BASE_URL = "http://localhost:5000/api/discussions"

Write-Host "`n🧪 TESTING DISCUSSION SYSTEM ENDPOINTS`n" -ForegroundColor Cyan
Write-Host "=" * 50

# Test 1: Get Specializations (Static)
Write-Host "`n1️⃣  Testing GET /api/discussions/specializations" -ForegroundColor Yellow
try {
    $specs = Invoke-RestMethod -Uri "$BASE_URL/specializations" -Method Get
    Write-Host "✅ Success: Found $($specs.Count) specializations" -ForegroundColor Green
    Write-Host "   Sample: $($specs[0..2].name -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Degrees (Static)
Write-Host "`n2️⃣  Testing GET /api/discussions/degrees" -ForegroundColor Yellow
try {
    $degrees = Invoke-RestMethod -Uri "$BASE_URL/degrees" -Method Get
    Write-Host "✅ Success: Found $($degrees.Count) degrees" -ForegroundColor Green
    Write-Host "   Sample: $($degrees[0..2].code -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Tags
Write-Host "`n3️⃣  Testing GET /api/discussions/tags" -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "$BASE_URL/tags" -Method Get
    Write-Host "✅ Success: Found $($tags.Count) tags" -ForegroundColor Green
    Write-Host "   Sample: $($tags[0..4].name -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get All Discussions
Write-Host "`n4️⃣  Testing GET /api/discussions (public)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$BASE_URL" -Method Get
    Write-Host "✅ Success: Found $($result.discussions.Count) discussions" -ForegroundColor Green
    Write-Host "   Total: $($result.total), Pages: $($result.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Trending Discussions
Write-Host "`n5️⃣  Testing GET /api/discussions/trending" -ForegroundColor Yellow
try {
    $trending = Invoke-RestMethod -Uri "$BASE_URL/trending" -Method Get
    Write-Host "✅ Success: Found $($trending.Count) trending discussions" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 50)
Write-Host "✅ PUBLIC ENDPOINTS TEST COMPLETE!" -ForegroundColor Green
Write-Host "=" * 50 -NoNewline
Write-Host "`n"
