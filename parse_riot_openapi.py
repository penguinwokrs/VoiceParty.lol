import json

try:
    with open('riot_openapi.json', 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    print("Error: riot_openapi.json not found")
    exit(1)

paths = data.get('paths', {})
output = {}

for path, methods in paths.items():
    for method, details in methods.items():
        if not isinstance(details, dict):
            continue
        
        # Tag is usually the API name like 'account-v1'
        tags = details.get('tags', ['Uncategorized'])
        if not tags:
            # Fallback to parsing path if no tags
            # e.g. /riot/account/v1/... -> account-v1
            parts = path.strip('/').split('/')
            if len(parts) > 2 and parts[0] == 'riot':
                tag = f"{parts[1]}-{parts[2]}" 
            else:
                tag = 'Uncategorized'
        else:
            tag = tags[0]

        summary = details.get('summary', '') or details.get('description', '')
        # Clean summary of newlines
        summary = summary.replace('\n', ' ')
        
        if tag not in output:
            output[tag] = []
        output[tag].append(f"| {method.upper()} | {path} | {summary} |")

# Sort tags
sorted_tags = sorted(output.keys())

with open('endpoints.md', 'w') as f:
    f.write("# Riot API Endpoints\n\n")
    f.write("> Generated from mingweisamuel/riotapi-schema (OpenAPI 3.0.0)\n\n")
    for tag in sorted_tags:
        f.write(f"## {tag}\n\n")
        f.write("| Method | Path | Summary |\n")
        f.write("| --- | --- | --- |\n")
        # specific sorting if needed, but list order is fine
        for line in sorted(output[tag]):
            f.write(line + "\n")
        f.write("\n")

print(f"Generated endpoints.md with {len(sorted_tags)} API groups.")
