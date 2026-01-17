import os
import urllib.parse

def generate_gallery(root_dir):
    print(f"Generating gallery for: {root_dir}")
    
    students = []
    
    # 1. Scan for student folders
    # We assume any folder starting with a number or just being a folder in root is a student
    # But let's be more specific: any folder that has subfolders with index.html
    
    try:
        items = sorted(os.listdir(root_dir))
    except Exception as e:
        print(f"Error listing directory: {e}")
        return

    for item in items:
        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path) and not item.startswith('.'):
            # Check for sketches inside
            sketches = []
            try:
                subitems = sorted(os.listdir(item_path))
                for sub in subitems:
                    sub_path = os.path.join(item_path, sub)
                    if os.path.isdir(sub_path):
                        if "index.html" in os.listdir(sub_path):
                            sketches.append(sub)
            except Exception as e:
                print(f"Error scanning {item}: {e}")
                continue

            if sketches:
                students.append({
                    "name": item,
                    "sketches": sketches
                })
    
    # 2. Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketches Gallery</title>
    <style>
        :root {{
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-color: #e0e0e0;
            --accent-color: #bb86fc;
            --hover-color: #3700b3;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }}

        body {{
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: var(--font-family);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }}

        header {{
            text-align: center;
            padding: 40px 0;
            margin-bottom: 20px;
            border-bottom: 1px solid #333;
        }}

        h1 {{
            font-size: 2.5rem;
            margin: 0;
            color: var(--accent-color);
        }}
        
        h2 {{
            border-left: 5px solid var(--accent-color);
            padding-left: 15px;
            margin-top: 40px;
            margin-bottom: 20px;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 2px;
        }}

        .student-section {{
            margin-bottom: 60px;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }}

        .card {{
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 150px;
            border: 1px solid #333;
        }}

        .card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            border-color: var(--accent-color);
            background-color: #252525;
        }}

        .card-title {{
            text-align: center;
            font-weight: bold;
            font-size: 1.1rem;
        }}
        
        .card-icon {{
            font-size: 2rem;
            margin-bottom: 15px;
            color: #777;
        }}
        
        .card:hover .card-icon {{
            color: var(--accent-color);
        }}

        footer {{
            text-align: center;
            margin-top: 80px;
            color: #777;
            font-size: 0.9rem;
        }}
    </style>
</head>
<body>

<header>
    <h1>Student Sketches Gallery</h1>
    <p>Collection of P5.js Projects</p>
</header>

<main>
"""

    for student in students:
        # Clean up student name for display (remove number prefix if desired, but maybe keep it for sorting)
        display_name = student['name'].replace('_', ' ')
        
        html_content += f"""
    <section class="student-section">
        <h2>{display_name}</h2>
        <div class="grid">
"""
        for sketch in student['sketches']:
            # Create a link relative to root
            # root/student_folder/sketch_folder/index.html
            link = f"{student['name']}/{sketch}/index.html"
            # Encode link properly
            # link = urllib.parse.quote(link) # Be careful not to encode slash
            
            # Simple card
            display_sketch = sketch.replace('_', ' ').replace('-', ' ')
            
            html_content += f"""
            <a href="{link}" target="_blank" class="card">
                <div class="card-icon">🎨</div>
                <div class="card-title">{display_sketch}</div>
            </a>
"""
        html_content += """
        </div>
    </section>
"""

    html_content += """
</main>

<footer>
    Generated by Antigravity Agent
</footer>

</body>
</html>
"""

    output_path = os.path.join(root_dir, "index.html")
    with open(output_path, "w") as f:
        f.write(html_content)
    
    print(f"Gallery generated at: {output_path}")

if __name__ == "__main__":
    current_dir = os.getcwd() 
    generate_gallery(current_dir)
