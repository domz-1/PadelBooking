#!/bin/bash

echo "Testing API endpoints..."

# Test sponsors endpoint
echo "Testing sponsors endpoint..."
curl -X GET "http://localhost:4000/api/sponsors" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/sponsors")"

echo ""
echo "Testing branding config endpoint..."
curl -X GET "http://localhost:4000/api/settings/config" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/settings/config")"

echo ""
echo "Testing venues endpoint..."
curl -X GET "http://localhost:4000/api/venues" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/venues")"

echo ""
echo "Testing bookings endpoint..."
curl -X GET "http://localhost:4000/api/bookings" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response: $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/bookings")"

echo ""
echo "Test completed!"