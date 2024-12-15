import os
import shutil

# Define the new structure
structure = {
    'models': ['best_rf_model (1).pkl', 'best_rf_model.pkl'],
    'data': ['Cleaned_Combined_Clubs_finals.xlsx'],
    'static/css': ['bestrf.css'],
    'static/js': ['script.js'],
    'templates': ['about_us.html', 'contact.html', 'draft.html', 'index.html', 'project.html'],
    'notebooks': ['besttrain.ipynb']
}

# Base directory
base_dir = 'c:/Users/elabi/OneDrive/Desktop/sitewebfullsection_predectionformation-main1'

# Create directories and move files
for folder, files in structure.items():
    # Create the directory if it doesn't exist
    dir_path = os.path.join(base_dir, folder)
    os.makedirs(dir_path, exist_ok=True)
    
    # Move files to the new directory
    for file in files:
        src_path = os.path.join(base_dir, file)
        dst_path = os.path.join(dir_path, file)
        if os.path.exists(src_path):
            shutil.move(src_path, dst_path)

print("Project structure organized successfully.")
