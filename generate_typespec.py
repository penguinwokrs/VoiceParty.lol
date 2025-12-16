import json
import os
import re

import urllib.request
import sys

OUTPUT_DIR = 'client/typespec'
SCHEMA_URL = "https://mingweisamuel.github.io/riotapi-schema/openapi-3.0.0.json"
SCHEMA_FILE = "riot_openapi.json"

def download_schema():
    print(f"Downloading schema from {SCHEMA_URL}...")
    try:
        urllib.request.urlretrieve(SCHEMA_URL, SCHEMA_FILE)
        print(f"Schema saved to {SCHEMA_FILE}")
    except Exception as e:
        print(f"Error downloading schema: {e}")
        sys.exit(1)

def to_pascal_case(s):
    # s can be 'account-v1' -> 'AccountV1'
    # 'lol-status-v4' -> 'LolStatusV4'
    parts = re.split(r'[-_]', s)
    return ''.join(p.capitalize() for p in parts)

def clean_model_name(name, namespace_prefix):
    # name: 'account-v1.AccountDto', namespace_prefix: 'account-v1'
    # returns 'AccountDto'
    if name.startswith(namespace_prefix + '.'):
        return name[len(namespace_prefix)+1:]
    return name.replace('.', '_') # Fallback

def map_type(schema, current_namespace_prefix, all_namespaces):
    if '$ref' in schema:
        ref = schema['$ref'].split('/')[-1]
        # ref is like 'account-v1.AccountDto'
        # Determine strict namespace of the ref
        parts = ref.split('.')
        if len(parts) > 1:
            ref_namespace_prefix = parts[0]
            ref_model_name = '.'.join(parts[1:])
            
            # Use the original prefix logic to find the namespace
            # But wait, some prefixes might contain dots? Unlikely in this specific API.
            # actually 'tft-league-v1' has dashes.
            
            # Check if this ref belongs to the current namespace
            if ref.startswith(current_namespace_prefix + '.'):
                return ref[len(current_namespace_prefix)+1:]
            
            # Belongs to another namespace
            # Convert ref_namespace_prefix to PascalCase
            ns_pascal = to_pascal_case(ref_namespace_prefix)
            return f"{ns_pascal}.{ref_model_name}"
            
        return ref

    t = schema.get('type')
    if t == 'integer':
        fmt = schema.get('format')
        if fmt == 'int64':
            return 'int64'
        return 'int32'
    if t == 'string':
        return 'string'
    if t == 'boolean':
        return 'boolean'
    if t == 'number':
        fmt = schema.get('format')
        if fmt == 'double':
            return 'float64'
        return 'float32'
    if t == 'array':
        item_type = map_type(schema.get('items', {}), current_namespace_prefix, all_namespaces)
        return f"{item_type}[]"
    if t == 'object':
        if 'additionalProperties' in schema:
            val_type = map_type(schema['additionalProperties'], current_namespace_prefix, all_namespaces)
            return f"Record<{val_type}>"
        return "Record<unknown>" # Generic object
    
    return 'unknown'

