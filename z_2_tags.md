---
layout: default
title: Tags
permalink: /tags/
public: true
---
<div class="home">
	<h1 class="page-heading">Tags</h1>

	<ul class="post-list accordion">
		{% for tag in site.tags %}
		<a name="{{ tag[0] }}"></a>
		<h2 class="link" id="{{ tag[0] }}">{{ tag[0] }}({{ tag[1].size }})<span class="fa-chevron-down"></span></h2>
		<div class="submenu">
			{% for post in tag[1] %}
			<ul>
				<li>
					<a href="{{ post.url }}">{{ post.date | date_to_string }} &raquo; {{ post.title }}</a>
				</li>
			</ul>
			{% endfor %}
		</div>
	{% endfor %}
	</ul>
</div>
