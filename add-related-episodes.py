#!/usr/bin/env python3
import os
import re

BASE_DIR = "/Users/abrett76/github/podcast-doctrineofdiscovery-v2/_posts"

EPISODES = {
    "Season2/2023-06-26-episode-01.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-02/", "https://podcast.doctrineofdiscovery.org/season2/episode-03/", "https://podcast.doctrineofdiscovery.org/season1/episode-01/"],
    "Season2/2023-07-05-episode-02.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-01/", "https://podcast.doctrineofdiscovery.org/season2/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-06/"],
    "Season2/2023-07-13-episode-03.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-01/", "https://podcast.doctrineofdiscovery.org/season2/episode-02/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/"],
    "Season2/2023-07-18-episode-04.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-05/", "https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season3/episode-04/"],
    "Season2/2023-07-25-episode-05.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-04/", "https://podcast.doctrineofdiscovery.org/special/episode-01/", "https://podcast.doctrineofdiscovery.org/season3/episode-01/"],
    "Season2/2023-08-02-episode-06.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-07/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/", "https://podcast.doctrineofdiscovery.org/season5/episode-03/"],
    "Season2/2023-08-10-episode-07.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-08/", "https://podcast.doctrineofdiscovery.org/season2/episode-05/", "https://podcast.doctrineofdiscovery.org/season5/episode-06/"],
    "Season2/2023-08-11-episode-08.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-07/", "https://podcast.doctrineofdiscovery.org/season5/episode-06/", "https://podcast.doctrineofdiscovery.org/season3/episode-01/"],
    "Season3/2023-10-25-episode-01.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-02/", "https://podcast.doctrineofdiscovery.org/special/episode-02/", "https://podcast.doctrineofdiscovery.org/season2/episode-05/"],
    "Season3/2023-11-07-episode-02.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-01/", "https://podcast.doctrineofdiscovery.org/season5/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-02/"],
    "Season3/2023-11-15-episode-03.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-03/", "https://podcast.doctrineofdiscovery.org/special/episode-06/", "https://podcast.doctrineofdiscovery.org/season5/episode-07/"],
    "Season3/2023-12-04-episode-04.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-05/", "https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-03/"],
    "Season3/2023-12-06-episode-05.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-03/", "https://podcast.doctrineofdiscovery.org/season5/episode-05/", "https://podcast.doctrineofdiscovery.org/season3/episode-03/"],
    "Season3/2023-12-07-episode-06.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-06/", "https://podcast.doctrineofdiscovery.org/special/episode-06/"],
    "Season4/2024-02-03-episode-01.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-01/", "https://podcast.doctrineofdiscovery.org/season4/episode-02/", "https://podcast.doctrineofdiscovery.org/special/episode-05/"],
    "Season4/2024-04-09-episode-02.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-01/", "https://podcast.doctrineofdiscovery.org/season4/episode-04/", "https://podcast.doctrineofdiscovery.org/season5/episode-02/"],
    "Season4/2024-04-17-episode-03.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season3/episode-05/", "https://podcast.doctrineofdiscovery.org/season5/episode-05/"],
    "Season4/2024-04-22-episode-04.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-06/", "https://podcast.doctrineofdiscovery.org/season5/episode-02/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/"],
    "Season4/2024-05-07-episode-05.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-04/", "https://podcast.doctrineofdiscovery.org/season5/episode-06/", "https://podcast.doctrineofdiscovery.org/season3/episode-03/"],
    "Season4/2024-05-16-episode-06.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-02/", "https://podcast.doctrineofdiscovery.org/special/episode-07/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/"],
    "Season5/2024-08-26-episode-01.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-01/", "https://podcast.doctrineofdiscovery.org/season5/episode-02/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/"],
    "Season5/2024-09-02-episode-02.md": ["https://podcast.doctrineofdiscovery.org/season5/episode-01/", "https://podcast.doctrineofdiscovery.org/season3/episode-01/", "https://podcast.doctrineofdiscovery.org/season4/episode-02/"],
    "Season5/2024-11-12-episode-03.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-02/", "https://podcast.doctrineofdiscovery.org/season5/episode-06/", "https://podcast.doctrineofdiscovery.org/season2/episode-06/"],
    "Season5/2024-11-14-episode-04.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-01/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/", "https://podcast.doctrineofdiscovery.org/season5/episode-05/"],
    "Season5/2025-01-17-episode-05.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-05/", "https://podcast.doctrineofdiscovery.org/season4/episode-03/", "https://podcast.doctrineofdiscovery.org/season5/episode-04/"],
    "Season5/2025-02-01-episode-06.md": ["https://podcast.doctrineofdiscovery.org/season5/episode-07/", "https://podcast.doctrineofdiscovery.org/season2/episode-07/", "https://podcast.doctrineofdiscovery.org/season4/episode-05/"],
    "Season5/2025-03-25-episode-07.md": ["https://podcast.doctrineofdiscovery.org/season5/episode-06/", "https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-03/"],
    "Season5/2025-05-19-episode-08.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-02/", "https://podcast.doctrineofdiscovery.org/season3/episode-01/", "https://podcast.doctrineofdiscovery.org/season2/episode-05/"],
    "special/2024-02-20-s01.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-05/", "https://podcast.doctrineofdiscovery.org/special/episode-02/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/"],
    "special/2024-02-20-s02.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-01/", "https://podcast.doctrineofdiscovery.org/special/episode-01/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/"],
    "special/2024-02-20-s03.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-02/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/", "https://podcast.doctrineofdiscovery.org/season2/episode-03/"],
    "special/2024-02-20-s04.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-06/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/", "https://podcast.doctrineofdiscovery.org/special/episode-07/"],
    "special/2024-02-20-s05.md": ["https://podcast.doctrineofdiscovery.org/season1/episode-02/", "https://podcast.doctrineofdiscovery.org/season4/episode-01/", "https://podcast.doctrineofdiscovery.org/special/episode-01/"],
    "special/2024-02-20-s06.md": ["https://podcast.doctrineofdiscovery.org/season3/episode-03/", "https://podcast.doctrineofdiscovery.org/season4/episode-03/", "https://podcast.doctrineofdiscovery.org/season5/episode-07/"],
    "special/2024-02-20-s07.md": ["https://podcast.doctrineofdiscovery.org/season4/episode-06/", "https://podcast.doctrineofdiscovery.org/special/episode-04/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/"],
    "special/2024-02-20-s08.md": ["https://podcast.doctrineofdiscovery.org/season2/episode-06/", "https://podcast.doctrineofdiscovery.org/season5/episode-03/", "https://podcast.doctrineofdiscovery.org/season3/episode-02/"],
}

for file_path, links in EPISODES.items():
    full_path = os.path.join(BASE_DIR, file_path)
    
    if not os.path.exists(full_path):
        print(f"❌ File not found: {file_path}")
        continue
    
    # Read file content
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Build related episodes section
    links_md = "\n".join([f"- [{link}]({link})" for link in links])
    related_section = f"### Related Episodes\n{links_md}\n\n"
    
    # Find and replace before Credits section
    # Look for "## Credits" or "### Credits"
    pattern = r'(^## Credits|^### Credits)'
    
    if re.search(pattern, content, re.MULTILINE):
        # Check if Related Episodes already exists
        if "### Related Episodes" not in content:
            new_content = re.sub(pattern, related_section + r'\1', content, flags=re.MULTILINE)
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Updated: {file_path}")
        else:
            print(f"⊘ Already has Related Episodes: {file_path}")
    else:
        print(f"❌ No Credits section found: {file_path}")

print("\nAll done!")
