# evanesoteric.com

Evan Esoteric's matrix; enter at your own risk.

**[evanesoteric.com](https://evanesoteric.com)**

## Getting Started

This site is built with [Zola](https://www.getzola.org/), a static site generator written in Rust. No Node.js or npm required.

### Prerequisites

Install Zola: https://www.getzola.org/documentation/getting-started/installation/

For example, with Cargo:

```
cargo install zola
```

### Installing

Clone the repository to your local machine:

```
git clone https://github.com/evanesoteric/evanesoteric.com.git
```

Navigate to the project directory:

```
cd evanesoteric.com
```

### Running the Development Server

```
zola serve
```

This starts a local development server at `http://127.0.0.1:1111` with live reload on edits.

### Building for Production

```
zola build
```

The compiled site is output to the `public/` directory.

### Project Structure

- `config.toml` — site configuration
- `content/` — site content (Markdown with front matter)
- `templates/` — Tera templates
  - `templates/partials/` — reusable partials (head, desktop icons, start menu, taskbar)
- `sass/` — Sass stylesheets (compiled by Zola to `main.css`)
- `static/` — static assets served as-is (JS modules, images, robots.txt, gpg.txt)
