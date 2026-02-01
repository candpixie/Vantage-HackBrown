# visa_api_service.py
"""
Visa Merchant Search API Service
Handles interactions with Visa's Merchant Search API v2 to get real merchant data
Endpoint: https://sandbox.api.visa.com/merchantsearch/v2/search
"""
import os
import requests
import json
import hashlib
from typing import Dict, List, Optional, Any
from pathlib import Path

# Visa API Configuration
VISA_API_BASE_URL = os.getenv("VISA_API_BASE_URL", "https://sandbox.api.visa.com")
VISA_API_USER_ID = os.getenv("VISA_API_USER_ID", "")
VISA_API_PASSWORD = os.getenv("VISA_API_PASSWORD", "")
VISA_API_CERT_PATH = os.getenv("VISA_API_CERT_PATH", "")
VISA_API_KEY_PATH = os.getenv("VISA_API_KEY_PATH", "")

# Cache directory for API responses
CACHE_DIR = Path(".cache/visa_api")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_nearby_merchants(
    lat: float,
    lng: float,
    business_type: str,
    radius: int = 1000,
    use_cache: bool = True
) -> Optional[Dict[str, Any]]:
    """
    Get nearby merchants from Visa Merchant Locator API
    
    Args:
        lat: Latitude of the location
        lng: Longitude of the location
        business_type: Type of business (e.g., "restaurant", "coffee shop")
        radius: Search radius in meters (default: 1000m)
        use_cache: Whether to use cached responses (default: True)
    
    Returns:
        Dictionary containing merchant data, or None if API call fails
    """
    # Check cache first
    if use_cache:
        cache_key = f"{lat}_{lng}_{business_type}_{radius}"
        cache_hash = hashlib.md5(cache_key.encode()).hexdigest()
        cache_path = CACHE_DIR / f"{cache_hash}.json"
        
        if cache_path.exists():
            try:
                with open(cache_path, "r") as f:
                    cached_data = json.load(f)
                    print(f"💰 Loading Visa API data from cache: {cache_path}")
                    return cached_data
            except Exception as e:
                print(f"Warning: Could not load cache: {e}")
    
    # Check if API credentials are configured
    if not VISA_API_USER_ID or not VISA_API_PASSWORD:
        print("⚠️  Visa API credentials not configured. Skipping API call.")
        return None
    
    try:
        # Visa Merchant Search API v2 endpoint
        url = f"{VISA_API_BASE_URL}/merchantsearch/v2/search"
        
        # Prepare request headers
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        # Generate proper timestamp for messageDateTime
        from datetime import datetime
        message_datetime = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000")
        
        # Generate unique request ID
        import time
        request_id = f"Vantage_Locator_{int(time.time() * 1000)}"
        
        # Prepare request body matching Visa's exact format
        # Based on official Visa Merchant Search API documentation
        payload = {
            "searchOptions": {
                "matchScore": "false",
                "maxRecords": "10",
                "matchIndicators": "true"
            },
            "header": {
                "startIndex": "0",
                "requestMessageId": request_id,
                "messageDateTime": message_datetime
            },
            "searchAttrList": {
                "distanceUnit": "m",
                "distance": str(int(radius)),
                "merchantCountryCode": 840,
                "latitude": str(lat),
                "longitude": str(lng)
            },
            "responseAttrList": [
                "GNLOCATOR"
            ]
        }
        
        # Make API request with basic authentication
        # Using API Key as username and password for authentication
        print(f"🔑 Making Visa API request to: {url}")
        print(f"📍 Location: ({lat}, {lng}), Radius: {radius}m")
        
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            auth=(VISA_API_USER_ID, VISA_API_PASSWORD),
            timeout=15,
            verify=True  # Verify SSL certificate
        )
        
        print(f"📡 Visa API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Cache the response
            if use_cache:
                try:
                    with open(cache_path, "w") as f:
                        json.dump(data, f, indent=2)
                except Exception as e:
                    print(f"Warning: Could not cache response: {e}")
            
            return parse_visa_response(data, business_type)
        else:
            print(f"⚠️  Visa API returned status {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Visa API request failed: {e}")
        return None
    except Exception as e:
        print(f"⚠️  Error calling Visa API: {e}")
        return None


def parse_visa_response(api_response: Dict, business_type: str) -> Optional[Dict[str, Any]]:
    """
    Parse Visa Merchant Search API v2 response and extract relevant merchant data
    
    Args:
        api_response: Raw response from Visa Merchant Search API v2
        business_type: Type of business to filter merchants
    
    Returns:
        Parsed merchant data dictionary
    """
    try:
        # Extract merchant list from Merchant Search API v2 response
        # Response structure: { "response": { "merchant": [...] } }
        response_data = api_response.get("response", {})
        merchants = response_data.get("merchant", [])
        
        if not merchants:
            print("No merchants found in Visa API response")
            return None
        
        # Filter and process merchants
        relevant_merchants = []
        total_transaction_volume = 0
        merchant_count = 0
        
        for merchant in merchants:
            merchant_info = {
                "name": merchant.get("visaMerchantName", "Unknown"),
                "street_address": merchant.get("visaStoreStreetAddress", ""),
                "city": merchant.get("visaStoreCity", ""),
                "state": merchant.get("visaStoreState", ""),
                "postal_code": merchant.get("visaStorePostalCode", ""),
                "country_code": merchant.get("visaStoreCountryCode", ""),
                "latitude": merchant.get("locationAddressLatitude", ""),
                "longitude": merchant.get("locationAddressLongitude", ""),
                "merchant_category_code": merchant.get("merchantCategoryCode", ""),
                "distance": merchant.get("distance", "")
            }
            relevant_merchants.append(merchant_info)
            merchant_count += 1
            
            # Note: Transaction volume data may not be available in public API
            # This would typically come from Visa's analytics products
        
        print(f"✅ Parsed {merchant_count} merchants from Visa API response")
        
        # Return aggregated data
        return {
            "merchants": relevant_merchants,
            "merchant_count": merchant_count,
            "total_transaction_volume": total_transaction_volume,
            "average_transaction_volume": total_transaction_volume / merchant_count if merchant_count > 0 else 0,
            "data_source": "visa_merchant_search_v2",
            "business_type": business_type
        }
        
    except Exception as e:
        print(f"⚠️  Error parsing Visa API response: {e}")
        return None


def get_merchant_spending_insights(merchant_data: Dict) -> Dict[str, Any]:
    """
    Extract spending insights from merchant data
    
    Args:
        merchant_data: Parsed merchant data from Visa API
    
    Returns:
        Dictionary with spending insights
    """
    if not merchant_data:
        return {}
    
    merchant_count = merchant_data.get("merchant_count", 0)
    avg_volume = merchant_data.get("average_transaction_volume", 0)
    
    # Calculate market activity score (0-100)
    # Higher merchant count and transaction volume = higher activity
    activity_score = min(100, (merchant_count * 10) + (avg_volume / 1000))
    
    return {
        "market_activity_score": int(activity_score),
        "merchant_density": merchant_count,
        "estimated_monthly_spending": avg_volume * merchant_count if avg_volume > 0 else 0,
        "market_maturity": "high" if merchant_count >= 5 else "medium" if merchant_count >= 2 else "low"
    }
