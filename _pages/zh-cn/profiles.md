---
layout: page
permalink: /people/
title: 师友
lang: zh-cn
page_id: people
description: 学术探索与工程实践的同行者。
nav: true
nav_order: 7
---

<style>
  .connections .connection-person {
    padding: 0.85rem 0;
    border-bottom: 1px dashed var(--global-divider-color, currentColor);
  }
  .connections .connection-person:last-child { border-bottom: 0; }
  .connections .connection-person-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
  }
  .connections .connection-name { font-size: 1.1rem; font-weight: 600; color: var(--global-text-color, inherit); }
  .connections .connection-org, .connections .connection-desc { color: var(--global-text-color-light, inherit); }
  .connections .connection-org { font-size: 0.9rem; }
  .connections .connection-desc { font-size: 0.88rem; margin: 0.25rem 0 0; }
  .connections .connection-link { font-size: 0.82rem; margin-left: 0.5rem; }
  .connections .connection-divider {
    margin: 2.5rem 0 2rem;
    border: 0;
    border-top: 1px solid var(--global-divider-color, currentColor);
    opacity: 0.6;
  }
  .connections .site-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
  .connections .tech-card {
    display: block;
    height: 100%;
    padding: 0.9rem 1rem;
    border: 1px solid var(--global-divider-color, currentColor);
    border-radius: 6px;
    color: inherit;
    background: transparent;
    text-decoration: none;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .connections .tech-card:hover, .connections .tech-card:focus-visible {
    border-color: var(--global-theme-color, currentColor);
    transform: translateY(-2px);
    text-decoration: none;
  }
  .connections .tech-card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin-bottom: 0.35rem;
  }
  .connections .tech-card-title { font-size: 1.05rem; font-weight: 600; }
  .connections .tech-card-domain {
    font-family: monospace;
    font-size: 0.78rem;
    color: var(--global-text-color-light, inherit);
    overflow-wrap: anywhere;
  }
  .connections .tech-card-body {
    font-size: 0.85rem;
    color: var(--global-text-color-light, inherit);
    line-height: 1.45;
    margin: 0;
  }
  @media (max-width: 640px) { .connections .site-grid { grid-template-columns: 1fr; } }
  @media (prefers-reduced-motion: reduce) { .connections .tech-card { transition: none; } }
</style>

<div class="connections">
  <div class="formal-connections">
    {% for person in site.data.connections.people %}
      <div class="connection-person">
        <div class="connection-person-head">
          <div>
            <span class="connection-name">{{ person.name[page.lang] | escape }}</span>
            {% assign website_label = person.website_label[page.lang] | default: '主页' %}
            <a class="connection-link" href="{{ person.website | escape }}" target="_blank" rel="noopener noreferrer">[{{ website_label | escape }} ↗]</a>
            {% if person.scholar %}<a class="connection-link" href="{{ person.scholar | escape }}" target="_blank" rel="noopener noreferrer">[Scholar ↗]</a>{% endif %}
            {% if person.orcid %}<a class="connection-link" href="{{ person.orcid | escape }}" target="_blank" rel="noopener noreferrer">[ORCID ↗]</a>{% endif %}
          </div>
          <span class="connection-org">{{ person.organization[page.lang] | escape }}</span>
        </div>
        <p class="connection-desc">{{ person.description[page.lang] | escape }}</p>
      </div>
    {% endfor %}
  </div>

<hr class="connection-divider">

  <div class="site-grid">
    {% for site_entry in site.data.connections.sites %}
      <a class="tech-card" href="{{ site_entry.url | escape }}" target="_blank" rel="noopener noreferrer">
        <div class="tech-card-header">
          <span class="tech-card-title">{{ site_entry.name | escape }}</span>
          <span class="tech-card-domain">{{ site_entry.domain | escape }}</span>
        </div>
        <p class="tech-card-body">{{ site_entry.description[page.lang] | escape }}</p>
      </a>
    {% endfor %}
  </div>
</div>