def main():
    if not os.path.exists(SCHEMA_FILE):
        print(f"{SCHEMA_FILE} not found.")
        download_schema()
    
    try:
        with open(SCHEMA_FILE, 'r') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {SCHEMA_FILE}: {e}")
        return

    components = data.get('components', {}).get('schemas', {})
    paths = data.get('paths', {})

    # Group everything by namespace (prefix)
    # Strategy: 
    # 1. Collect all prefixes from schemas (e.g. 'account-v1')
    # 2. Assign schemas to prefixes
    # 3. Assign paths to prefixes (using tags)

    namespaces = {} # 'account-v1': {'models': {}, 'ops': []}
    
    # 1. Schemas
    for name, schema in components.items():
        if '.' in name:
            prefix = name.split('.')[0]
            if prefix not in namespaces:
                namespaces[prefix] = {'models': {}, 'ops': []}
            namespaces[prefix]['models'][name] = schema
        else:
            # Fallback for globals if any
            pass
            
    # 2. Paths
    for path_url, methods in paths.items():
        for method, details in methods.items():
            if not isinstance(details, dict): continue
            
            tags = details.get('tags', [])
            if tags:
                tag = tags[0]
                if tag not in namespaces:
                    namespaces[tag] = {'models': {}, 'ops': []}
                namespaces[tag]['ops'].append({
                    'method': method,
                    'path': path_url,
                    'details': details
                })
    
    all_prefixes = list(namespaces.keys())

    # Generate files
    for prefix, content in namespaces.items():
        ns_name = to_pascal_case(prefix)
        filename = os.path.join(OUTPUT_DIR, f"{prefix}.tsp")
        
        with open(filename, 'w') as f:
            f.write(f"import \"@typespec/http\";\n")
            f.write(f"import \"@typespec/rest\";\n\n")
            f.write(f"using TypeSpec.Http;\n")
            f.write(f"using TypeSpec.Rest;\n\n")
            
            f.write(f"namespace {ns_name};\n\n")
            
            # Models
            for model_full_name, schema in content['models'].items():
                model_name = clean_model_name(model_full_name, prefix)
                
                if schema.get('type') == 'object' or 'properties' in schema:
                    f.write(f"model {model_name} {{\n")
                    required = schema.get('required', [])
                    for prop_name, prop_schema in schema.get('properties', {}).items():
                        # Handle recursive ref directly? 
                        # map_type handles it.
                        prop_type = map_type(prop_schema, prefix, all_prefixes)
                        is_optional = '?' if prop_name not in required else ''
                        
                        # Escape invalid identifiers
                        # Valid: [a-zA-Z_][a-zA-Z0-9_]*
                        if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]*$', prop_name):
                            final_prop_name = f'"{prop_name}"'
                        else:
                            final_prop_name = prop_name
                            
                        f.write(f"  {final_prop_name}{is_optional}: {prop_type};\n")
                    f.write("}\n\n")
                elif 'enum' in schema:
                    # Enum
                    f.write(f"enum {model_name} {{\n")
                    for e in schema['enum']:
                        # if int enum, assignment? TypeSpec enums are strings or backed by int?
                        # Riot API enums usually strings or simple types.
                        # For generated safety, let's treat as string if string type
                        if schema.get('type') == 'string':
                             f.write(f"  {e},\n")
                        else:
                             f.write(f"  Value_{e}: {e},\n")
                    f.write("}\n\n")
                else:
                    # Alias
                     target = map_type(schema, prefix, all_prefixes)
                     f.write(f"alias {model_name} = {target};\n\n")

            # Operations
            if content['ops']:
                f.write(f"interface {ns_name}Service {{\n")
                for op in content['ops']:
                    method = op['method']
                    path = op['path']
                    details = op['details']
                    op_id = details.get('operationId', 'unknown').split('.')[-1]
                    
                    # Parameters
                    params = []
                    # Path/Query params
                    # merging parameters list from path level (not handled here) and op level
                    raw_params = details.get('parameters', [])
                    
                    for p in raw_params:
                        p_name = p['name']
                        p_in = p['in']
                        p_req = p.get('required', False)
                        p_schema = p.get('schema', {})
                        p_type = map_type(p_schema, prefix, all_prefixes)
                        
                        decorators = []
                        if p_in == 'path':
                            decorators.append(f"@path")
                        elif p_in == 'query':
                            decorators.append(f"@query")
                        
                        dec_str = " ".join(decorators)
                        opt_str = "?" if not p_req else ""
                        
                        params.append(f"{dec_str} {p_name}{opt_str}: {p_type}")
                        
                    params_str = ", ".join(params)
                    
                    # Return type
                    return_type = "void"
                    responses = details.get('responses', {})
                    if '200' in responses:
                        # Success
                        content_dict = responses['200'].get('content', {})
                        if 'application/json' in content_dict:
                            schema = content_dict['application/json'].get('schema', {})
                            return_type = map_type(schema, prefix, all_prefixes)
                    
                    # Route decorator
                    f.write(f"  @route(\"{path}\") @{method}\n")
                    f.write(f"  {op_id}({params_str}): {return_type};\n\n")
                
                f.write("}\n")
    
    # Generate main.tsp
    with open(os.path.join(OUTPUT_DIR, 'main.tsp'), 'w') as f:
        f.write("import \"@typespec/http\";\n\n") 
        for prefix in sorted(namespaces.keys()):
            f.write(f"import \"./{prefix}.tsp\";\n")

if __name__ == '__main__':
    main()
