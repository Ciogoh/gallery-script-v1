import os
import shutil

# Basic p5.js index.html template
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

# Basic CSS template
CSS_TEMPLATE = """html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
"""

def organize_sketches(root_dir):
    print(f"Scanning directory: {root_dir}")
    
    # Iterate over immediate subdirectories of the root directory
    for item in os.listdir(root_dir):
        item_path = os.path.join(root_dir, item)
        
        if os.path.isdir(item_path):
            print(f"Processing folder: {item}")
            
            # Find all .txt files in this directory
            files = [f for f in os.listdir(item_path) if f.lower().endswith('.txt')]
            
            for filename in files:
                file_path = os.path.join(item_path, filename)
                base_name = os.path.splitext(filename)[0]
                
                # New project directory path
                new_project_dir = os.path.join(item_path, base_name)
                
                # Create the new directory if it exists, handle collision or skip? 
                # User asked to "make a folder for each sketch.js".
                if not os.path.exists(new_project_dir):
                    os.makedirs(new_project_dir)
                    print(f"  Created project folder: {new_project_dir}")
                
                # Paths for new files
                new_sketch_path = os.path.join(new_project_dir, "sketch.js")
                html_path = os.path.join(new_project_dir, "index.html")
                css_path = os.path.join(new_project_dir, "style.css")
                
                # Move and rename the text file to sketch.js
                # Using shutil.move might fail if destination exists, so let's handle that carefully
                if os.path.exists(new_sketch_path):
                     print(f"  WARNING: {new_sketch_path} already exists. Skipping move of {filename}.")
                else:
                    shutil.move(file_path, new_sketch_path)
                    print(f"  Moved {filename} -> {base_name}/sketch.js")

                # Create index.html
                if not os.path.exists(html_path):
                    with open(html_path, "w") as f:
                        f.write(HTML_TEMPLATE)
                    print(f"  Created index.html")
                
                # Create style.css
                if not os.path.exists(css_path):
                    with open(css_path, "w") as f:
                        f.write(CSS_TEMPLATE)
                    print(f"  Created style.css")

if __name__ == "__main__":
    # Use current directory as root, or specific path if needed.
    # We will run this script from inside /Users/samu/Downloads/a2
    current_dir = os.getcwd() 
    organize_sketches(current_dir)
