import pandas as pd
from urllib.parse import urlparse
import re

def extract_url_features(df):
    url_features = []
    for url in df['URL']:
        url_info = {}
        
        # URL length
        url_info['url_length'] = len(url)
        
        # HTTPS usage
        url_info['uses_https'] = 1 if url.lower().startswith("https://") else 0
        
        # Number of subdomains
        subdomains = url.split(".")
        if len(subdomains) > 2:
            url_info['num_subdomains'] = len(subdomains) - 2  # Subdomains count before domain and TLD
        else:
            url_info['num_subdomains'] = 0
        
        url_features.append(url_info)
    
    return pd.DataFrame(url_features)

#website_df = pd.read_csv('data/raw/websites/phishing_site_urls.csv')
#website_df = extract_url_features(website_df)
#website_df.to_csv('data/processed/websites_with_features.csv', index=False)