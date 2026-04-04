import os
import glob

bat_files = glob.glob("**/*.bat", recursive=True)
for f in bat_files:
    try:
        os.remove(f)
        print(f"Deleted {f}")
    except Exception as e:
        print(f"Failed to delete {f}: {e}")
