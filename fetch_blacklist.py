import kagglehub
import os
import json

def fetch_datasets():
    print("Downloading RockYou list...")
    rockyou_path = kagglehub.dataset_download("wjburns/common-password-list-rockyoutxt")
    
    print("Downloading Top 200 list...")
    top200_path = kagglehub.dataset_download("prasertk/top-200-passwords-by-country-2021")
    
    results = {
        "rockyou": rockyou_path,
        "top200": top200_path
    }
    
    # Write paths to a temp file for Node.js to read
    with open('dataset_paths.json', 'w') as f:
        json.dump(results, f)
        
    print(json.dumps(results))

if __name__ == "__main__":
    fetch_datasets()
