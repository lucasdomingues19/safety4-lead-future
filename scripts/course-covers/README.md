# Course covers

One template for every course cover (1920x1080, brand indigo + lime, no people).
The hero image for each course (generated with Higgsfield / GPT Image) lives in `images/`;
render with `?c=<key>&bg=images/<file>.jpg` (add `--allow-file-access-from-files`).
Add a course to `COURSES` (and a motif in the script) in `cover.html`, then render:

```bash
"/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --window-size=1280,720 --force-device-scale-factor=1.5 --virtual-time-budget=10000 \
  --screenshot=$PWD/out.png "file://$PWD/cover.html?c=ai"
```

Convert to JPEG, upload to the `course-covers` bucket under `v3/<slug>.jpg`, and set
`courses.cover_image_url` (bump `?v=` when replacing an image).
