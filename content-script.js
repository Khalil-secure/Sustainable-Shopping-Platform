function scrapeProductData() {
  // Try multiple selectors for robustness
  const title =
    document.getElementById("productTitle")?.innerText.trim() ||
    document.querySelector("h1")?.innerText.trim() ||
    "";

  const price =
    document.getElementById("priceblock_ourprice")?.innerText.trim() ||
    document.getElementById("priceblock_dealprice")?.innerText.trim() ||
    document.querySelector(".price")?.innerText.trim() ||
    "";

  const rating =
    document.querySelector(".a-icon-alt")?.innerText.trim() ||
    document.querySelector(".review-rating")?.innerText.trim() ||
    "";

  const reviews =
    document.getElementById("acrCustomerReviewText")?.innerText.trim() ||
    document.querySelector(".review-count")?.innerText.trim() ||
    "";

  // Extract materials from details table
  const detailsTable = document.getElementById("productDetails_techSpec_section_1");
  let materials = "";
  if (detailsTable) {
    materials = Array.from(detailsTable.querySelectorAll("td"))
      .map(td => td.innerText.trim())
      .join(", ");
  }

  // Try to extract eco-labels or sustainability badges
  let ecoLabels = "";
  const badge = document.querySelector(".eco-label, .sustainability-badge");
  if (badge) {
    ecoLabels = badge.innerText.trim();
  }

  const productData = {
    title,
    price,
    rating,
    reviews,
    materials,
    ecoLabels,
    url: window.location.href
  };

  console.log("✅ Scraped product data:", productData);

  // Send to AWS Lambda (replace with your actual endpoint)
  fetch("https://your-api-gateway-url.amazonaws.com/prod/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData)
  })
    .then(res => res.json())
    .then(data => console.log("📡 Lambda response:", data))
    .catch(err => console.error("❌ Error sending to Lambda:", err));
}

scrapeProductData();
