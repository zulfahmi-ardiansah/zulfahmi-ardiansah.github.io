"""Refresh the crawlable HTML snapshots from the portfolio JSON files."""

from datetime import date
from html import escape
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"


def rows(name):
    return json.loads((ROOT / "data" / f"{name}.json").read_text(encoding="utf-8"))


def safe(value):
    return escape(str(value), quote=True)


def render_experience(items):
    return "\n".join(
        f'<article class="experience-item"><span class="experience-period">{safe(item["period"])}</span>'
        f'<div><h4>{safe(item["company"])} ({safe(item["region"])})</h4>'
        f'<p>{safe(item["role"])}</p></div></article>'
        for item in items
    )


def render_certifications(items):
    months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
    cards = []
    for item in items:
        issued = date.fromisoformat(f'{item["date"]}-01')
        label = f"{months[issued.month - 1]} {issued.year}"
        cards.append(
            f'<article class="experience-item"><time class="experience-period" datetime="{safe(item["date"])}">'
            f'{label}</time><div><h4>{safe(item["name"])}</h4>'
            f'<p>{safe(item["institution"])}</p></div></article>'
        )
    return "\n".join(cards)


def render_skillset(items):
    cards = []
    for index, item in enumerate(items, 1):
        skills = "".join(f"<li>{safe(skill)}</li>" for skill in item.get("skills", []))
        tools = "".join(
            f'<li><img src="./image/{safe(tool)}.svg" alt="" loading="lazy">'
            f'<span>{safe(tool.replace("-", " "))}</span></li>'
            for tool in item.get("sets", [])
        )
        cards.append(
            f'<article class="skill-card" id="skill-{safe(item["title"].lower())}">'
            f'<div class="skill-top"><span class="skill-index">{index:02}</span>'
            f'<img src="./image/{safe(item["icon"])}.svg" alt="" loading="lazy"></div>'
            f'<h3>{safe(item["title"])}</h3><p class="skill-tagline">{safe(item["description"])}</p>'
            f'<p class="skill-summary">{safe(item["summary"])}</p>'
            f'<ul class="skill-roles">{skills}</ul><p class="stack-label">TOOLS I USE</p>'
            f'<ul class="tool-list">{tools}</ul></article>'
        )
    return "\n".join(cards)


def render_tools(items):
    return "\n".join(
        f'<a class="tool-item" href="{safe(item["link"])}" target="_blank" rel="noopener noreferrer">'
        f'<span class="tool-number">{index:02}</span><h3>{safe(item["title"])}</h3>'
        f'<p>{safe(item["description"])}</p>'
        '<span class="tool-action">View on GitHub <span aria-hidden="true">↗</span></span></a>'
        for index, item in enumerate(items, 1)
    )


def render_blog(items):
    return "\n".join(
        f'<a class="blog-item" href="{safe(item["link"])}" target="_blank" rel="noopener noreferrer">'
        f'<span class="blog-number">{index:02}</span><span class="blog-source">{safe(item["source"])}</span>'
        f'<h3>{safe(item["title"])}</h3><span class="blog-action"><span>Read on {safe(item["source"])}</span>'
        '<span aria-hidden="true">↗</span></span></a>'
        for index, item in enumerate(items, 1)
    )


def render_setup(items):
    return "\n".join(
        f'<div class="gear-column"><h3>{safe(group["category"])}</h3><ul>'
        + "".join(
            f'<li><strong>{safe(item["name"])}</strong><span>{safe(item["description"])}</span></li>'
            for item in group.get("items", [])
        )
        + "</ul></div>"
        for group in items
    )


def replace_block(source, name, content):
    start_marker = f"<!-- static:{name}:start -->"
    end_marker = f"<!-- static:{name}:end -->"
    start = source.index(start_marker) + len(start_marker)
    end = source.index(end_marker, start)
    line_start = source.rfind("\n", 0, start) + 1
    indent = source[line_start:start - len(start_marker)]
    body = "\n".join(indent + line for line in content.splitlines())
    return source[:start] + "\n" + body + "\n" + indent + source[end:]


def main():
    source = INDEX.read_text(encoding="utf-8")
    blocks = {
        "experience": render_experience(rows("experiences")),
        "certifications": render_certifications(rows("certifications")),
        "skillset": render_skillset(rows("skillsets")),
        "tools": render_tools(rows("tools")),
        "blog": render_blog(rows("blogs")),
        "setup": render_setup(rows("setup")),
    }
    for name, content in blocks.items():
        source = replace_block(source, name, content)
    INDEX.write_text(source, encoding="utf-8")


if __name__ == "__main__":
    main()
