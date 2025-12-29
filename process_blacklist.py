import json
import os
import glob
import chardet

BLACKLIST_OUTPUT = 'src/data/blacklist.json'
MAX_ROCKYOU_LINES = 100000

def load_json_paths():
    with open('dataset_paths.json', 'r') as f:
        return json.load(f)

def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        return chardet.detect(f.read(10000))['encoding']

def safe_read_lines(file_path, limit=None):
    lines = set()
    try:
        # Try utf-8 first
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f):
                if limit and i >= limit:
                    break
                pwd = line.strip()
                if pwd:
                    lines.add(pwd)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return lines

def process():
    paths = load_json_paths()
    final_set = set()

    # 1. Load existing blacklist to preserve manual entries
    if os.path.exists(BLACKLIST_OUTPUT):
        with open(BLACKLIST_OUTPUT, 'r', encoding='utf-8') as f:
            existing = json.load(f)
            for p in existing:
                final_set.add(p)
    
    print(f"Initial blacklist size: {len(final_set)}")

    # 2. Process RockYou
    rockyou_dir = paths['rockyou']
    rockyou_file = os.path.join(rockyou_dir, 'rockyou.txt')
    if os.path.exists(rockyou_file):
        print(f"Processing RockYou (Top {MAX_ROCKYOU_LINES})...")
        rockyou_passwords = safe_read_lines(rockyou_file, MAX_ROCKYOU_LINES)
        final_set.update(rockyou_passwords)
        print(f"Added {len(rockyou_passwords)} from RockYou.")

    # 3. Process Top 200
    top200_dir = paths['top200']
    # Find the csv/txt file
    top200_files = glob.glob(os.path.join(top200_dir, "*"))
    for file_path in top200_files:
        if os.path.isfile(file_path):
            print(f"Processing {os.path.basename(file_path)}...")
            # CSV usually has headers or columns. Assuming raw lines or reading CSV.
            # If CSV, we might need pandas or split. 
            # Looking at dataset name "top-200-passwords-by-country-2021", it likely has columns "Country", "Password", etc.
            # Simple approach: Read file as text, check if line looks like a password.
            # Or better: Just read it all as potential passwords if it's a simple list.
            # Given user intent, let's treat lines as passwords if simple, or try to split by comma.
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                 for line in f:
                     parts = line.strip().split(',')
                     # Often password is the first or second column. 
                     # Safe bet: add all parts that look like passwords? 
                     # Let's just add the raw line if it has no commas, or split and add unique non-empty parts.
                     for p in parts:
                         p = p.strip().strip('"')
                         if p and len(p) > 3: # Basic filter
                             final_set.add(p)

    # 4. Save
    print(f"Final blacklist size: {len(final_set)}")
    
    sorted_list = sorted(list(final_set))
    with open(BLACKLIST_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(sorted_list, f, indent=4)
    print("Blacklist updated successfully.")

if __name__ == "__main__":
    process()
