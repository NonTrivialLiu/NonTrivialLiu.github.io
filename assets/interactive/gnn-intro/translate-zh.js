/*!
 * Distill 图神经网络文章的中文文本映射。
 * 覆盖静态正文与动态生成的图表标签；参考文献和作者姓名保留原文。
 */
(function () {
  'use strict';

  // 精确匹配优先，再按长度降序做片段替换，避免短词抢先命中。
  const EXACT = new Map(Object.entries({
    'Distill': 'Distill',
    'ABOUT': '关于',
    'PRIZE': '奖项',
    'SUBMIT': '投稿',
    'A Gentle Introduction to Graph Neural Networks': '图神经网络入门指南',
    'AUTHORS': '作者',
    'AFFILIATIONS': '所属机构',
    'PUBLISHED': '发表时间',
    'DOI': '数字对象标识符',
    'Sept. 2, 2021': '2021 年 9 月 2 日',
    'Google Research': '谷歌研究院',
    'About': '关于',
    'Submit': '投稿',
    'Prize': '奖项',
    'Archive': '存档',
    'RSS': '订阅源',
    // —— 交互图表内部的界面标签 ——
    'Layer 0': '第 0 层',
    'Layer 1': '第 1 层',
    'Layer 2': '第 2 层',
    'Layer 3': '第 3 层',
    'Layer N': '第 N 层',
    'Layer N + 1': '第 N + 1 层',
    'Vertex (or node) attributes': '顶点（或者节点）属性',
    'e.g., node identity, number of neighbors': '例如节点身份、邻居数量',
    'Edge (or link) attributes and directions': '边（或者连接）的属性与方向',
    'e.g., edge identity, edge weight': '例如边的身份、边的权重',
    'Global (or master node) attributes': '全局（或者主节点）属性',
    'e.g., number of nodes, longest path': '例如节点数量、最长路径',
    'Vertex (or node) embedding': '顶点（或者节点）嵌入',
    'Edge (or link) attributes and embedding': '边（或者连接）的属性与嵌入',
    'Global (or master node) embedding': '全局（或者主节点）嵌入',
    'Image Pixels': '图像像素',
    'Adjacency Matrix': '邻接矩阵',
    'Graph': '图',
    'Nodes': '节点',
    'Edges': '边',
    'Global': '全局',
    'Adjacency List': '邻接表',
    'Aggregate information': '汇聚信息',
    'from adjacent edges': '来自相邻的边',
    'from adjacent nodes': '来自相邻的节点',
    'Transform': '变换',
    'information': '信息',
    'Update graph with': '用新的信息',
    'new information': '更新这张图',
    'TASK': '任务',
    'MODEL OPTIONS': '模型选项',
    'MODEL AUC': '模型 AUC',
    'Depth': '深度',
    'Aggregation function': '聚合函数',
    'Node embedding size': '节点嵌入维度',
    'Edge embedding size': '边嵌入维度',
    'Global embedding size': '全局嵌入维度',
    'Task': '任务',
    'Model Options': '模型选项',
    'Model AUC': '模型 AUC',
    'Model Prediction': '模型预测',
    'Ground Truth': '真实标签',
    'Pungent': '刺鼻',
    'Reset': '重置',
    'Warning:': '警告：',
    'For this': '在这个',
    'graph level prediction task': '图级预测任务',
    ', each graph is a molecule. The task is to predict whether or not a molecule will smell pungent. In the scatter plot, each point represents a graph.':
      '中，每张图都是一个分子。任务是预测某个分子闻起来是否刺鼻。散点图里的每个点都代表一张图。',
    'epoch:': '迭代轮次：',
    '1 layer': '1 层',
    '2 layers': '2 层',
    '3 layers': '3 层',
    '4 layers': '4 层',
    'Mean': '均值',
    'Sum': '求和',
    'Max': '最大值',
    'Max Pooling': '最大值池化',
    'Mean Pooling': '均值池化',
    'Sum Pooling': '求和池化',
    'Click to view actions': '点击查看操作',
    'Vega visualization': 'Vega 可视化',
    'Mean days completed': '平均完成天数',
    // —— 正文里被行内链接切开的短片段（整节点精确匹配） ——
    'graph': '图',
    'edges': '边',
    'nodes': '节点',
    ', physics simulations': '、物理模拟',
    ', fake news detection': '、虚假新闻检测',
    ', traffic prediction': '、交通流量预测',
    'and recommendation systems': '，以及推荐系统',
    'directed, undirected': '有向、无向',
    'adjacency matrix': '邻接矩阵',
    // —— 引用列表与统计表里的短标签 ——
    ',': '、',
    ').': '）。',
    'and': '、',
    'directed': '有向',
    'Machine learning models': '机器学习模型',
    'programming code': '程序代码',
    'math equations': '数学公式',
    'Edges per node (degree)': '每个节点的边数（度）',
    'Dataset': '数据集',
    'Domain': '领域',
    'graphs': '图数量',
    'min': '最小值',
    'max': '最大值',
    'Social network': '社交网络',
    'Small molecules': '小分子',
    'Citation network': '引用网络',
    'Knowledge graph': '知识图谱',
    // —— 小节起始短语：整节点精确匹配，避免与长句规则混淆 ——
    'Molecules as graphs.': '分子作为图。',
    'Social networks as graphs.': '社交网络作为图。',
    'Citation networks as graphs.': '引用网络作为图。',
    'Other examples.': '其他例子。',
    // —— 图内标签：三类预测任务的示意图 ——
    // 标签在源码里写成 <b>Input:</b> <span>graphs</span>，会被切成两个文本节点，
    // 因此分别给出「前缀」与「正文」两条词条；照抄整句的词条永远无法命中。
    'Input:': '输入：',
    'Output:': '输出：',
    'mean': '均值',
    'labels for each graph, (e.g., "does the graph contain two rings?")':
      '每张图的标签（例如“这张图里是否含有两个环？”）',
    'graph with unlabled nodes': '节点尚未标注的图',
    'graph node labels': '图的节点标签',
    'Allegiance to John A': '效忠 John A',
    'Allegiance to Mr. Hi': '效忠 Hi 先生',
    'Mr. Hi': 'Hi 先生',
    'Input: fully connected graph, unlabeled edges': '输入：全连接图，边尚未标注',
    'Output: labels for edges': '输出：边的标签',
    'edge prediction': '边预测',
    'image segmentation': '图像分割',
    'example dataset table': '示例数据集表格',
    'Othello graph': '《奥赛罗》图',
    'For example, the': '例如，前文提到的',
    "we’ve constructed above": '上面已经构造好的图的数值表示',
    'pooling': '池化',
    'gather': '收集',
    'aggregated': '聚合',
    'message passing': '消息传递',
    'update function': '更新函数',
    'master node': '主节点',
    'allyl alcohol': '烯丙醇',
    'piperitone': '胡椒酮',
    'GraphNets': 'GraphNets',
    'depth': '深度',
    'discriminatory/expressive capabilities': '区分能力与表达能力',
    'multigraphs': '多重图',
    'node-set': '节点集',
  }));

  const PHRASES = [
    // —— 引言 ——
    ['Graphs are all around us; real world objects are often defined in terms of their connections to other things. A set of objects, and the connections between them, are naturally expressed as a ',
      '图无处不在；现实世界中的物体，往往要靠它与其他事物的联系来界定。一组对象以及它们之间的联系，天然就可以用一张'],
    ['. Researchers have developed neural networks that operate on graph data (called graph neural networks, or GNNs) for over a decade',
      '来表示。十多年来，研究者一直在开发能够处理图数据的神经网络，人们把它称作图神经网络（GNN）'],
    ['. Recent developments have increased their capabilities and expressive power. We are starting to see practical applications in areas such as antibacterial discovery ',
      '。近些年的进展持续提升着它的能力与表达能力。我们开始在一些领域看到实际应用，例如抗菌药物发现'],
    ['This article explores and explains modern graph neural networks. We divide this work into four parts. First, we look at what kind of data is most naturally phrased as a graph, and some common examples. Second, we explore what makes graphs different from other types of data, and some of the specialized choices we have to make when using graphs. Third, we build a modern GNN, walking through each of the parts of the model, starting with historic modeling innovations in the field. We move gradually from a bare-bones implementation to a state-of-the-art GNN model. Fourth and finally, we provide a GNN playground where you can play around with a real-word task and dataset to build a stronger intuition of how each component of a GNN model contributes to the predictions it makes.',
      '本文梳理并讲解现代图神经网络。我们把整项工作分成四个部分。第一部分，我们看看哪些数据最适合用图来表达，并给出若干常见例子。第二部分，我们探讨图与其他类型数据的不同之处，以及使用图时必须做出的若干专门选择。第三部分，我们搭建一个现代图神经网络，逐一走过模型的各个部分，并从该领域历史上的建模创新讲起，从最简实现逐步走到前沿模型。第四部分也是最后一部分，我们提供一个图神经网络演练场，你可以在这里摆弄真实任务与数据集，从而更直观地体会模型的每个组成部分如何影响它给出的预测。'],
    ['To start, let’s establish what a graph is. A graph represents the relations (',
      '我们先明确什么是图。图用来刻画若干实体之间的关联（'],
    [') between a collection of entities (',
      '），这些实体称为（'],
    ['To further describe each node, edge or the entire graph, we can store information in each of these pieces of the graph. ',
      '要进一步描述每个节点、每条边或者整张图，我们可以把信息存放在图的这些部件上。'],

    // —— 图的方向性与过渡句 ——
    ['We can additionally specialize graphs by associating directionality to edges (',
      '我们还可以给每条边赋予方向，从而把图进一步特化（'],
    ['Graphs are very flexible data structures, and if this seems abstract now, we will make it concrete with examples in the next section. ',
      '图是一种非常灵活的数据结构；如果此刻还觉得抽象，我们会在下一节用例子把它讲具体。'],

    // —— 图，以及在哪里找到它们 ——
    ['You’re probably already familiar with some types of graph data, such as social networks. However, graphs are an extremely powerful and general representation of data, we will show two types of data that you might not think could be modeled as graphs: images and text. Although counterintuitive, one can learn more about the symmetries and structure of images and text by viewing them as graphs,, and build an intuition that will help understand other less grid-like graph data, which we will discuss later.',
      '你大概已经熟悉某些图数据，例如社交网络。不过，图是一种极为强大而且通用的数据表示方式；我们接下来会展示两种你或许不认为能够用图刻画的数据：图像与文本。乍看之下有违直觉，然而把图像与文本看作图，反而能更多地了解它们在对称性与结构上的特点，由此建立的直觉还能帮助你理解其他不那么规整的图数据，这些内容我们稍后讨论。'],

    // —— 把图像看作图 ——
    ['We typically think of images as rectangular grids with image channels, representing them as arrays (e.g., 244x244x3 floats). Another way to think of images is as graphs with regular structure, where each pixel represents a node and is connected via an edge to adjacent pixels. Each non-border pixel has exactly 8 neighbors, and the information stored at each node is a 3-dimensional vector representing the RGB value of the pixel.',
      '我们通常把图像看作带通道的矩形网格，用数组来表示它（例如 244×244×3 个浮点数）。换一个角度观察，图像也可以看作结构规整的图：每个像素对应一个节点，并且与相邻像素通过边相连。每个非边缘像素恰好拥有 8 个邻居，存放在每个节点上的信息是一个三维向量，用来表示该像素的 RGB 取值。'],
    // —— 把文本看作图 ——
    ['We can digitize text by associating indices to each character, word, or token, and representing text as a sequence of these indices. This creates a simple directed graph, where each character or index is a node and is connected via an edge to the node that follows it.',
      '我们可以给每个字符、单词或者词元分配一个编号，把文本表示为这些编号组成的序列，从而实现文本的数字化。这样就得到一张简单的有向图：每个字符或者编号都是一个节点，并且与紧随其后的那个节点通过一条边相连。'],
    ['Of course, in practice, this is not usually how text and images are encoded: these graph representations are redundant since all images and all text will have very regular structures. For instance, images have a banded structure in their adjacency matrix because all nodes (pixels) are connected in a grid. The adjacency matrix for text is just a diagonal line, because each word only connects to the prior word, and to the next one. ',
      '当然，实践中文本与图像通常并不这样编码：这些图表示存在大量冗余，因为所有图像、所有文本的结构都极其规整。举例来说，图像的邻接矩阵呈现带状结构，原因在于所有节点（像素）都按网格相连。文本的邻接矩阵则是一条对角线，因为每个词只与前一个词、后一个词相连。'],

    // —— 现实世界中的图数据 ——
    [', we see the number of nodes in a graph can be on the order of millions, and the number of edges per node can be highly variable. Often, this leads to very sparse adjacency matrices, which are space-inefficient.',
      '，我们就会看到，图中节点的数量可以达到百万量级，而每个节点的边数可能相差极大。这往往导致邻接矩阵极其稀疏，在存储上很不划算。'],
    [' from before can be described equivalently with these two adjacency matrices. It can also be described with every other possible permutation of the nodes.',
      ' 可以等效地用这两个邻接矩阵来描述。它同样可以用节点所有其他可能的排列来描述。'],
    ['Learning permutation invariant operations is an area of recent research.',
      '学习置换不变的运算，是近年的一个研究领域。'],
    // —— 图神经网络：主干叙述 ——
    ['A GNN is an optimizable transformation on all attributes of the graph (nodes, edges, global-context) that preserves graph symmetries (permutation invariances).',
      '图神经网络是对图的全部属性（节点、边、全局上下文）所作的一种可优化变换，并且保持图的对称性（排列不变性）。'],
    ['We’re going to build GNNs using the “message passing neural network” framework proposed by Gilmer et al.',
      ' 我们依照 Gilmer 等人提出的“消息传递神经网络”框架来搭建图神经网络'],
    ['using the Graph Nets architecture schematics introduced by Battaglia et al.',
      '，并采用 Battaglia 等人给出的 Graph Nets 结构示意图'],
    ['GNNs adopt a “graph-in, graph-out” architecture meaning that these model types accept a graph as input, with information loaded into its nodes, edges and global-context, and progressively transform these embeddings, without changing the connectivity of the input graph.',
      '。图神经网络采用“图进、图出”的结构：这类模型接收一张图作为输入，把信息装载到它的节点、边与全局上下文上，随后逐步变换这些嵌入，同时保持输入图的连接关系不变。'],
    ['. Pooling proceeds in two steps:', ' 来做到这一点。池化分两步进行：'],
    ['For each item to be pooled, ', '对于每个待池化的对象，'],
    [' each of their embeddings and concatenate them into a matrix.', '各自的嵌入，把它们拼接成一个矩阵。'],
    ['The gathered embeddings are then ', '随后把这些收集到的嵌入'],
    [', usually via a sum operation.', '起来，通常采用求和运算。'],
    ['Graphs are a useful tool to describe data you might already be familiar with. Let’s move on to data which is more heterogeneously structured. In these examples, the number of neighbors to each node is variable (as opposed to the fixed neighborhood size of images and text). This data is hard to phrase in any other way besides a graph.',
      '图是描述你也许已经熟悉的数据的一件趁手工具。接下来，我们转向结构更加多样的数据。在这些例子里，每个节点的邻居数量会变化，而不像图像与文本那样邻域大小固定。这类数据除了用图来表述，几乎找不到别的说法。'],
    [' Molecules are the building blocks of matter, and are built of atoms and electrons in 3D space. All particles are interacting, but when a pair of atoms are stuck in a stable distance from each other, we say they share a covalent bond. Different pairs of atoms and bonds have different distances (e.g. single-bonds, double-bonds). It’s a very convenient and common abstraction to describe this 3D object as a graph, where nodes are atoms and edges are covalent bonds.',
      ' 分子是构成物质的积木，由原子与电子在三维空间中搭建而成。所有粒子都在相互作用；当一对原子彼此保持稳定的距离时，我们就说它们之间共享一根共价键。不同原子对与不同化学键的距离各不相同（例如单键、双键）。把这个三维对象描述成一张图，是一种非常方便而且常见的抽象：节点是原子，边是共价键。'],
    [' Here are two common molecules, and their associated graphs.',
      ' 下面给出两种常见分子，以及它们对应的图。'],
    [' Social networks are tools to study patterns in collective behaviour of people, institutions and organizations. We can build a graph representing groups of people by modelling individuals as nodes, and their relationships as edges.',
      ' 社交网络是研究人群、机构与组织集体行为模式的工具。我们可以把个人建模为节点、把彼此的关系建模为边，从而构建一张描述群体关系的图。'],
    ['Unlike image and text data, social networks do not have identical adjacency matrices.',
      '与图像和文本数据不同，社交网络的邻接矩阵各不相同。'],
    [' Scientists routinely cite other scientists’ work when publishing papers. We can visualize these networks of citations as a graph, where each paper is a node, and each ',
      ' 科学家发表论文时，会例行引用其他科学家的成果。我们可以把这些引用网络可视化为一张图：每篇论文是一个节点，每条 '],
    [' edge is a citation between one paper and another. Additionally, we can add information about each paper into each node, such as a word embedding of the abstract. (see ',
      ' 边表示一篇论文对另一篇论文的引用。此外，我们还可以把每篇论文的信息放进对应的节点，例如摘要的词嵌入。（参见 '],
    [' In computer vision, we sometimes want to tag objects in visual scenes. We can then build graphs by treating these objects as nodes, and their relationships as edges. ',
      ' 在计算机视觉里，我们有时需要标注视觉场景中的对象。此时可以把这些对象当作节点、把它们之间的关系当作边，从而构建图。'],
    [' can also be phrased as graphs, where the variables are nodes, and edges are operations that have these variables as input and output. You might see the term “dataflow graph” used in some of these contexts.',
      ' 同样可以用图来表述：变量是节点，边是把这些变量当作输入与输出的运算。在部分场合，你会看到人们使用“数据流图”这个说法。'],
    // 原文的破折号两侧是窄空格（U+2009），词条必须照抄，否则匹配不上。
    ['The structure of real-world graphs can vary greatly between different types of data\u2009\u2014\u2009some graphs have many nodes with few connections between them, or vice versa. Graph datasets can vary widely (both within a given dataset, and between datasets) in terms of the number of nodes, edges, and the connectivity of nodes.',
      '真实世界中，图的结构在不同数据类型之间差别很大：有些图的节点很多，彼此之间的连接却很少，反过来也有。无论在同一份数据集内部，还是在不同数据集之间，节点数量、边的数量以及节点的连接程度都可能存在很大差异。'],

    // —— 题头与导语 ——
    ['Neural networks have been adapted to leverage the structure and properties of graphs. We explore the components needed for building a graph neural network - and motivate the design choices behind them.',
      '研究者调整神经网络，让它利用图的结构与性质。我们逐一查看搭建图神经网络所需的各个组成部分，并且说明这些设计选择背后的理由。'],
    ['Hover over a node in the diagram below to see how it accumulates information from nodes around it through the layers of the network.',
      '把鼠标停留在下图中的某个节点上，就能看到它如何沿着网络各层，从周围节点处逐步汇聚信息。'],
    ['This article is one of two Distill publications about graph neural networks. Take a look at ',
      '本文是 Distill 关于图神经网络的两篇出版物之一。欢迎阅读'],
    ['Understanding Convolutions on Graphs', '理解图上的卷积'],
    [' to understand how convolutions over images generalize naturally to convolutions over graphs.',
      '，了解图像上的卷积如何自然地推广到图上的卷积。'],

    // —— 章节标题 ——
    ['Graphs and where to find them', '图，以及在哪里找到它们'],
    ['Images as graphs', '把图像看作图'],
    ['Text as graphs', '把文本看作图'],
    ['Graph-valued data in the wild', '现实世界中的图数据'],
    ['What types of problems have graph structured data?', '哪些问题会用到图结构数据？'],
    ['Graph-level task', '图级任务'],
    ['Node-level task', '节点级任务'],
    ['Edge-level task', '边级任务'],
    ['The challenges of using graphs in machine learning', '在机器学习中使用图所面临的挑战'],
    ['Graph Neural Networks', '图神经网络'],
    ['The simplest GNN', '最简单的图神经网络'],
    ['GNN Predictions by Pooling Information', '借助信息池化完成图神经网络预测'],
    ['Passing messages between parts of the graph', '在图的不同部分之间传递消息'],
    ['Learning edge representations', '学习边的表示'],
    ['Adding global representations', '引入全局表示'],
    ['GNN playground', '图神经网络演练场'],
    ['Some empirical GNN design lessons', '图神经网络设计的一些经验'],
    ['Into the Weeds', '深入细节'],
    ['Other types of graphs (multigraphs, hypergraphs, hypernodes, hierarchical graphs)',
      '其他类型的图（多重图、超图、超节点、层次图）'],
    ['Sampling Graphs and Batching in GNNs', '图神经网络中的图采样与分批'],
    ['Inductive biases', '归纳偏置'],
    ['Comparing aggregation operations', '比较各种聚合操作'],
    ['GCN as subgraph function approximators', '把图卷积网络看作子图函数逼近器'],
    ['Edges and the Graph Dual', '边与图的对偶'],
    ['Graph convolutions as matrix multiplications, and matrix multiplications as walks on a graph',
      '把图卷积看作矩阵乘法，把矩阵乘法看作图上的游走'],
    ['Graph Attention Networks', '图注意力网络'],
    ['Graph explanations and attributions', '图的解释与归因'],
    ['Generative modelling', '生成式建模'],
    ['Final thoughts', '结语'],
    ['Acknowledgments', '致谢'],
    ['Author Contributions', '作者贡献'],
    ['Discussion and Review', '讨论与评审'],
    ['References', '参考文献'],
    ['Updates and Corrections', '更新与勘误'],
    ['Reuse', '复用'],
    ['Citation', '引用方式'],

    // —— 全部图注 ——
    ['Information in the form of scalars or embeddings can be stored at each graph node (left) or edge (right).',
      '标量或者嵌入形式的信息可以存放在图的每个节点（左）或者每条边（右）上。'],
    ['The edges can be directed, where an edge $e$ has a source node, $v_{src}$, and a destination node $v_{dst}$. In this case, information flows from $v_{src}$ to $v_{dst}$. They can also be undirected, where there is no notion of source or destination nodes, and information flows both directions. Note that having a single undirected edge is equivalent to having one directed edge from $v_{src}$ to $v_{dst}$, and another directed edge from $v_{dst}$ to $v_{src}$.',
      '边可以是有向的，此时一条边 $e$ 拥有源节点 $v_{src}$ 与目标节点 $v_{dst}$，信息从 $v_{src}$ 流向 $v_{dst}$。边也可以是无向的，此时不存在源节点或者目标节点的说法，信息朝两个方向流动。请注意，一条无向边等价于同时拥有一条从 $v_{src}$ 指向 $v_{dst}$ 的有向边，以及另一条从 $v_{dst}$ 指向 $v_{src}$ 的有向边。'],
    // 这一段被 MathJax 字形切成多个节点，整段匹配无法命中，改为按碎片对齐。
    ['A way of visualizing the connectivity of a graph is through its ',
      '一种可视化图连接关系的方式，是画出它的'],
    ['. We order the nodes, in this case each of 25 pixels in a simple 5x5 image of a smiley face, and fill a matrix of ',
      '。我们把节点排好顺序，此处是一张 5x5 笑脸图里的 25 个像素，然后填满一个 '],
    [' with an entry if two nodes share an edge. Note that each of these three representations below are different views of the same piece of data. ',
      ' 的矩阵，只要两个节点之间存在边，就在矩阵中填入一项。请注意，下面这三种表示其实是同一份数据的三种不同视图。'],
    ['Click on an image pixel to toggle its value, and see how the graph representation changes.',
      '点击图像中的像素即可切换它的取值，随后观察图的表示如何随之变化。'],
    ['Edit the text above to see how the graph representation changes.',
      '编辑上方的文本，观察图的表示如何随之变化。'],
    ['This representation (a sequence of character tokens) refers to the way text is often represented in RNNs; other models, such as Transformers, can be considered to view text as a fully connected graph where we learn the relationship between tokens. See more in ',
      '这种表示（一串字符词元）对应循环神经网络中常见的文本表示方式；其他模型，例如 Transformer，可以看作把文本视为一张全连接图，并在其中学习词元之间的关系。更多内容见'],
    ['(Left) 3d representation of the Citronellal molecule (Center) Adjacency matrix of the bonds in the molecule (Right) Graph representation of the molecule.',
      '（左）香茅醛分子的三维表示；（中）分子内化学键的邻接矩阵；（右）分子的图表示。'],
    ['(Left) 3d representation of the Caffeine molecule (Center) Adjacency matrix of the bonds in the molecule (Right) Graph representation of the molecule.',
      '（左）咖啡因分子的三维表示；（中）分子内化学键的邻接矩阵；（右）分子的图表示。'],
    ['(Left) Image of a scene from the play “Othello”. (Center) Adjacency matrix of the interaction between characters in the play. (Right) Graph representation of these interactions.',
      '（左）戏剧《奥赛罗》某一场景的画面；（中）剧中人物互动关系的邻接矩阵；（右）这些互动关系的图表示。'],
    ['(Left) Image of karate tournament. (Center) Adjacency matrix of the interaction between people in a karate club. (Right) Graph representation of these interactions.',
      '（左）空手道比赛的照片；（中）空手道俱乐部成员之间互动关系的邻接矩阵；（右）这些互动关系的图表示。'],
    ['Summary statistics on graphs found in the real world. Numbers are dependent on featurization decisions. More useful statistics and graphs can be found in KONECT',
      '真实世界中各种图的汇总统计量。具体数值取决于如何构造特征。更多有用的统计量与图表可以在 KONECT 中找到'],
    ['A classic example of a node-level prediction problem is Zach’s karate club.', '节点级预测问题的一个经典例子是扎卡里的空手道俱乐部。'],
    ['On the left we have the initial conditions of the problem, on the right we have a possible solution, where each node has been classified based on the alliance. The dataset can be used in other graph problems like unsupervised learning.',
      '左侧给出问题的初始条件，右侧给出一种可能的解答，其中每个节点都依据其归属完成了分类。该数据集同样可以用于无监督学习等其他图问题。'],
    ['Following the image analogy, node-level prediction problems are analogous to image segmentation, where we are trying to label the role of each pixel in an image. With text, a similar task would be predicting the parts-of-speech of each word in a sentence (e.g. noun, verb, adverb, etc).',
      '沿用图像的类比，节点级预测问题类似于图像分割，我们需要为图像中的每个像素标注它的角色。放到文本上，类似的任务是预测句子中每个词的词性（例如名词、动词、副词等）。'],
    ['The remaining prediction problem in graphs is edge prediction.', '图中剩下的预测问题是边预测。'],
    ['In (b), above, the original image (a) has been segmented into five entities: each of the fighters, the referee, the audience and the mat. (C) shows the relationships between these entities.',
      '在上方的 (b) 中，原始图像 (a) 已被分割为五个实体：两位格斗者、裁判、观众与垫子。(C) 则展示这些实体之间的关系。'],
    ['On the left we have an initial graph built from the previous visual scene. On the right is a possible edge-labeling of this graph when some connections were pruned based on the model’s output.',
      '左侧给出依据前一个视觉场景构建的初始图。右侧则是依据模型输出裁剪掉部分连接之后，这张图的一种可能的边标注结果。'],
    ['However, representing a graph’s connectivity is more complicated. Perhaps the most obvious choice would be to use an adjacency matrix, since this is easily tensorisable. However, this representation has a few drawbacks. From the ',
      '不过，表示图的连接关系要复杂得多。最直接的选择也许是使用邻接矩阵，因为它很容易张量化。但这种表示存在若干缺点。从'],
    ['example dataset table,', '示例数据集表格'],
    ['Othello graph,', '《奥赛罗》图'],
    ['Two adjacency matrices representing the same graph.', '两个邻接矩阵表示同一张图。'],
    ['All of these adjacency matrices represent the same graph. Click on an edge to remove it on a “virtual edge” to add it and the matrices will update accordingly.',
      '这些邻接矩阵表示的都是同一张图。点击一条边即可移除它，点击一条“虚拟边”即可添加它，矩阵会随之更新。'],
    ['Hover and click on the edges, nodes, and global graph marker to view and change attribute representations. On one side we have a small graph and on the other the information of the graph in a tensor representation.',
      '把鼠标停留在边、节点与全局图标记上并点击，即可查看并修改各属性的表示。一侧是一张小图，另一侧则是这张图的张量表示。'],
    ['Now that the graph’s description is in a matrix format that is permutation invariant, we will describe using graph neural networks (GNNs) to solve graph prediction tasks.  A GNN is an optimizable transformation on all attributes of the graph (nodes, edges, global-context) that preserves graph symmetries (permutation invariances).  We’re going to build GNNs using the “message passing neural network” framework proposed by Gilmer et al.  using the Graph Nets architecture schematics introduced by Battaglia et al.  GNNs adopt a “graph-in, graph-out” architecture meaning that these model types accept a graph as input, with information loaded into its nodes, edges and global-context, and progressively transform these embeddings, without changing the connectivity of the input graph.',
      '既然图的描述已经转换为对排列保持不变的矩阵格式，接下来我们说明如何运用图神经网络（GNN）来完成图上的预测任务。图神经网络是对图的全部属性（节点、边、全局上下文）所作的一种可优化变换，并且保持图的对称性（排列不变性）。我们依照 Gilmer 等人提出的“消息传递神经网络”框架来搭建图神经网络，并采用 Battaglia 等人给出的 Graph Nets 结构示意图。图神经网络采用“图进、图出”的结构，也就是说这类模型接收一张图作为输入，把信息装载到它的节点、边与全局上下文上，然后逐步变换这些嵌入，同时保持输入图的连接关系不变。'],
    ['With the numerical representation of graphs that ', '借助'],
    [' (with vectors instead of scalars), we are now ready to build a GNN.',
      '（把标量换成向量），我们现在可以着手搭建图神经网络。'],
    [' (with vectors instead of scalars), we are now ready to build a GNN. We will start with the simplest GNN architecture, one where we learn new embeddings for all graph attributes (nodes, edges, global), but where we do not yet use the connectivity of the graph.',
      '，我们现在可以着手搭建图神经网络。我们先从最简单的结构开始，它为图的全部属性（节点、边、全局）学习新的嵌入，此时尚未利用图的连接关系。'],
    ['A single layer of a simple GNN. A graph is the input, and each component (V,E,U) gets updated by a MLP to produce a new graph. Each function subscript indicates a separate function for a different graph attribute at the n-th layer of a GNN model.',
      '简单图神经网络的单层结构。输入是一张图，各个组成部分 (V,E,U) 分别经过多层感知机更新，生成一张新图。函数的下标表示图神经网络模型第 n 层中针对不同图属性的独立函数。'],
    ['We could imagine a social network, where we wish to anonymize user data (nodes) by not using them, and only using relational data (edges). One instance of such a scenario is the node task we specified in the ',
      '我们可以设想一个社交网络，出于匿名化用户数据（节点）的考虑而不使用它们，只使用关系数据（边）。这类情形的一个实例就是我们在'],
    ['Node-level task,', '节点级任务'],
    [' subsection. In the Karate club example, this would be just using the number of meetings between people to determine the alliance to Mr. Hi or John H.',
      '小节中指定的节点任务。在空手道俱乐部的例子里，这就相当于仅依靠成员之间的会面次数，判断其归属是 Hi 先生还是 John H。'],
    ['For a more in-depth discussion on aggregation operations go to the ', '关于聚合操作的更深入讨论，请参见'],
    ['Comparing aggregation operations,', '比较各种聚合操作'],
    ['Hover over a node (black node) to visualize which edges are gathered and aggregated to produce an embedding for that target node.',
      '把鼠标停留在某个节点（黑色节点）上，即可看到哪些边被收集并聚合，从而生成该目标节点的嵌入。'],
    ['One example of such a scenario is the edge task we specified in ', '这类情形的一个实例是我们在'],
    ['Edge level task,', '边级任务'],
    [' sub section. Nodes can be recognized as image entities, and we are trying to predict if the entities share a relationship (binary edges).',
      '小节中指定的边任务。节点可以对应图像中的实体，我们需要预测这些实体之间是否共享某种关系（二元边）。'],
    ['An end-to-end prediction task with a GNN model.', '使用图神经网络模型的端到端预测任务。'],
    ['Hover over a node, to highlight adjacent nodes and visualize the adjacent embedding that would be pooled, updated and stored.',
      '把鼠标停留在某个节点上，即可高亮相邻节点，并看到即将被池化、更新与存储的邻接嵌入。'],
    ['Schematic for a GCN architecture, which updates node representations of a graph by pooling neighboring nodes at a distance of one degree.',
      '图卷积网络结构的示意图，它通过池化距离为一度的相邻节点，来更新图中各节点的表示。'],
    ['Architecture schematic for Message Passing layer. The first step “prepares” a message composed of information from an edge and it’s connected nodes and then “passes” the message to the node.',
      '消息传递层的结构示意图。第一步“准备”一条消息，它由某条边及其相连节点的信息组成，随后把这条消息“传递”给节点。'],
    ['Some of the different ways we might combine edge and node representation in a GNN layer.',
      '在图神经网络层中组合边表示与节点表示的若干不同方式。'],
    ['Schematic of a Graph Nets architecture leveraging global representations.',
      '利用全局表示的 Graph Nets 结构示意图。'],
    ['Schematic for conditioning the information of one node based on three other embeddings (adjacent nodes, adjacent edges, global). This step corresponds to the node operations in the Graph Nets Layer.',
      '依据另外三种嵌入（相邻节点、相邻边、全局）来调节某个节点信息的示意图。这一步对应 Graph Nets 层中的节点操作。'],
    ['Our playground shows a graph-level prediction task with small molecular graphs. We use the the Leffingwell Odor Dataset , which is composed of molecules with associated odor percepts (labels). Predicting the relation of a molecular structure (graph) to its smell is a 100 year-old problem straddling chemistry, physics, neuroscience, and machine learning.',
      '我们的演练场展示一项图级预测任务，使用的都是小型分子图。我们采用 Leffingwell 气味数据集，它由分子以及与之关联的气味感知（标签）组成。把分子结构（图）与它的气味联系起来加以预测，是一个跨越化学、物理、神经科学与机器学习、延续百年的问题。'],
    ['To simplify the problem, we consider only a single binary label per molecule, classifying if a molecular graph smells “pungent” or not, as labeled by a professional perfumer. We say a molecule has a “pungent” scent if it has a strong, striking smell. For example, garlic and mustard, which might contain the molecule  allyl alcohol  have this quality. The molecule  piperitone , often used for peppermint-flavored candy, is also described as having a pungent smell.',
      '为了简化问题，我们对每个分子只保留一个二元标签，依据专业调香师的标注，判断该分子图闻起来是否“刺鼻”。如果一种分子拥有强烈而突出的气味，我们就说它具有“刺鼻”气味。举例来说，大蒜与芥末可能含有的烯丙醇就具备这种特征。常用于薄荷口味糖果的胡椒酮，同样被描述为具有刺鼻气味。'],
    ['This playground is running live on the browser in ', '这个演练场正在浏览器中实时运行，所用框架是'],
    ['Edit the molecule to see how the prediction changes, or change the model params to load a different model. Select a different molecule in the scatter plot.',
      '编辑分子即可观察预测结果如何变化，或者调整模型参数以载入另一个模型。你也可以在散点图中选择另一个分子。'],
    ['Scatterplot of each model’s performance vs its number of trainable variables. Hover over a point to see the GNN architecture parameters.',
      '各模型性能与可训练变量数量之间的散点图。把鼠标停留在某个点上，即可查看该图神经网络的结构参数。'],
    ['Aggregate performance of models across varying node, edge, and global dimensions.',
      '在不同节点维度、边维度与全局维度下，各模型性能的汇总结果。'],
    ['Chart of number of layers vs model performance, and scatterplot of model performance vs number of parameters. Each point is colored by the number of layers. Hover over a point to see the GNN architecture parameters.',
      '层数与模型性能的图表，以及模型性能与参数数量的散点图。每个点依据层数着色。把鼠标停留在某个点上，即可查看该图神经网络的结构参数。'],
    ['Chart of aggregation type vs model performance, and scatterplot of model performance vs number of parameters. Each point is colored by aggregation type. Hover over a point to see the GNN architecture parameters.',
      '聚合类型与模型性能的图表，以及模型性能与参数数量的散点图。每个点依据聚合类型着色。把鼠标停留在某个点上，即可查看该图神经网络的结构参数。'],
    ['Chart of message passing vs model performance, and scatterplot of model performance vs number of parameters. Each point is colored by message passing. Hover over a point to see the GNN architecture parameters',
      '消息传递与模型性能的图表，以及模型性能与参数数量的散点图。每个点依据消息传递方式着色。把鼠标停留在某个点上，即可查看该图神经网络的结构参数'],
    ['Schematic of more complex graphs. On the left we have an example of a multigraph with three edge types, including a directed edge. On the right we have a three-level hierarchical graph, the intermediate level nodes are hypernodes.',
      '更复杂图的示意图。左侧是一个包含三种边类型（其中含一条有向边）的多重图示例。右侧是一个三层的层次图，中间一层的节点就是超节点。'],
    ['Four different ways of sampling the same graph. Choice of sampling strategy depends highly on context since they will generate different distributions of graph statistics (# nodes, #edges, etc.). For highly connected graphs, edges can be also subsampled.',
      '对同一张图进行采样的四种不同方式。采样策略的选择高度依赖具体情境，因为不同策略会产生不同的图统计量分布（节点数、边数等）。对于连接非常密集的图，边同样可以再做子采样。'],
    ['Schematic of attention over one node with respect to it’s adjacent nodes. For each edge an interaction score is computed, normalized and used to weight node embeddings.',
      '某个节点相对其相邻节点的注意力示意图。对每条边计算一个交互得分，加以归一化之后用来为节点嵌入加权。'],
    ['Schematic of some explanability techniques on graphs. Attributions assign ranked values to graph attributes. Rankings can be used as a basis to extract connected subgraphs that might be relevant to a task.',
      '图上的若干可解释性技术示意图。归因方法为图的各个属性赋予带排序的数值。这些排序可以作为依据，用来抽取可能对任务有意义的连通子图。'],

    // —— 页脚与复用说明 ——
    ['If you see mistakes or want to suggest changes, please ', '如果你发现错误，或者希望提出修改建议，请'],
    ['create an issue on GitHub,', '在 GitHub 上创建问题单'],
    ['Diagrams and text are licensed under Creative Commons Attribution ', '图表与文字依据知识共享署名许可协议授权，即'],
    ['CC-BY 4.0,', 'CC-BY 4.0'],
    ['source available on GitHub,', '源代码可在 GitHub 上获取'],
    [', unless noted otherwise. The figures that have been reused from other sources don’t fall under this license and can be recognized by a note in their caption: “Figure from …”.',
      '，除非另有说明。从其他来源复用的图不在此许可范围之内，可以通过图注中的说明“Figure from …”辨认出来。'],
    ['For attribution in academic contexts, please cite this work as', '在学术场合引用时，请按如下格式标注出处'],
    ['BibTeX citation', 'BibTeX 引用'],
    ['is dedicated to clear explanations of machine learning', '致力于清晰讲解机器学习'],

    // —— 第三轮补全：界面标签、图注尾句与文末散段 ——
    ['Affiliations', '所属机构'],
    ['Three types of attributes we might find in a graph, hover over to highlight each attribute. Other types of graphs and attributes are explored in the',
      '图中可能出现的三类属性，把鼠标停留在图上即可高亮其中每一类。其他类型的图与属性会在'],
    ['Other types of graphs', '其他类型的图'],
    ['section.', '小节中讨论。'],
    ['There are other related tasks that are areas of active research. For instance, we might want to',
      '还有一些相关任务正处于活跃研究之中。举例来说，我们可能想要'],
    ['generate graphs', '生成图'],
    [', or', '，或者'],
    ['explain predictions on a graph', '解释图上的预测'],
    ['. More topics can be found in the', '。更多主题可以在'],
    ['Into the weeds section', '深入细节小节'],
    ['Edge level task', '边级任务'],
    ['Global Average Pooling', '全局平均池化'],

    // —— 比较各种聚合运算：整节点即一句话的小节 ——
    ['Selecting and designing optimal aggregation operations is an open research topic.',
      '如何挑选并设计最优的聚合运算，仍是一个开放的研究课题。'],
    ['No pooling type can always distinguish between graph pairs such as max pooling on the left and sum / mean pooling on the right.',
      '没有任何一种池化方式能够始终区分左图与右图这样的图对，例如左侧用最大值池化，右侧用求和或者均值池化。'],
    ['Designing aggregation operations is an open research problem that intersects with machine learning on sets.',
      '设计聚合运算是一个开放的研究问题，它与集合上的机器学习相互交叉。'],
    ['New approaches such as Principal Neighborhood aggregation',
      '诸如主邻域聚合（Principal Neighborhood Aggregation）这样的新做法'],
  ];

  // 片段替换只接受足够长的句子；短连接词一律走整节点精确匹配，
  // 否则会把英文正文里同形的普通词组一并改写，造成中英混排。
  const MIN_PHRASE = 24;
  const SORTED = PHRASES.filter(([en]) => en.length >= MIN_PHRASE)
    .sort((a, b) => b[0].length - a[0].length);

  // 短词条（小节标题、界面标签）走整节点精确匹配：只有文本节点与词条完全一致时才替换。
  // 这类词条达不到片段替换的长度下限，若不并入 EXACT 就等于从未生效。
  for (const [en, zh] of PHRASES) {
    const key = en.trim();
    if (key.length < MIN_PHRASE && key && !EXACT.has(key)) EXACT.set(key, zh);
  }

  // 长句匹配对空白宽容：原文里同一个句子可能夹着窄空格（U+2009）、双空格等
  // 不可见差异，逐字照抄的词条极易失配，因此把词条里的空白统一当成 \s+ 处理。
  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 词条两端的空白在比对前先去掉：文本节点会被 trim 后再比对，
  // 词条若保留首尾空格，正则里的 \s+ 就会要求一个并不存在的空白，导致永不命中。
  const flexible = (text) => new RegExp(escapeRegExp(text.trim()).replace(/\s+/g, '\\s+'), 'g');
  const FLEX = SORTED.map(([en, zh]) => [flexible(en), zh]);
  const anchored = (text) => new RegExp('^' + escapeRegExp(text.trim()).replace(/\s+/g, '\\s+'));

  // 小节起始短语：文本节点以它开头时，只替换这一段前缀，正文照旧走长句规则。
  const LEADINS = new Map(Object.entries({
    'Molecules as graphs.': '分子作为图。',
    'Social networks as graphs.': '社交网络作为图。',
    'Citation networks as graphs.': '引用网络作为图。',
    'Other examples.': '其他例子。',
  }));

  // 整段替换：文本节点以该句首开头时，整体换成中文。
  // 用句首前缀做锚，避免逐字照抄含窄空格与破折号的长句而失配。
  const PARAGRAPHS = [
    ['The structure of real-world graphs can vary greatly',
      '真实世界中，图的结构在不同数据类型之间差别很大：有些图的节点很多，彼此之间的连接却很少，反过来也有。无论在同一份数据集内部，还是在不同数据集之间，节点数量、边的数量以及节点的连接程度都可能存在很大差异。'],
    // —— 哪些问题会用到图结构数据 ——
    ['We have described some examples of graphs in the wild, but what tasks do we want to perform on this data?',
      '我们已经在真实世界里看了一些图的例子，那么在这类数据上要完成哪些任务呢？图上的预测任务大体分三类：图级、节点级与边级。'],
    ['In a graph-level task, we predict a single property for a whole graph.',
      '图级任务为整张图预测一个属性。节点级任务为图中的每个节点预测某种属性。边级任务则要预测边的属性，或者预测边是否存在。'],
    ['For the three levels of prediction problems described above',
      '上面这三类预测问题（图级、节点级、边级），接下来我们会说明：它们都能用同一类模型来求解，也就是图神经网络。不过先让我们更仔细地走一遍这三类图预测问题，并给出各自的具体例子。'],
    ['In a graph-level task, our goal is to predict the property of an entire graph.',
      '图级任务的目标是预测整张图的属性。举例来说，对于用图表征的分子，我们可能想预测它闻起来是什么气味，或者它能否与某种与疾病相关的受体结合。'],
    ['This is analogous to image classification problems with MNIST and CIFAR,',
      '这类似于 MNIST 与 CIFAR 上的图像分类问题：我们要给整张图像关联一个标签。放到文本上，类似的问题是情感分析：我们要一次性判断整句话的情绪或者情感。'],
    ['Node-level tasks are concerned with predicting the identity or role of each node within a graph.',
      '节点级任务关心的是预测图中每个节点的身份或者角色。'],
    ['The dataset is a single social network graph made up of individuals that have sworn allegiance',
      '该数据集是一张社交网络图，由一群在政治分歧之后宣誓效忠两个空手道俱乐部之一的成员组成。按照故事的说法，Hi 先生（教练）与 John H（管理员）之间的不和，让这个空手道俱乐部出现分裂。节点代表每位空手道练习者，边代表这些成员在空手道之外的往来。预测问题就是判断某位成员在这场不和之后效忠于 Hi 先生还是 John H。在这个例子里，节点到教练或者管理员的距离，与这个标签高度相关。'],
    // 这两句里“image segmentation”“edge prediction”本身是行内链接，
    // 段落因此被切成多个文本节点，只能按片段对齐。
    ['Following the image analogy, node-level prediction problems are analogous to ',
      '沿用图像的类比，节点级预测问题类似于'],
    [', where we are trying to label the role of each pixel in an image. With text, a similar task would be predicting the parts-of-speech of each word in a sentence (e.g. noun, verb, adverb, etc).',
      '：我们要为图像中的每个像素标注它扮演的角色。放到文本上，类似的任务是预测句子中每个词的词性（例如名词、动词、副词等）。'],
    ['The remaining prediction problem in graphs is ',
      '图上剩下的预测问题是'],
    ['One example of edge-level inference is in image scene understanding.',
      '边级推理的一个例子出现在图像场景理解里。除了识别图像中的对象，深度学习模型还可以用来预测它们之间的关系。我们可以把它表述为一次边级分类：给定代表图像中对象的节点，我们想要预测哪些节点之间存在边，或者这条边的取值是多少。如果我们希望发现实体之间的联系，可以先假定整张图全连接，再依据预测值剪掉一部分边，从而得到一张稀疏的图。'],
    // —— 在机器学习中使用图所面临的挑战 ——
    ['So, how do we go about solving these different graph tasks',
      '那么，我们要怎样用神经网络来求解这些不同的图任务呢？第一步是考虑如何表示图，才能与神经网络相兼容。'],
    ['Machine learning models typically take rectangular',
      '机器学习模型通常接收矩形或者网格状的数组作为输入。因此，如何把图表示成与深度学习相兼容的格式，并不是一眼就能看出来的。图最多包含四类信息，我们都可能用来做预测：节点、边、全局上下文与连接关系。前三类相对直白：举例来说，针对节点，我们可以构造一个节点特征矩阵 '],
    ['Another problem is that there are many adjacency matrices',
      '另一个问题在于，能够表达同一种连接关系的邻接矩阵有很多个，而这些不同的矩阵在深度神经网络里未必给出相同的结果（也就是说，它们不具备置换不变性）。'],
    ['The example below shows every adjacency matrix',
      '下面这个例子列出了能够描述这张四节点小图的全部邻接矩阵。这个数量已经相当可观；换成奥赛罗那样更大的例子，数量就完全无法承受了。'],
    ['One elegant and memory-efficient way of representing sparse matrices',
      '一种既优雅又节省内存的稀疏矩阵表示方式是邻接表。邻接表刻画边 '],
    ['To make this notion concrete, we can see how information',
      '为了让这个概念落到实处，我们来看看按照这套约定，不同图里的信息可以怎样表示：'],
    ['It should be noted that the figure uses scalar values per node/edge/global',
      '需要说明的是，图中每个节点、每条边、每个全局量都只取标量值，而多数实用的张量表示会为每个图属性配备向量。因此，我们面对的不再是大小为 '],
    // —— 图神经网络 ——
    ['Now that the graph’s description is in a matrix format that is permutation invariant',
      '既然图的描述已经转换为对排列保持不变的矩阵格式，接下来我们说明如何运用图神经网络（GNN）来完成图上的预测任务。 '],
    ['This GNN uses a separate multilayer perceptron',
      '这种图神经网络为图的每个组成部分配一个独立的多层感知机（或者你惯用的可微模型），我们把它称作图神经网络层。对每个节点向量施加多层感知机，就得到学习后的节点向量；对每条边同样处理，学到逐边的嵌入；对全局上下文向量也照此处理，为整张图学到一个嵌入。'],
    ['For simplicity, the previous diagrams used scalars',
      '为了简明起见，前面几张示意图都用标量来表示图属性；而在实践中，特征向量（也就是嵌入）要有用得多。'],
    ['You could also call it a GNN block.',
      '你也可以把它称作图神经网络块，因为它包含多个运算或者层，类似 ResNet 里的残差块。'],
    ['As is common with',
      '与神经网络模块或者层的常见做法一样，我们可以把这些图神经网络层叠加起来。'],
    ['Because a GNN does not update the connectivity',
      '由于图神经网络不会改变输入图的连接关系，输出图可以用与输入图相同的邻接表、相同数量的特征向量来描述。不过，输出图的嵌入已经更新，因为网络更新了节点、边与全局上下文这三类表示。'],
    ['We have built a simple GNN, but how do we make predictions',
      '我们已经搭好一个简单的图神经网络，那么在上面提到的那些任务里，又要怎样做出预测呢？'],
    ['We will consider the case of binary classification',
      '我们以二元分类为例，这套框架也很容易推广到多分类或者回归的情形。如果任务是对节点做二元预测，而图中已经含有节点信息，做法就很直接：对每个节点嵌入施加一个线性分类器。'],
    ['However, it is not always so simple.',
      '不过，事情并不总是这么简单。举例来说，图里的信息可能存在边上，节点上却没有信息，而你依然需要预测节点。这时就需要一种办法，把边上的信息收集起来交给节点用于预测。我们可以借助 '],
    ['We represent the', '我们把'],
    ['operation by the letter', '操作记作字母'],
    [', and denote that we are gathering information from edges to nodes as', '，并把从边向节点收集信息记作'],
    ['So If we only have edge-level features, and are trying to predict binary node information, we can use pooling to route (or pass) information to where it needs to go. The model looks like this.',
      '所以，如果我们手里只有边级特征，却要预测节点的二元信息，就可以借助池化把信息路由（也就是传递）到需要它的地方。模型大致是这样：'],
    ['If we only have node-level features, and are trying to predict binary edge-level information, the model looks like this.',
      '如果我们手里只有节点级特征，却要预测边的二元信息，模型大致是这样：'],
    ['If we only have node-level features, and need to predict a binary global property, we need to gather all available node information together and aggregate them. This is similar to ',
      '如果我们手里只有节点级特征，却需要预测一个全局的二元属性，就要把可用的节点信息全部收集到一起再聚合。这类似于卷积网络里的'],
    [' layers in CNNs. The same can be done for edges.',
      '层。对边也可以照此处理。'],
    ['This is a common scenario for predicting molecular properties. For example, we have atomic information, connectivity and we would like to know the toxicity of a molecule (toxic/not toxic), or if it has a particular odor (rose/not rose).',
      '预测分子属性时经常遇到这种情形。举例来说，我们掌握了原子信息与连接关系，想知道某个分子是否有毒（有毒或者无毒），或者它是否带有某种气味（玫瑰香或者非玫瑰香）。'],
    ['In our examples, the classification model', '在我们的例子里，分类模型'],
    ['can easily be replaced with any differentiable model, or adapted to multi-class classification using a generalized linear model.',
      '可以很容易地换成任何可微模型，也可以用广义线性模型改造成多分类。'],
    ['Now we’ve demonstrated that we can build a simple GNN model, and make binary predictions by routing information between different parts of the graph. This pooling technique will serve as a building block for constructing more sophisticated GNN models. If we have new graph attributes, we just have to define how to pass information from one attribute to another.',
      '至此我们演示了如何搭建一个简单的图神经网络模型，并借助在图的不同部分之间路由信息来完成二元预测。这套池化技巧会成为构建更精细模型的积木。当我们引入新的图属性时，只需要定义信息如何从一种属性传递到另一种属性。'],
    ['Note that in this simplest GNN formulation, we’re not using the connectivity of the graph at all inside the GNN layer. Each node is processed independently, as is each edge, as well as the global context. We only use connectivity when pooling information for prediction.',
      '请注意，在最简形式的图神经网络里，层内完全没有用到图的连接关系：每个节点、每条边以及全局上下文都各自独立处理。只有为预测做信息池化时，我们才用到连接关系。'],
    // —— 在图的不同部分之间传递消息 ——
    ['We could make more sophisticated predictions by using pooling within the GNN layer',
      '我们可以把池化放进图神经网络层内部，让学到的嵌入感知图的连接关系，从而做出更精细的预测。要做到这一点，可以用 '],
    [', where neighboring nodes or edges exchange information and influence each other’s updated embeddings.',
      '：相邻的节点或者边彼此交换信息，并相互影响各自更新后的嵌入。'],
    ['Message passing works in three steps: ',
      '消息传递分三步进行：'],
    ['For each node in the graph, ', '对图中的每个节点，'],
    [' all the neighboring node embeddings (or messages), which is the ', '收集全部相邻节点的嵌入（也就是消息），这正是前文所述的 '],
    [' function described above.', ' 函数。'],
    ['Aggregate all messages via an aggregate function (like sum).',
      '用一个聚合函数（例如求和）把所有消息聚合起来。'],
    ['All pooled messages are passed through an ', '所有池化后的消息都会经过 '],
    [', usually a learned neural network.', '，它通常是一个可学习的神经网络。'],
    ['You could also 1) gather messages, 3) update them and 2) aggregate them and still have a permutation invariant operation.',
      '你也可以按先收集消息、再更新、最后聚合的顺序进行，得到的运算同样具备置换不变性。'],
    ['Just as pooling can be applied to either nodes or edges, message passing can occur between either nodes or edges.',
      '正如池化既可以作用于节点也可以作用于边，消息传递同样既可以在节点之间进行，也可以在边之间进行。'],
    ['These steps are key for leveraging the connectivity of graphs. We will build more elaborate variants of message passing in GNN layers that yield GNN models of increasing expressiveness and power.',
      '这几个步骤是把图的连接关系真正用起来的关键。我们会在图神经网络层里逐步搭建更精巧的消息传递变体，让模型的表达能力与威力随之提升。'],
    ['This sequence of operations, when applied once, is the simplest type of message-passing GNN layer.',
      '这套运算执行一次，就构成最简单的一种消息传递图神经网络层。'],
    ['This is reminiscent of standard convolution: in essence, message passing and convolution are operations to aggregate and process the information of an element’s neighbors in order to update the element’s value. In graphs, the element is a node, and in images, the element is a pixel. However, the number of neighboring nodes in a graph can be variable, unlike in an image where each pixel has a set number of neighboring elements.',
      '这让人联想到标准的卷积：本质上，消息传递与卷积都在做同一件事——汇聚并处理某个元素的邻居信息，用来更新这个元素自身的值。在图里，这个元素是节点；在图像里，这个元素是像素。区别在于，图中相邻节点的数量可以变化，而图像里每个像素的邻居数量固定不变。'],
    // —— 学习边的表示 ——
    ['Our dataset does not always contain all types of information (node, edge, and global context). When we want to make a prediction on nodes, but our dataset only has edge information, we showed above how to use pooling to route information from edges to nodes, but only at the final prediction step of the model. We can share information between nodes and edges within the GNN layer using message passing.',
      '我们的数据集并不总是同时包含各类信息（节点、边与全局上下文）。当我们想预测节点，而数据集里只有边的信息时，前面已经演示过如何用池化把信息从边路由到节点，但那只能发生在模型的最后预测步骤。借助消息传递，我们可以在图神经网络层内部就让节点与边共享信息。'],
    ['We can incorporate the information from neighboring edges in the same way we used neighboring node information earlier, by first pooling the edge information, transforming it with an update function, and storing it.',
      '我们可以像先前使用相邻节点信息那样，把相邻边的信息也纳入进来：先池化边的信息，用更新函数加以变换，然后存储起来。'],
    ['However, the node and edge information stored in a graph are not necessarily the same size or shape, so it is not immediately clear how to combine them. One way is to learn a linear mapping from the space of edges to the space of nodes, and vice versa. Alternatively, one may concatenate them together before the update function.',
      '不过，图中存储的节点信息与边信息未必具有相同的长度或者形状，因此如何把它们结合起来并非一眼可见。一种做法是学习一个从边空间到节点空间的线性映射，反过来亦然；另一种做法是在送入更新函数之前把它们拼接起来。'],
    ['By stacking message passing GNN layers together, a node can eventually incorporate information from across the entire graph',
      '把消息传递的图神经网络层叠加起来，一个节点最终就能把整张图的信息都纳入进来：经过三层之后，节点便掌握了与它相距三步的节点信息。'],
    ['We can update our architecture diagram to include this new source of information for nodes:',
      '我们可以更新架构示意图，把这种新的节点信息来源也画进去：'],
    ['Which graph attributes we update and in which order we update them is one design decision when constructing GNNs.',
      '在搭建图神经网络时，更新哪些图属性、按什么顺序更新，是一项设计决策。我们可以选择先更新节点嵌入再更新边嵌入，也可以反过来。这是一个仍在探索的方向，做法多种多样——例如可以采用“编织”式更新：'],
    [' where we have four updated representations that get combined into new node and edge representations: node to node (linear), edge to edge (linear), node to edge (edge layer), edge to node (node layer).',
      ' 四组更新后的表示组合成新的节点与边表示，也就是节点到节点（线性）、边到边（线性）、节点到边（边层）、边到节点（节点层）。'],
    ['There is one flaw with the networks we have described so far',
      '到目前为止介绍的这些网络存在一个缺陷：在图中相距很远的节点，即便多次施加消息传递，也可能始终无法高效地互相传递信息。对某个节点而言，若网络有 k 层，信息最多只能传播 k 步远。当预测任务依赖相距很远的节点或者节点群时，这会成为问题。一种解决办法是让所有节点都能互相传递信息。遗憾的是，对大规模图而言，这样做很快会变得计算昂贵——不过这种被称为“虚拟边”的做法，已经在分子这样的小图上得到应用。'],
    ['One solution to this problem is by using the global representation of a graph (U) which is sometimes called a ',
      '解决这个问题的一种办法是使用图的全局表示（U），它有时也被称作 '],
    [' or context vector. This global context vector is connected to all other nodes and edges in the network, and can act as a bridge between them to pass information, building up a representation for the graph as a whole. This creates a richer and more complex representation of the graph than could have otherwise been learned.',
      ' 或者上下文向量。这个全局上下文向量与网络中所有其他节点和边相连，可以在它们之间充当传递信息的桥梁，逐步构建出整张图的表示。与不做这件事相比，这样能得到更丰富、更复杂的图表征。'],
    // —— 引入全局表示：条件化 ——
    ['In this view all graph attributes have learned representations',
      '在这个视角下，所有图属性都拥有学到的表示，因此我们可以在池化时把它们用起来：让所关注属性的信息相对其余属性做条件化。举例来说，针对某个节点，我们可以同时考虑相邻节点、相连的边以及全局信息。要让新的节点嵌入在这些可能的信息来源上完成条件化，最简单的做法是把它们拼接起来；此外，我们也可以用一个线性映射把它们映射到同一空间后相加，或者施加一个特征级调制层'],
    [', which can be considered a type of featurize-wise attention mechanism.',
      '，后者可以看作一种特征级注意力机制。'],
    // —— 图神经网络演练场 ——
    ['We’ve described a wide range of GNN components here, but how do they actually differ in practice?',
      '我们在这里介绍了相当丰富的图神经网络组件，那么它们在实际中究竟有多大差别？这个图神经网络演练场可以让你看到，这些不同的组件与结构如何影响模型学习真实任务的能力。'],
    ['Our playground shows a graph-level prediction task with small molecular graphs. We use the the Leffingwell Odor Dataset',
      '我们的演练场展示一项图级预测任务，使用的是小型分子图。我们采用 Leffingwell 气味数据集'],
    [', which is composed of molecules with associated odor percepts (labels). Predicting the relation of a molecular structure (graph) to its smell is a 100 year-old problem straddling chemistry, physics, neuroscience, and machine learning.',
      '，它由分子以及与之关联的气味感知（标签）组成。把分子结构（图）与气味联系起来加以预测，是一个跨越化学、物理、神经科学与机器学习的百年问题。'],
    ['To simplify the problem, we consider only a single binary label per molecule, classifying if a molecular graph smells “pungent” or not, as labeled by a professional perfumer. We say a molecule has a “pungent” scent if it has a strong, striking smell. For example, garlic and mustard, which might contain the molecule',
      '为了简化问题，我们对每个分子只保留一个二元标签：依据专业调香师的标注，判断该分子图闻起来是否“刺鼻”。如果一种分子拥有强烈而突出的气味，我们就说它带有“刺鼻”气味。举例来说，大蒜与芥末可能含有分子'],
    [' have this quality. The molecule', '，它们就具备这种特征。而常用于薄荷口味糖果的分子'],
    [', often used for peppermint-flavored candy, is also described as having a pungent smell.',
      '同样被描述为带有刺鼻气味。'],
    ['We represent each molecule as a graph, where atoms are nodes containing a one-hot encoding for its atomic identity',
      '我们把每个分子表示成一张图：原子是节点，节点上携带原子身份（碳、氮、氧、氟）的独热编码；化学键是边，边上携带键型（单键、双键、三键或者芳香键）的独热编码。'],
    ['Our general modeling template for this problem will be built up using sequential GNN layers',
      '这类问题的一般建模模板由若干顺序排列的图神经网络层构成，最后接一个带 sigmoid 激活的线性模型完成分类。图神经网络的设计空间里有不少可以调节模型的旋钮：'],
    ['To better understand how a GNN is learning a task-optimized representation of a graph',
      '为了更好地理解图神经网络如何学到面向任务的图表征，我们还会观察网络倒数第二层的激活值。这些“图嵌入”是模型在预测之前的输出。由于预测用的是广义线性模型，一次线性映射就足以让我们看清，模型是如何在决策边界附近学到表示的。'],
    ['Since these are high dimensional vectors, we reduce them to 2D via principal component analysis (PCA).',
      '由于这些向量维度很高，我们用主成分分析（PCA）把它们降到二维。完美的模型会把不同标签的数据清晰地分开；不过我们既做了降维，模型本身也不完美，因此这条边界可能不那么容易看清。'],
    ['Play around with different model architectures to build your intuition.',
      '不妨动手折腾不同的模型结构，借此建立直觉。举例来说，你可以试着编辑左侧的分子，看能否让模型的预测值上升；再换一种模型结构，同样的修改是否会带来同样的影响？'],
    // —— 演练场的设计旋钮（列表项） ——
    ['The number of GNN layers, also called the ',
      '图神经网络的层数，也叫'],
    ['The dimensionality of each attribute when updated.',
      '每个属性在更新之后的维度。更新函数是一层多层感知机，采用 ReLU 激活函数，并用层归一化来规范化激活值。'],
    ['The aggregation function used in pooling: max, mean or sum.',
      '池化所使用的聚合函数：最大值、均值或者求和。'],
    ['The graph attributes that get updated, or styles of message passing:',
      '哪些图属性会被更新，也就是消息传递的形式：节点、边与全局表示。我们用布尔开关（开或者关）来控制它们。一个基线模型是与图结构无关的图神经网络（关闭全部消息传递），它在最后把所有数据聚合为单一的全局属性。把全部消息传递功能打开，就得到 GraphNets 结构。'],
    // —— 图神经网络设计的一些经验 ——
    ['When exploring the architecture choices above,',
      '在探索上面这些结构选择时，你可能已经发现有些模型的性能更好。有没有一些明确的图神经网络设计选择能带来更好的性能？比如更深的模型是否比更浅的更好，聚合函数之间有没有明确的最优选择？答案取决于数据，'],
    [', and even different ways of featurizing and constructing graphs can give different answers.',
      '，甚至不同的特征化方式与构图方式都会给出不同的答案。'],
    ['With the following interactive figure, we explore the space of GNN architectures',
      '在下面这张交互式图里，我们考察图神经网络的结构空间，以及这项任务在几个主要设计选择下的表现：消息传递的形式、嵌入的维度、层数，以及聚合操作的类型。'],
    ['Each point in the scatter plot represents a model:',
      '散点图里的每个点代表一个模型：横轴是可训练变量的数量，纵轴是性能。把鼠标停留在某个点上，就能看到该模型的结构参数。'],
    ['The first thing to notice is that, surprisingly, a higher number of parameters does correlate with higher performance.',
      '首先值得注意的是，参数越多性能确实越好，这一点有些出乎意料。图神经网络是一类非常节省参数的模型：即便参数很少（三千个），我们也能找到性能很高的模型。'],
    ['Next, we can look at the distributions of performance aggregated based on the dimensionality',
      '接下来，我们按不同图属性所学表示的维度，来看性能分布的聚合结果。'],
    ['We can notice that models with higher dimensionality tend to have better mean and lower bound performance',
      '可以发现，维度更高的模型在均值与下界上往往表现更好，但最大值上并没有同样的趋势：一些表现最好的模型出现在较小的维度上。由于更高的维度也意味着更多的参数，这些观察与上一张图互相印证。'],
    ['Next we can see the breakdown of performance based on the number of GNN layers.',
      '接着我们按图神经网络的层数来拆解性能。'],
    ['The box plot shows a similar trend,',
      '箱线图显示出类似的趋势：平均性能随层数增加而提升，但表现最好的模型并不是三层或者四层，而是两层。此外，四层时性能的下界反而下降。这种现象此前也被观察到——层数更多的图神经网络会把信息传播到更远的地方，同时也有让节点表示在许多次迭代中被“稀释”的风险'],
    ['Does our dataset have a preferred aggregation operation?',
      '我们的数据集是否偏好某种聚合操作？下面这张图按聚合类型拆解性能。'],
    ['Overall it appears that sum has a very slight improvement on the mean performance,',
      '总体来看，求和让平均性能略微提升，但最大值与均值也能给出同样好的模型。把它放到聚合操作的'],
    [' of aggregation operations .', '能力的语境里看，会更有帮助。'],
    ['The previous explorations have given mixed messages.',
      '前面的探索给出的信号并不一致：我们能找到“越复杂越好”的平均趋势，也能找到明确的反例，即参数更少、层数更少或者维度更低的模型反而表现更好。有一条趋势要清晰得多，就是有多少种属性在彼此传递信息。'],
    ['Here we break down performance based on the style of message passing.',
      '这里我们按消息传递的形式拆解性能。两个极端分别是：图实体之间完全不通信（“none”），以及节点、边与全局量之间都传递消息。'],
    ['Overall we see that the more graph attributes are communicating,',
      '总体来看，参与通信的图属性越多，模型的平均性能越好。我们的任务围绕全局表示展开，因此显式学习这一属性往往也能提升性能。节点表示似乎也比边表示更有用，这很合理，因为节点上装载的信息更多。'],
    ['There are many directions you could go from here to get better performance.',
      '从这里出发，还有很多方向可以提升性能。我们想强调两条大方向：一条与更精巧的图算法有关，另一条则指向图本身。'],
    ['Up until now, our GNN is based on a neighborhood-based pooling operation.',
      '到目前为止，我们的图神经网络都建立在基于邻域的池化运算之上。有些图概念很难用这种方式表达，例如一条线性图路径（一串相连的节点）。设计新的机制，让图信息能够在图神经网络中被提取、执行与传播，是当前的一个研究方向'],
    ['One of the frontiers of GNN research is not making new models and architectures,',
      '图神经网络研究的前沿之一，并不是造出更多新模型与新结构，而是“如何构图”——更准确地说，是给图赋予可以被利用的额外结构或者关系。正如我们粗略看到的，参与通信的图属性越多，模型往往越好。就这个具体任务而言，我们可以让分子图的信息更丰富：在节点之间加入额外的空间关系，加入并非化学键的边，或者在子图之间建立显式的可学习关系。'],
    ['See more in ', '更多内容请见'],
    // —— 深入细节：其他类型的图 ——
    ['Next, we have a few sections on a myriad of graph-related topics',
      '接下来，我们用几节篇幅讨论与图神经网络有关的各种图论主题。'],
    ['While we only described graphs with vectorized information for each attribute',
      '前面我们只讨论了每个属性都带向量信息的图，而图结构本身更加灵活，能够承载其他类型的信息。好在消息传递框架足够灵活：要把图神经网络适配到更复杂的图结构，往往只需要定义新图属性上的信息如何传递与更新。'],
    ['For example, we can consider multi-edge graphs or ', '举例来说，我们可以考虑多重边图，也就是'],
    [', where a pair of nodes can share multiple types of edges, this happens when we want to model the interactions between nodes differently based on their type. For example with a social network, we can specify edge types based on the type of relationships (acquaintance, friend, family). A GNN can be adapted by having different types of message passing steps for each edge type. We can also consider nested graphs, where for example a node represents a graph, also called a hypernode graph. ',
      '，其中一对节点之间可以存在多种类型的边；当我们希望按类型区分节点之间的交互时，就属于这种情况。仍以社交网络为例，我们可以依据关系类型（相识、朋友、家人）来指定边的类型。只要为每种边类型配一套消息传递步骤，图神经网络就能适配。我们还可以考虑嵌套图，例如用一个节点代表一张图，这类结构也叫超节点图。'],
    [' Nested graphs are useful for representing hierarchical information. For example, we can consider a network of molecules, where a node represents a molecule and an edge is shared between two molecules if we have a way (reaction) of transforming one to the other ',
      ' 嵌套图很适合表示层级信息。例如我们可以设想一张分子网络：节点代表分子，若两个分子之间存在相互转化的途径（反应），就在它们之间连一条边。'],
    ['.\nIn this case, we can learn on a nested graph by having a GNN that learns representations at the molecule level and another at the reaction network level, and alternate between them during training.',
      ' 这种情况下，可以在一张嵌套图上学习：用一个图神经网络在分子层面学表示，用另一个在反应网络层面学表示，训练时交替更新。'],
    ['Another type of graph is a hypergraph',
      '另一种类型的图是超图'],
    [', where an edge can be connected to multiple nodes instead of just two. For a given graph, we can build a hypergraph by identifying communities of nodes and assigning a hyper-edge that is connected to all nodes in a community.',
      '，它的一条边可以连接多个节点，而不止两个。给定一张图，我们可以通过识别节点社区，并给每个社区分配一条连接该社区全部节点的超边，从而构建超图。'],
    ['How to train and design GNNs that have multiple types of graph attributes is a current area of research',
      '如何训练与设计带有多种图属性的图神经网络，是当前的一个研究领域'],
    // —— 深入细节：图采样与分批 ——
    ['A common practice for training neural networks is to update network parameters',
      '训练神经网络时常见的一种做法，是在训练数据中随机抽取固定规模（批大小）的子集，用这些小批量上算出的梯度来更新网络参数。对图而言，这种做法会碰上麻烦：节点与边的数量彼此不一，我们无法保持固定的批大小。图分批的核心思路，是构造能够保留大图关键性质的子图。这种图采样操作高度依赖具体情境，涉及从图中挑选部分节点与边。在某些情境下（例如引用网络）这样做合理，而在另一些情境下可能过于激进（例如分子，子图就意味着一个更小的新分子）。如何采样一张图，仍是一个开放的研究问题'],
    [' \nIf we care about preserving structure at a neighborhood level, one way would be to randomly sample a uniform number of nodes, our ',
      ' 如果我们在意的是保留邻域层面的结构，一种做法是随机抽取数量固定的节点，也就是我们的'],
    ['. Then add neighboring nodes of distance k adjacent to the node-set, including their edges.',
      '。随后把与这个节点集相距 k 步的邻居节点连同它们的边一起加入。'],
    [' Each neighborhood can be considered an individual graph and a GNN can be trained on batches of these subgraphs. The loss can be masked to only consider the node-set since all neighboring nodes would have incomplete neighborhoods. A more efficient strategy might be to first randomly sample a single node, expand its neighborhood to distance k, and then pick the other node within the expanded set. These operations can be terminated once a certain amount of nodes, edges, or subgraphs are constructed. If the context allows, we can build constant size neighborhoods by picking an initial node-set and then sub-sampling a constant number of nodes (e.g randomly, or via a random walk or Metropolis algorithm',
      ' 每个邻域都可以当作一张独立的图，图神经网络可以在这类子图的批次上训练。由于所有相邻节点的邻域都不完整，损失可以加掩码，只考虑这个节点集。还有一种更高效的做法：先随机抽取一个节点，把它的邻域扩展到 k 步，再在扩展后的集合里挑选另一个节点。当构造出足够数量的节点、边或者子图之后，就可以停止。若情境允许，我们可以先选定一个初始节点集，再从中抽取固定数量的节点（例如随机抽取，或者采用随机游走、Metropolis 算法），从而构造出规模恒定的邻域'],
    [').', '）。'],
    ['Sampling a graph is particularly relevant when a graph is large enough that it cannot be fit in memory.',
      '当一张图大到装不进内存时，图采样就尤其重要；它也催生了 Cluster-GCN '],
    [' and GraphSaint ', ' 与 GraphSaint '],
    ['. We expect graph datasets to continue growing in size in the future.',
      ' 这类新的结构与训练策略。我们预计图数据集在未来会继续变大。'],
    // —— 深入细节：归纳偏置 ——
    ['When building a model to solve a problem on a specific kind of data,',
      '针对某一类特定数据构建模型时，我们希望模型能够专门利用这类数据的特性。这件事做得好，通常就会看到更好的预测性能、更短的训练时间、更少的参数以及更好的泛化。'],
    ['When labeling on images, for example, we want to take advantage of the fact that a dog is still a dog',
      '以图像标注为例，我们希望利用这样一个事实：无论一只狗位于图像的左上角还是右下角，它仍然是狗。因此多数图像模型采用具有平移不变性的卷积。对文本而言，词元的顺序至关重要，所以循环神经网络按顺序处理数据。更进一步，一个词元（例如“not”）的出现会影响整句其余部分的含义，因此我们需要能够“关注”文本其他部分的组件，BERT 与 GPT-3 这类 Transformer 模型就能做到。这些都是归纳偏置的例子：我们从数据中找出对称性或者规律，并加入相应的建模组件来利用这些性质。'],
    ['In the case of graphs, we care about how each graph component (edge, node, global) is related to each other',
      '就图而言，我们关心各个图组成部分（边、节点、全局量）之间的关系，因此希望模型带有关系型归纳偏置。'],
    [' A model should preserve explicit relationships between entities (adjacency matrix) and preserve graph symmetries (permutation invariance).',
      ' 模型应当保留实体之间显式的关系（邻接矩阵），并保留图的对称性（置换不变性）。我们预期，实体之间交互重要的那些问题会从图结构中受益。具体到做法，这意味着设计作用于集合的变换：对节点或者边的运算顺序不应影响结果，并且运算要能处理数量可变的输入。'],

    // —— 深入细节：比较各种聚合运算 ——
    ['Another way of stating this is with Big-O notation',
      '换一种说法，用大 O 记号表示，我们更希望看到 $O(n_{edges})$，而不是 $O(n_{nodes}^2)$。'],
    ['Pooling information from neighboring nodes and edges is a critical step',
      '从相邻节点与相邻边上汇聚信息，是任何一个足够强大的图神经网络架构都必须完成的关键步骤。由于每个节点的邻居数量各不相同，而聚合信息又要求整个操作可微，我们希望采用一种平滑的聚合运算：它既不依赖节点的排列顺序，也不依赖输入节点的数量。'],
    ['A desirable property of an aggregation operation',
      '聚合运算有一个值得追求的性质：相近的输入给出相近的聚合结果，反过来也成立。几个非常简单、并且对排列保持不变的候选运算分别是求和、求均值与求最大值。方差这类汇总统计量同样可用。这些运算都接受数量可变的输入，并且无论输入顺序如何，给出的输出都相同。接下来我们看看它们之间的差别。'],
    ['There is no operation that is uniformly the best choice.',
      '没有任何一种运算在所有情形下都是最佳选择。当邻居数量变化很大，或者你需要用归一化的方式看待局部邻域的特征时，均值运算会很有用。当你想要突出局部邻域中某个孤立的显著特征时，最大值运算会很有用。求和则在这两者之间取得平衡：它给出局部特征分布的一幅快照，但由于没有做归一化，也可能把离群值一并放大。实践中，求和最为常用。'],
    ['take into account several aggregation operations by concatenating them',
      '会把若干种聚合运算拼接起来一并考虑，并引入一个额外的缩放函数，缩放系数取决于待聚合实体的连接度。与此同时，我们也可以针对具体领域设计专用的聚合运算。一个例子是“四面体手性”聚合算子 '],

    // —— 深入细节：把图卷积网络看作子图函数逼近器 ——
    ['Another way to see GCN (and MPNN) of k-layers with a 1-degree neighbor lookup',
      '换一个角度看，带有一度邻居查找、共有 k 层的图卷积网络（以及 MPNN），可以理解为一个运行在大小为 k 的子图所学嵌入上的神经网络。'],
    ['When focusing on one node, after k-layers',
      '当我们把目光聚焦到某个节点上时，经过 k 层之后，更新后的节点表示只能看到与它相距 k 步以内的邻居，本质上是一种子图表示。边的表示同样如此。'],
    ['So a GCN is collecting all possible subgraphs of size k',
      '于是，图卷积网络会收集所有大小为 k 的可能子图，并站在某个节点或者某条边的视角学习向量表示。可能的子图数量会组合式增长，因此无论是一开始就枚举这些子图，还是像图卷积网络那样动态地构造它们，代价都可能高得难以承受。'],

    // —— 深入细节：边与图的对偶 ——
    ['One thing to note is that edge predictions and node predictions',
      '有一点值得留意：边预测与节点预测看似彼此不同，却常常归结为同一个问题：图上的一项边预测任务 $G$，可以改写为在其对偶图上的一项节点级预测。'],
    ['To obtain $G$’s dual, we can convert nodes to edges',
      '要得到 $G$ 的对偶图，我们可以把节点转换为边（把边转换为节点）。一张图与它的对偶图承载着同样的信息，只是表达方式不同。这种性质有时会让问题在一种表示下比在另一种表示下更容易求解，就像傅里叶空间里的频率一样。简而言之，要解决 $G$ 上的边分类任务，我们可以考虑在 $G$ 的对偶图上做图卷积（这等价于在 $G$ 上学习边的表示），这一思路由对偶-原图卷积网络（Dual-Primal Graph Convolutional Networks）提出。 '],

    // —— 深入细节：把图卷积看作矩阵乘法，把矩阵乘法看作图上的游走 ——
    ['We’ve talked a lot about graph convolutions and message passing',
      '关于图卷积与消息传递，我们已经谈了不少，这自然带来一个问题：在实践中要怎样实现这些运算？本节我们考察矩阵乘法与消息传递的一些性质，以及它与图上遍历之间的联系。'],
    ['The first point we want to illustrate is that the matrix multiplication',
      '我们首先要说明的一点是：把邻接矩阵 $A$（大小为 $n_{nodes} \\times n_{nodes}$）与节点特征矩阵 $X$（大小为 $n_{nodes} \\times node_{dim}$）相乘，实现的是一种以求和为聚合方式的最简消息传递。设所得矩阵为 $B=AX$，可以观察到其中任意一项 $B_{ij}$ 都能写作 $<A_{row_i} \\dot X_{column_j}>= A_{i,1}X_{1,j}+A_{i,2}X_{2, j}+…+A_{i,n}X_{n, j}=\\sum_{A_{i,k}>0} X_{k,j}$。由于只有在一对节点之间存在边时，$A_{i,k}$ 才取二值项，这个内积实际上是在“收集”所有与 $node_i$ 共享一条边、并且维度为 $j$ 的节点特征取值。需要说明的是，这种消息传递并没有更新节点特征本身的表示，只是把相邻节点的特征池化起来。不过改造起来很容易：只要在矩阵乘法之前或者之后，把 $X$ 送入你惯用的可微变换（例如 MLP）即可。'],
    ['From this view, we can appreciate the benefit of using adjacency lists.',
      '从这个角度看，就能体会到使用邻接表的好处。由于 $A$ 通常是稀疏的，我们不必对 $A_{i,j}$ 为零的所有取值求和。只要有一个按索引收集取值的运算，我们就应当能够只取出非零项。此外，这种不依赖矩阵乘法的做法，也让我们不再被迫把求和当作唯一的聚合运算。'],
    ['We can imagine that applying this operation multiple times',
      '可以设想，反复施加这一运算就能把信息传播到更远的地方。从这个意义上说，矩阵乘法是一种图上遍历。当我们观察邻接矩阵的幂 $A^K$ 时，这种联系同样显而易见。考虑矩阵 $A^2$，其中项 $A^2_{ij}$ 统计的是从 $node_{i}$ 到 $node_{j}$ 所有长度为 2 的游走，可以写作内积 $<A_{row_i}, A_{column_j}> = A_{i,1}A_{1, j}+A_{i,2}A_{2, j}+…+A_{i,n}A{n,j}$。直觉是这样的：第一项 $a_{i,1}a_{1, j}$ 只在两种条件同时成立时才为正——存在一条连接 $node_i$ 与 $node_1$ 的边，以及另一条连接 $node_{1}$ 与 $node_{j}$ 的边。换句话说，这两条边构成了一条从 $node_i$ 出发、途经 $node_1$ 到达 $node_j$ 的长度为 2 的路径。由于求和的存在，我们对所有可能的中间节点都做了计数。当我们考虑 $A^3=A \\matrix A^2$……并依此类推到 $A^k$ 时，这一直觉依然成立。'],
    ['There are deeper connections on how we can view matrices as graphs',
      '关于怎样把矩阵看作图，还有更深的联系值得探索 '],

    // —— 深入细节：图注意力网络 ——
    ['Another way of communicating information between graph attributes is via attention.',
      '在图的各个属性之间传递信息，还有一种方式是借助注意力。'],
    ['For example, when we consider the sum-aggregation of a node and its 1-degree neighboring nodes',
      '举例来说，当我们考虑把某个节点与它的一度邻居节点求和聚合时，也可以改用加权求和。接下来的难点在于，如何以一种对排列保持不变的方式给出权重。一种做法是引入一个标量打分函数，依据节点对来分配权重（ $f(node_i, node_j)$）。此时这个打分函数可以理解为衡量某个邻居节点相对于中心节点有多相关。权重还可以归一化，例如用 softmax 函数把大部分权重集中到与任务最相关的那个邻居上。这一构想正是图注意力网络（GAT）'],
    ['and Set Transformers', '与 Set Transformer'],
    ['. Permutation invariance is preserved, because scoring works on pairs of nodes.',
      '。由于打分作用在节点对上，置换不变性得以保留。常用的打分函数是内积，而在打分之前，人们往往先用一个线性映射把节点变换成查询向量与键向量，以增强打分机制的表达能力。此外，出于可解释性的考虑，打分权重还可以用作衡量某条边相对于任务重要程度的指标。'],
    ['Additionally, transformers can be viewed as GNNs with an attention mechanism',
      '此外，Transformer 也可以看作带有注意力机制的图神经网络'],
    ['. Under this view, the transformer models several elements',
      '。在这种视角下，Transformer 把若干元素（例如字符词元）建模为一张全连接图中的节点，而注意力机制为每一对节点分配边嵌入，再用这些嵌入计算注意力权重。差别在于所假设的实体连接模式：图神经网络假设连接是稀疏的，而 Transformer 对全部连接都做了建模。'],

    // —— 深入细节：图的解释与归因 ——
    ['When deploying GNN in the wild we might care about model interpretability',
      '把图神经网络投入实际应用时，我们可能出于建立信任、排查问题或者科学发现的需要而关心模型的可解释性。我们想要解释的图概念依情境而异。例如在分子上，我们可能关心某些特定子图是否存在'],
    [', while in a citation network we might care about the degree of connectedness of an article.',
      '，而在引用网络中，我们可能关心某篇文章的连接程度。由于图概念多种多样，构建解释的方式也有很多。GNNExplainer'],
    ['casts this problem as extracting the most relevant subgraph that is important for a task.',
      '把这个问题表述为抽取对任务最重要的那部分子图。归因技术'],
    ['assign ranked importance values to parts of a graph that are relevant for a task.',
      '则给图中与任务相关的部分赋予带排序的重要性数值。由于逼真而有挑战性的图问题可以人工合成，图神经网络能够充当一套严格且可重复的试验台，用来评估各种归因技术 '],

    // —— 深入细节：生成式建模 ——
    ['Besides learning predictive models on graphs',
      '除了在图上学习预测模型，我们可能也关心为图学习一个生成模型。有了生成模型，我们可以从学到的分布中采样来生成新图，也可以在给定起点的情况下把一张图补全。一个相关的应用是设计新药：人们希望得到具有指定性质的新分子图，作为治疗某种疾病的候选药物。'],
    ['A key challenge with graph generative models',
      '图生成模型的一个关键挑战在于对图的拓扑结构建模，因为图的规模可能变化很大，而且涉及 $N_{nodes}^2$ 项。一种解法是像处理图像那样，用自编码器框架直接对邻接矩阵建模。'],
    ['The prediction of the presence or absence of an edge is treated as a binary classification task.',
      '一条边是否存在，被当作一个二元分类任务来处理。只预测已知存在的边以及一部分并不存在的边，就可以避开 $N_{nodes}^2$ 这一项。graphVAE 学的是对邻接矩阵中正的连接模式以及一部分不连接模式建模。'],
    ['Another approach is to build a graph sequentially',
      '另一种做法是按顺序逐块构造图：从一张图出发，反复施加离散动作，例如增加或者删除节点与边。为了避开对离散动作估计梯度，我们可以采用策略梯度。已有工作通过自回归模型（例如 RNN）做到了这一点'],
    [', or in a reinforcement learning scenario.', '，也有工作在强化学习的框架下完成。'],
    ['Furthermore, sometimes graphs can be modeled as just sequences with grammar elements.',
      '此外，有时图还可以仅用带有语法元素的序列来建模。'],

    // —— 结语与文末说明 ——
    ['Graphs are a powerful and rich structured data type',
      '图是一种强大而丰富的结构化数据类型，它的长处与难处都大不同于图像和文本。在本文中，我们梳理了研究者在构建处理图的神经网络模型过程中取得的一些里程碑。我们走过了使用这些架构时必须做出的一些重要设计选择，也希望图神经网络演练场能让你对这些设计选择会带来怎样的实验结果建立起直觉。图神经网络近年来的成功，为一大批新问题带来了很好的机会，我们也很期待这个领域接下来会带来什么。'],
    ['We are deeply grateful to Andy Coenen',
      '我们深深感谢 Andy Coenen、Brian Lee、Chaitanya K. Joshi、Ed Chi、Humza Iqbal、Fernanda Viegas、Jasper Snoek、Jennifer Wei、Martin Wattenberg、Patricia Robinson、Wesley Qian 与 Yiliu Wang 提出的有益反馈与建议，也感谢 Michael Terry 所做的代码评审。'],
    ['Many of our GNN architecture diagrams are based on the Graph Nets diagram',
      '我们的许多图神经网络架构示意图基于 Graph Nets 结构图 '],
    ['All authors contributed to writing.', '全部作者共同参与写作。'],
    ['Adam Pearce and Emily Reif made the interactive diagrams',
      'Adam Pearce 与 Emily Reif 制作了交互式示意图，并确定了图形的整体外观。Benjamin Sanchez-Lengeling 与 Emily Reif 绘制了部分最初的图像草图。Alexander B. Wiltschko 提供了编辑与写作方面的指导。'],
    ['Review #1 - Chaitanya K. Joshi', '评审 #1 · Chaitanya K. Joshi'],
    ['Review #2 - Patricia Robinson', '评审 #2 · Patricia Robinson'],
    ['Review #3 - Humza Iqbal', '评审 #3 · Humza Iqbal'],
    ['create an issue on GitHub', '在 GitHub 上创建问题单'],
    ['source available on GitHub', '源代码可在 GitHub 上获取'],
    // —— 演练场的告警提示：两条分支各自成句，只能分别对齐 ——
    ['Model predictions for edited molecules are only available for the fully trained model. Displaying predictions from the last epoch.',
      '编辑过的分子只有完整训练好的模型才能给出预测结果。下面展示的是最后一个迭代轮次的预测结果。'],
    ['Model predictions for edited molecules are only available for the fully trained model. Reseting molecule.',
      '编辑过的分子只有完整训练好的模型才能给出预测结果。正在重置分子。'],

  ];

  // 段落作用域片段：公式会把句子切成极短的连接片段（例如 " in "），
  // 这类片段全局匹配太危险，因此限定只在以指定句首开头的段落内生效。
  const SCOPED = {
    'Machine learning models typically take rectangular': [
      [' by assigning each node an index ', '：我们给每个节点分配编号 '],
      [' and storing the feature for ', '，再把 '],
      [' in ', ' 的特征存入 '],
      ['. While these matrices have a variable number of examples, they can be processed without any special techniques.',
        '。这些矩阵的样本数量会变化，处理它们并不需要什么特别技巧。'],
    ],
    'One elegant and memory-efficient way of representing sparse matrices': [
      [' between nodes ', ' 在节点 '],
      [' as a tuple (i,j) in the k-th entry of an adjacency list. Since we expect the number of edges to be much lower than the number of entries for an adjacency matrix (',
        ' 之间的连接关系，用邻接表第 k 项里的元组 (i,j) 表示。由于边的数量通常远少于邻接矩阵的条目数（'],
      ['), we avoid computation and storage on the disconnected parts of the graph.',
        '），我们就不必在图里那些互不相连的部分上做计算与存储。'],
    ],
    'It should be noted that the figure uses scalar values per node/edge/global': [
      [' we will be dealing with node tensors of size ', ' 的节点张量，而是大小为 '],
      ['. Same for the other graph attributes.', ' 的节点张量。其他图属性同理。'],
    ],
    'How to train and design GNNs': [
      [', ', '，'],
      ['.', '。'],
    ],
  };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);
  // 参考文献列表（ol#references-list）整块跳过：列出的论文标题、作者、期刊与卷期页码保留原文，
  // 便于读者按原文献检索；「参考文献」这一小节标题仍在列表之外，照常翻译。
  const SKIP_IDS = new Set(['references-list']);

  // 同一个英文词在不同位置含义不同，按所在容器给出各自的中文。
  // 例：表格表头里的 graphs 指「图数量」，图级任务示意图里的 graphs 指「若干张图」。
  const CONTEXT = [
    { within: '#graph-level-problems', pairs: { 'graphs': '图' } },
  ];

  function contextualValue(trimmed, node) {
    let el = node.parentElement;
    while (el && el !== document.body) {
      for (const rule of CONTEXT) {
        if (el.matches && el.matches(rule.within) && rule.pairs[trimmed]) return rule.pairs[trimmed];
      }
      el = el.parentElement;
    }
    return null;
  }
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
  // 英文正文被行内元素切成片段时，句末标点常单独成一个文本节点。
  // 判据：紧邻的前一个兄弟节点以汉字结尾，就按中文标点收尾。
  const TRAILING_PUNCT = new Map(Object.entries({
    '.': '。', ',': '，', '?': '？', '!': '！', ';': '；', ':': '：',
    ').': '）。', '),': '），', ').)': '）。）',
  }));

  function previousEndsWithCJK(node) {
    let sibling = node.previousSibling;
    while (sibling) {
      const value = sibling.nodeType === Node.TEXT_NODE ? sibling.nodeValue : sibling.textContent;
      if (value && value.trim()) return CJK.test(value.trim().slice(-1));
      sibling = sibling.previousSibling;
    }
    return false;
  }

  // 片段以空格收尾、紧接的下一片段又是中文标点或汉字时，收掉这个空格，
  // 避免出现“推荐系统 。”或“在这个 图级预测任务中”这类混排残留。
  const CJK_OR_PUNCT_HEAD = /^[。，、；：）？！\u3400-\u9fff]/;
  function dropSpaceBeforeCJK(node, text) {
    if (!/\s$/.test(text)) return text;
    let sibling = node.nextSibling;
    while (sibling) {
      const value = sibling.nodeType === Node.TEXT_NODE ? sibling.nodeValue : sibling.textContent;
      if (value && value.trim()) {
        return CJK_OR_PUNCT_HEAD.test(value.trim()) ? text.replace(/\s+$/, '') : text;
      }
      sibling = sibling.nextSibling;
    }
    return text;
  }

  // 取该文本节点所属段落原文，用于判定它落在哪个作用域里。
  function scopedPairsFor(node) {
    const parent = node.parentElement;
    const paragraph = parent && parent.closest ? parent.closest('p') : null;
    if (!paragraph) return null;
    if (!paragraph.dataset.codexAnchor) paragraph.dataset.codexAnchor = paragraph.textContent;
    const text = paragraph.dataset.codexAnchor;
    for (const anchor of Object.keys(SCOPED)) {
      if (text.startsWith(anchor)) return SCOPED[anchor];
    }
    return null;
  }

  function applyPairs(text, pairs) {
    let out = text;
    for (const [en, zh] of pairs) {
      if (out.includes(en)) out = out.split(en).join(zh);
    }
    return tidy(out);
  }

  function translate(text, scoped) {
    if (!text || !/[A-Za-z]/.test(text)) return text;
    const trimmed = text.trim();
    if (EXACT.has(trimmed)) {
      const start = text.indexOf(trimmed);
      return text.slice(0, start) + EXACT.get(trimmed) + text.slice(start + trimmed.length);
    }
    let out = text;
    for (const [start, zh] of PARAGRAPHS) {
      // 前缀锚定同样对空白宽容：原文可能夹着双空格或窄空格。
      if (anchored(start).test(trimmed)) {
        const at = text.indexOf(trimmed);
        return text.slice(0, at) + zh + text.slice(at + trimmed.length);
      }
    }
    for (const [lead, zh] of LEADINS) {
      const match = anchored(lead).exec(trimmed);
      if (match) {
        const lead_space = text.slice(0, text.indexOf(trimmed));
        out = lead_space + zh + trimmed.slice(match[0].length);
        break;
      }
    }
    if (scoped) {
      for (const [en, zh] of scoped) {
        out = out.replace(flexible(en), () => zh);
      }
    }
    for (const [pattern, zh] of FLEX) {
      out = out.replace(pattern, () => zh);
      pattern.lastIndex = 0;
    }
    return tidy(out);
  }

  function tidy(text) {
    return text.replace(/[ \t]+([。，、；：）？！])/g, '$1');
  }

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      let next;
      if (TRAILING_PUNCT.has(trimmed) && previousEndsWithCJK(node)) {
        const start = raw.indexOf(trimmed);
        next = raw.slice(0, start) + TRAILING_PUNCT.get(trimmed) + raw.slice(start + trimmed.length);
      } else {
        const override = contextualValue(trimmed, node);
        if (override) {
          const at = raw.indexOf(trimmed);
          next = raw.slice(0, at) + override + raw.slice(at + trimmed.length);
        } else {
          next = translate(raw, scopedPairsFor(node));
        }
      }
      next = dropSpaceBeforeCJK(node, next);
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || SKIP.has(node.tagName) || SKIP_IDS.has(node.id)) return;
    for (const attr of ['title', 'aria-label', 'alt', 'placeholder']) {
      if (node.hasAttribute && node.hasAttribute(attr)) {
        const value = node.getAttribute(attr);
        const next = translate(value);
        if (next !== value) node.setAttribute(attr, next);
      }
    }
    for (const child of Array.from(node.childNodes)) walk(child);
  }

  function run() {
    try {
      walk(document.body);
    } finally {
      document.documentElement.classList.remove('pending-translation');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // 交互图由 d3/vega 动态生成，需要持续跟进。
  new MutationObserver((records) => {
    for (const record of records) {
      for (const added of record.addedNodes) walk(added);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
