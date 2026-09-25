---
sitemap: false
layout: page
title: 项目 1
permalink: /projects/1_project/ # 与英文版保持一致，避免 URL 里出现 zh-cn 路径段
description: 带背景图
img: assets/img/12.jpg
importance: 1
category: work
related_publications: true
lang: zh-cn
page_id: project-1
---

每个项目都可以有一个漂亮的成果展示页。
用灵活的三栏网格排布图片很容易。
图片可以占 1/3、2/3 或整行宽度。

想让项目在作品集页面上带背景图，只要在 front matter 里加上 img 字段：

    ---
    layout: page
    title: project
    description: a project with a background image
    img: /assets/img/12.jpg
    ---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/1.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/3.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    给照片配说明文字很方便。左侧，一条公路穿过隧道；中间，树叶在文艺风的拍摄里飘落；右侧，另一位伐木工人手里攥着一把松针。
</div>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/5.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    这张图片同样可以配说明文字，就像变魔术一样。
</div>

图片之间也可以插入普通文字，甚至可以插入引用 {% cite einstein1950meaning %}。
假设你想在放出其余图片之前先写几句项目介绍：讲讲自己如何辛苦付出、挥汗如雨、_呕心沥血_，然后……在下一行图片里展示它的成果。

<div class="row justify-content-sm-center">
    <div class="col-sm-8 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/6.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/11.jpg" title="示例图片" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    也可以像这样，用 2/3 加 1/3 的比例排布图片。
</div>

写法很简单。
把图片包在 `<div class="col-sm">` 里，再放进 `<div class="row">`（参见 <a href="https://getbootstrap.com/docs/4.4/layout/grid/">Bootstrap 网格系统</a>）。
想让图片自适应，就给每张图加上 `img-fluid` 类；圆角和阴影分别用 `rounded` 和 `z-depth-1` 类。
上面最后一行图片的代码如下：

{% raw %}

```html
<div class="row justify-content-sm-center">
  <div class="col-sm-8 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/6.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
  <div class="col-sm-4 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/11.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
  </div>
</div>
```

{% endraw %}
