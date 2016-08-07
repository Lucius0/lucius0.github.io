---
layout: default
title: Tags
permalink: /tags/
public: true
---
<div class="home">
	<h1 class="page-heading">Tags</h1>

	<ul class="post-list">
		{% for tag in site.tags %}
		<a name="{{ tag[0] }}"></a>
		<h2>{{ tag[0] }}({{ tag[1].size }})</h2>
		{% for post in tag[1] %}
		<li>
			<h4>
				<span>{{ post.date | date_to_string }}</span>
				&raquo;
				<a href="{{ post.url }}">{{ post.title }}</a>
			</h4>
		</li>
		{% endfor %}
	{% endfor %}
	</ul>
</div>