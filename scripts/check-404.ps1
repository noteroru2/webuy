# Check webuy.in.th internal links for 404
$base = "https://webuy.in.th"
$paths = @(
  "/", "/categories", "/locations", "/terms", "/privacy-policy",
  "/categories/notebook", "/categories/camera", "/categories/gaming",
  "/categories/speaker", "/categories/mobile", "/categories/tablet",
  "/services/sell-marshall-speaker-khonkaen",
  "/services/sell-marshall-speaker-free-quotes-khonkaen",
  "/locations/uthithani", "/locations/narathiwat", "/locations/yala",
  "/locations/pattani", "/locations/satoon", "/locations/samutsongkam",
  "/locations/bungkan", "/locations/yasothon",
  "/prices/iphone-17-pro-max-256gb", "/prices/switch-oled", "/prices/ps5-standard",
  "/nonexistent-page", "/categories/fake-cat", "/services/invalid-slug-xyz"
)

$fourOhFour = @()
foreach ($path in $paths) {
  $url = $base + $path
  try {
    $r = Invoke-WebRequest -Uri $url -Method Head -MaximumRedirection 0 -ErrorAction Stop -TimeoutSec 15 -UseBasicParsing
    $status = $r.StatusCode
  } catch {
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
    } else {
      $status = "Error"
    }
  }
  if ($status -eq 404) {
    $fourOhFour += $path
  }
  Write-Output "$path -> $status"
}
Write-Output ""
Write-Output "=== 404 links ==="
$fourOhFour | ForEach-Object { Write-Output $_ }
