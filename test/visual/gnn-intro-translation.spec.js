const { test, expect } = require("@playwright/test");

test("GNN article renders approved Chinese paragraphs and intact formulas", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/zh-cn/blog/gnn-intro-translation/`);

  const article = page.frameLocator("iframe[data-embedded-article]");
  const paragraphs = article.locator("d-article p");
  for (const [beginning, ending] of [
    ["机器学习模型通常以矩形或网格状数组作为输入", "但利用常规深度学习技术便能对其进行直接处理。"],
    ["一种优雅且节省显存的稀疏矩阵表示方法是使用邻接表", "我们便得以避免在图中未相连的部分上耗费计算与存储资源。"],
    ["需要指出的是，前文示意图中每个节点", "对于其余的图属性而言亦是如此。"],
    ["我们用字母", "表示池化操作，并将从边汇聚信息至节点的过程记作"],
    ["对于图中的每个节点，收集其所有相邻节点的嵌入", "这正是前文所述的"],
  ]) {
    await expect(paragraphs.filter({ hasText: beginning })).toContainText(ending);
  }

  await expect(paragraphs.filter({ hasText: "图上的预测任务大体分三类" })).toHaveCount(1);
  await expect(paragraphs.filter({ hasText: "下面这个例子列出了能够描述这张四节点小图" })).toHaveCount(1);
  await expect(paragraphs.filter({ hasText: "我们用字母" }).locator(".MathJax")).toHaveCount(3);
  await expect(paragraphs.filter({ hasText: "我们用字母" })).toContainText("原文亦写作");
  const dual = paragraphs.filter({ hasText: "值得注意的是，边预测与节点预测看似大相径庭" });
  await expect(dual).toContainText("的对偶图上的节点级预测");
  await expect(dual.locator(".MathJax")).toHaveCount(2);
  const matrix = paragraphs.filter({ hasText: "我们首先要说明的一点是" });
  await expect(matrix).toContainText("仅当");
  await expect(matrix.locator(".MathJax")).toHaveCount(13);
  const walks = paragraphs.filter({ hasText: "可以设想，反复施加这一运算" });
  await expect(walks.locator(".MathJax")).toHaveCount(16);
  const formulas = await walks.locator('script[type="math/tex"]').allTextContents();
  expect(formulas.some((formula) => formula.includes("\\langle A_{row_i}, A_{column_j} \\rangle"))).toBe(true);
  expect(formulas.some((formula) => formula.includes("A_{n,j}"))).toBe(true);
  expect(formulas).toContain("A^3 = A A^2");
  await expect(article.locator("d-article .MathJax")).toHaveCount(69);
  await expect(article.locator("d-article .MathJax_Error")).toHaveCount(0);
  const reuse = article.locator("d-appendix p").filter({ hasText: "除非另有说明，本文的图表与文本" });
  await expect(reuse).toContainText("加以辨别。");
  await expect(reuse.getByRole("link", { name: "CC-BY 4.0" })).toHaveAttribute("href", "https://creativecommons.org/licenses/by/4.0/");
  await expect(reuse.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/distillpub/post--gnn-intro");
  await expect(article.locator("d-byline h3")).toContainText(["作者", "所属机构", "发表时间", "数字对象标识符"]);
});

test("molecular playground shows Chinese prediction and chemical labels", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/zh-cn/blog/gnn-intro-translation/`);
  const article = page.frameLocator("iframe[data-embedded-article]");

  await expect(article.locator("#edge-legend")).toContainText("单键", { timeout: 45000 });
  await expect(article.locator("#edge-legend")).toContainText("芳香键");
  await expect(article.locator("#playground")).toContainText("碳");
  await expect(article.locator("#ground-truth")).toContainText(/刺鼻|未知/);
  await expect(article.locator("#model-pred")).toContainText(/% 刺鼻/);
});

test("Vega charts present Chinese titles, fields, and actions", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/zh-cn/blog/gnn-intro-translation/`);
  const article = page.frameLocator("iframe[data-embedded-article]");
  for (const [id, title] of [
    ["BasicArchitectures", "参数量与模型性能"],
    ["ArchitectureNDim", "不同嵌入维度的性能表现"],
    ["ArchitectureNLayers", "按网络层数区分的模型架构"],
    ["ArchitectureAggregation", "按聚合类型区分的模型架构"],
    ["ArchitectureMessagePassing", "按消息传递方式区分的模型架构"],
  ]) {
    const chart = article.locator(`#${id}`);
    await expect(chart.locator(".chart-wrapper")).toHaveAttribute("aria-label", title);
    await expect(chart.locator("canvas.marks")).toBeVisible();
  }

  const chart = article.locator("#BasicArchitectures");
  await chart.locator("details summary").click();
  await expect(chart.locator(".vega-actions")).toContainText("保存为 SVG");
  await expect(chart.locator(".vega-actions")).toContainText("查看编译后的 Vega");
});

test("translated prose keeps Chinese punctuation around citations", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/zh-cn/blog/gnn-intro-translation/`);
  const article = page.frameLocator("iframe[data-embedded-article]");
  const paragraph = article.locator("d-article p").filter({ hasText: "有些图概念很难用这种方式表达" });
  const punctuation = await paragraph.evaluate((element) =>
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === 3)
      .slice(-4)
      .map((node) => node.nodeValue.trim())
  );
  expect(punctuation).toEqual(["，", "，", "，", "。"]);
  await expect(article.locator("#ArchitectureMessagePassing + script + figcaption")).toContainText("结构参数。");
});
