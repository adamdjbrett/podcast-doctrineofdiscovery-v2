#!/bin/zsh

BASE_DIR="/Users/abrett76/github/podcast-doctrineofdiscovery-v2/_posts"

typeset -A EPISODES

EPISODES[Season2/2023-06-26-episode-01.md]="https://podcast.doctrineofdiscovery.org/season2/episode-02/|https://podcast.doctrineofdiscovery.org/season2/episode-03/|https://podcast.doctrineofdiscovery.org/season1/episode-01/"
EPISODES[Season2/2023-07-05-episode-02.md]="https://podcast.doctrineofdiscovery.org/season2/episode-01/|https://podcast.doctrineofdiscovery.org/season2/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-06/"
EPISODES[Season2/2023-07-13-episode-03.md]="https://podcast.doctrineofdiscovery.org/season2/episode-01/|https://podcast.doctrineofdiscovery.org/season2/episode-02/|https://podcast.doctrineofdiscovery.org/season4/episode-01/"
EPISODES[Season2/2023-07-18-episode-04.md]="https://podcast.doctrineofdiscovery.org/season2/episode-05/|https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season3/episode-04/"
EPISODES[Season2/2023-07-25-episode-05.md]="https://podcast.doctrineofdiscovery.org/season2/episode-04/|https://podcast.doctrineofdiscovery.org/special/episode-01/|https://podcast.doctrineofdiscovery.org/season3/episode-01/"
EPISODES[Season2/2023-08-02-episode-06.md]="https://podcast.doctrineofdiscovery.org/season2/episode-07/|https://podcast.doctrineofdiscovery.org/season3/episode-02/|https://podcast.doctrineofdiscovery.org/season5/episode-03/"
EPISODES[Season2/2023-08-10-episode-07.md]="https://podcast.doctrineofdiscovery.org/season2/episode-08/|https://podcast.doctrineofdiscovery.org/season2/episode-05/|https://podcast.doctrineofdiscovery.org/season5/episode-06/"
EPISODES[Season2/2023-08-11-episode-08.md]="https://podcast.doctrineofdiscovery.org/season2/episode-07/|https://podcast.doctrineofdiscovery.org/season5/episode-06/|https://podcast.doctrineofdiscovery.org/season3/episode-01/"
EPISODES[Season3/2023-10-25-episode-01.md]="https://podcast.doctrineofdiscovery.org/season3/episode-02/|https://podcast.doctrineofdiscovery.org/special/episode-02/|https://podcast.doctrineofdiscovery.org/season2/episode-05/"
EPISODES[Season3/2023-11-07-episode-02.md]="https://podcast.doctrineofdiscovery.org/season3/episode-01/|https://podcast.doctrineofdiscovery.org/season5/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-02/"
EPISODES[Season3/2023-11-15-episode-03.md]="https://podcast.doctrineofdiscovery.org/season4/episode-03/|https://podcast.doctrineofdiscovery.org/special/episode-06/|https://podcast.doctrineofdiscovery.org/season5/episode-07/"
EPISODES[Season3/2023-12-04-episode-04.md]="https://podcast.doctrineofdiscovery.org/season3/episode-05/|https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-03/"
EPISODES[Season3/2023-12-06-episode-05.md]="https://podcast.doctrineofdiscovery.org/season4/episode-03/|https://podcast.doctrineofdiscovery.org/season5/episode-05/|https://podcast.doctrineofdiscovery.org/season3/episode-03/"
EPISODES[Season3/2023-12-07-episode-06.md]="https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-06/|https://podcast.doctrineofdiscovery.org/special/episode-06/"
EPISODES[Season4/2024-02-03-episode-01.md]="https://podcast.doctrineofdiscovery.org/season2/episode-01/|https://podcast.doctrineofdiscovery.org/season4/episode-02/|https://podcast.doctrineofdiscovery.org/special/episode-05/"
EPISODES[Season4/2024-04-09-episode-02.md]="https://podcast.doctrineofdiscovery.org/season3/episode-01/|https://podcast.doctrineofdiscovery.org/season4/episode-04/|https://podcast.doctrineofdiscovery.org/season5/episode-02/"
EPISODES[Season4/2024-04-17-episode-03.md]="https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season3/episode-05/|https://podcast.doctrineofdiscovery.org/season5/episode-05/"
EPISODES[Season4/2024-04-22-episode-04.md]="https://podcast.doctrineofdiscovery.org/season2/episode-06/|https://podcast.doctrineofdiscovery.org/season5/episode-02/|https://podcast.doctrineofdiscovery.org/season3/episode-02/"
EPISODES[Season4/2024-05-07-episode-05.md]="https://podcast.doctrineofdiscovery.org/season4/episode-04/|https://podcast.doctrineofdiscovery.org/season5/episode-06/|https://podcast.doctrineofdiscovery.org/season3/episode-03/"
EPISODES[Season4/2024-05-16-episode-06.md]="https://podcast.doctrineofdiscovery.org/season2/episode-02/|https://podcast.doctrineofdiscovery.org/special/episode-07/|https://podcast.doctrineofdiscovery.org/season3/episode-02/"
EPISODES[Season5/2024-08-26-episode-01.md]="https://podcast.doctrineofdiscovery.org/season2/episode-01/|https://podcast.doctrineofdiscovery.org/season5/episode-02/|https://podcast.doctrineofdiscovery.org/season4/episode-01/"
EPISODES[Season5/2024-09-02-episode-02.md]="https://podcast.doctrineofdiscovery.org/season5/episode-01/|https://podcast.doctrineofdiscovery.org/season3/episode-01/|https://podcast.doctrineofdiscovery.org/season4/episode-02/"
EPISODES[Season5/2024-11-12-episode-03.md]="https://podcast.doctrineofdiscovery.org/season3/episode-02/|https://podcast.doctrineofdiscovery.org/season5/episode-06/|https://podcast.doctrineofdiscovery.org/season2/episode-06/"
EPISODES[Season5/2024-11-14-episode-04.md]="https://podcast.doctrineofdiscovery.org/season2/episode-01/|https://podcast.doctrineofdiscovery.org/season4/episode-01/|https://podcast.doctrineofdiscovery.org/season5/episode-05/"
EPISODES[Season5/2025-01-17-episode-05.md]="https://podcast.doctrineofdiscovery.org/season3/episode-05/|https://podcast.doctrineofdiscovery.org/season4/episode-03/|https://podcast.doctrineofdiscovery.org/season5/episode-04/"
EPISODES[Season5/2025-02-01-episode-06.md]="https://podcast.doctrineofdiscovery.org/season5/episode-07/|https://podcast.doctrineofdiscovery.org/season2/episode-07/|https://podcast.doctrineofdiscovery.org/season4/episode-05/"
EPISODES[Season5/2025-03-25-episode-07.md]="https://podcast.doctrineofdiscovery.org/season5/episode-06/|https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-03/"
EPISODES[Season5/2025-05-19-episode-08.md]="https://podcast.doctrineofdiscovery.org/season4/episode-02/|https://podcast.doctrineofdiscovery.org/season3/episode-01/|https://podcast.doctrineofdiscovery.org/season2/episode-05/"
EPISODES[special/2024-02-20-s01.md]="https://podcast.doctrineofdiscovery.org/season2/episode-05/|https://podcast.doctrineofdiscovery.org/special/episode-02/|https://podcast.doctrineofdiscovery.org/season4/episode-01/"
EPISODES[special/2024-02-20-s02.md]="https://podcast.doctrineofdiscovery.org/season3/episode-01/|https://podcast.doctrineofdiscovery.org/special/episode-01/|https://podcast.doctrineofdiscovery.org/season3/episode-02/"
EPISODES[special/2024-02-20-s03.md]="https://podcast.doctrineofdiscovery.org/season2/episode-02/|https://podcast.doctrineofdiscovery.org/season4/episode-01/|https://podcast.doctrineofdiscovery.org/season2/episode-03/"
EPISODES[special/2024-02-20-s04.md]="https://podcast.doctrineofdiscovery.org/season4/episode-06/|https://podcast.doctrineofdiscovery.org/season3/episode-02/|https://podcast.doctrineofdiscovery.org/special/episode-07/"
EPISODES[special/2024-02-20-s05.md]="https://podcast.doctrineofdiscovery.org/season1/episode-02/|https://podcast.doctrineofdiscovery.org/season4/episode-01/|https://podcast.doctrineofdiscovery.org/special/episode-01/"
EPISODES[special/2024-02-20-s06.md]="https://podcast.doctrineofdiscovery.org/season3/episode-03/|https://podcast.doctrineofdiscovery.org/season4/episode-03/|https://podcast.doctrineofdiscovery.org/season5/episode-07/"
EPISODES[special/2024-02-20-s07.md]="https://podcast.doctrineofdiscovery.org/season4/episode-06/|https://podcast.doctrineofdiscovery.org/special/episode-04/|https://podcast.doctrineofdiscovery.org/season3/episode-02/"
EPISODES[special/2024-02-20-s08.md]="https://podcast.doctrineofdiscovery.org/season2/episode-06/|https://podcast.doctrineofdiscovery.org/season5/episode-03/|https://podcast.doctrineofdiscovery.org/season3/episode-02/"

for file_key in ${(k)EPISODES}; do
  file_path="${file_key}"
  full_path="$BASE_DIR/$file_path"
  links="${EPISODES[$file_key]}"
  
  if [ ! -f "$full_path" ]; then
    echo "❌ File not found: $file_path"
    continue
  fi
  
  # Create related episodes markdown
  related=""
  IFS='|' read -rA link_array <<< "$links"
  for link in "${link_array[@]}"; do
    related+="- [$link]($link)"$'\n'
  done
  related="### Related Episodes"$'\n'"$related"
  
  # Use perl for more reliable cross-platform replacement
  perl -i -pe "s/(^## Credits|^### Credits)/\$related\n\$1/" "$full_path"
  
  echo "✓ Updated: $file_path"
done

echo "All done!"
