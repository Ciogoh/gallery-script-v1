import os
import shutil
import urllib.parse

# --- Constants ---
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
STUDENTS_DIR = os.path.join(ROOT_DIR, 'students')
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sketch</title>
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>
  </head>
  <body>
    <script src="sketch.js"></script>
  </body>
</html>
"""
CSS_TEMPLATE = """html, body { margin: 0; padding: 0; } canvas { display: block; }"""

# --- Functions ---

def ensure_students_dir():
    if not os.path.exists(STUDENTS_DIR):
        os.makedirs(STUDENTS_DIR)
        print(f"Created students directory at {STUDENTS_DIR}")

def organize_files():
    print("--- 1. Organizing Files ---")
    if not os.path.exists(STUDENTS_DIR):
        print("No 'students' directory found. Skipping organization inside it.")
        return

    # Iterate over student directories
    for student_folder in sorted(os.listdir(STUDENTS_DIR)):
        student_path = os.path.join(STUDENTS_DIR, student_folder)
        
        if not os.path.isdir(student_path) or student_folder.startswith('.'):
            continue
            
        print(f"Checking student: {student_folder}")
        
        # Check for new .txt files or loose files that need organizing
        # We only look for .txt files to convert
        try:
            files = [f for f in os.listdir(student_path) if f.lower().endswith('.txt')]
            for filename in files:
                file_path = os.path.join(student_path, filename)
                base_name = os.path.splitext(filename)[0]
                
                # New project directory
                project_dir = os.path.join(student_path, base_name)
                
                if not os.path.exists(project_dir):
                    os.makedirs(project_dir)
                    print(f"  Created project folder: {base_name}")
                
                # Move/Rename to sketch.js
                target_sketch = os.path.join(project_dir, "sketch.js")
                if not os.path.exists(target_sketch):
                    shutil.move(file_path, target_sketch)
                    print(f"  Moved {filename} -> sketch.js")
                
                # Create boilerplate
                html_path = os.path.join(project_dir, "index.html")
                if not os.path.exists(html_path):
                    with open(html_path, "w") as f: f.write(HTML_TEMPLATE)
                
                css_path = os.path.join(project_dir, "style.css")
                if not os.path.exists(css_path):
                    with open(css_path, "w") as f: f.write(CSS_TEMPLATE)

        except Exception as e:
            print(f"Error processing {student_folder}: {e}")

def generate_gallery():
    print("\n--- 2. Generating Gallery ---")
    students_data = []
    
    if os.path.exists(STUDENTS_DIR):
        try:
            student_folders = sorted(os.listdir(STUDENTS_DIR))
            for folder in student_folders:
                path = os.path.join(STUDENTS_DIR, folder)
                if os.path.isdir(path) and not folder.startswith('.'):
                    # Find valid sketches (subfolders with index.html)
                    sketches = []
                    subitems = sorted(os.listdir(path))
                    for sub in subitems:
                        sub_path = os.path.join(path, sub)
                        if os.path.isdir(sub_path):
                            if "index.html" in os.listdir(sub_path):
                                sketches.append(sub)
                    
                    if sketches:
                        students_data.append({"name": folder, "sketches": sketches})
        except Exception as e:
            print(f"Error scanning directories: {e}")

    # --- HTML Generator ---
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketches Gallery</title>
    <style>
        :root {{ --bg: #121212; --card: #1e1e1e; --text: #e0e0e0; --accent: #bb86fc; }}
        body {{ background: var(--bg); color: var(--text); font-family: sans-serif; margin: 0; padding: 20px; }}
        header {{ text-align: center; padding: 40px 0; border-bottom: 1px solid #333; }}
        h1 {{ color: var(--accent); margin: 0; }}
        h2 {{ border-left: 4px solid var(--accent); padding-left: 15px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }}
        .card {{ background: var(--card); padding: 20px; border-radius: 8px; text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; border: 1px solid #333; transition: 0.2s; }}
        .card:hover {{ transform: translateY(-4px); border-color: var(--accent); background: #252525; }}
        .icon {{ font-size: 1.5rem; margin-bottom: 10px; }}
        .title {{ text-align: center; font-weight: bold; font-size: 0.9rem; }}
        footer {{ text-align: center; margin-top: 60px; color: #666; font-size: 0.8rem; }}
    </style>
</head>
<body>
<header>
    <h1>Student Sketches Gallery</h1>
    <p>Auto-updated Index</p>
</header>
<main>
"""

    for s in students_data:
        disp_name = s['name'].replace('_', ' ')
        html += f"""    <section>
        <h2>{disp_name}</h2>
        <div class="grid">"""
        
        for sketch in s['sketches']:
            # Link is students/STUDENT_NAME/SKETCH_NAME/index.html
            link = f"students/{s['name']}/{sketch}/index.html"
            disp_sketch = sketch.replace('_', ' ').replace('-', ' ')
            html += f"""
            <a href="{link}" target="_blank" class="card">
                <span class="icon">🎨</span>
                <span class="title">{disp_sketch}</span>
            </a>"""
            
        html += "        </div>\n    </section>"

    html += """
</main>
<footer>Generated by Auto-Update Script</footer>
</body>
</html>"""

    output_path = os.path.join(ROOT_DIR, "index.html")
    with open(output_path, "w") as f: f.write(html)
    print(f"Gallery updated: {output_path}")

if __name__ == "__main__":
    ensure_students_dir()
    organize_files()
    generate_gallery()
