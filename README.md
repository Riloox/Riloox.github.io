# riloox.github.io

Personal site of Federico Prunell. Plain HTML, one small stylesheet, no build
step and no JavaScript framework.

Live at <https://riloox.github.io/>.

## Structure

```
index.html                     home: intro, work, smaller things, contact
projects/hostkind.html         Hostkind write-up and demo video
projects/ene.html              Ene write-up and model results
projects/ajfit.html            AJFit write-up and demo film
projects/riloox-pipeline.html  Video pipeline write-up
writing/index.html             writing index
writing/gemma-spanish-tutor.html  the Ene fine-tune write-up
assets/                        demo film, screenshots, CV images, favicon
cv.pdf, cv-es.pdf              CV in English and Spanish
style.css                      the only stylesheet
sitemap.xml, robots.txt        indexing
```

## Preview locally

```sh
python3 -m http.server 8080
```

Then open <http://localhost:8080/>. Opening the files directly with `file://`
also works, but the server is closer to how GitHub Pages serves them.

## Deploy

GitHub Pages currently publishes this repository, but from the old `gh-pages`
build. The static site can go live in either of these ways:

1. Without merging (fastest): repo Settings, Pages, Source "Deploy from a
   branch", branch `web1`, folder `/ (root)`, then Save. GitHub serves the
   branch root directly and `.nojekyll` keeps it from running Jekyll. The URL
   stays <https://riloox.github.io/>.
2. After merging `web1` into `main`: Settings, Pages, branch `main`, folder
   `/ (root)`. The old Vite workflow was removed on this branch, so there is
   nothing to build.

`.github/workflows/deploy-static.yml` is an alternative that publishes the
repository root as an Actions artifact. `workflow_dispatch` only becomes
available once the file exists on the default branch, so it is useful after the
merge, not before.

Do not force-push `main`. If the branch is pushed but not deployed, the site
keeps serving the old build until the Pages source changes.

## Adding a page

Create the HTML file, copy the `<head>` block and nav from a sibling page, keep
the relative paths correct for the folder depth, and add the URL to
`sitemap.xml`. No build, no manifest.
