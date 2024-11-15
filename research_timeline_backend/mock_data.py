from models import Paper

MOCK_PAPERS = [
    Paper(
        title="Attention Is All You Need",
        authors=["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
        abstract="A new architecture, the Transformer, based solely on attention mechanisms...",
        publication_date="2017-06-12",
        link="https://arxiv.org/abs/1706.03762"
    ),
    Paper(
        title="BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        authors=["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
        abstract="We introduce BERT, a new language representation model...",
        publication_date="2018-10-11",
        link="https://arxiv.org/abs/1810.04805"
    ),
    Paper(
        title="GPT-3: Language Models are Few-Shot Learners",
        authors=["Tom B. Brown", "Benjamin Mann", "Nick Ryder", "Melanie Subbiah"],
        abstract="GPT-3, a language model with 175 billion parameters, demonstrates few-shot learning...",
        publication_date="2020-05-28",
        link="https://arxiv.org/abs/2005.14165"
    ),
    Paper(
        title="RoBERTa: A Robustly Optimized BERT Pretraining Approach",
        authors=["Yinhan Liu", "Myle Ott", "Naman Goyal", "Jingfei Du"],
        abstract="RoBERTa improves on BERT by training on more data with optimized parameters...",
        publication_date="2019-07-26",
        link="https://arxiv.org/abs/1907.11692"
    ),
    Paper(
        title="ALBERT: A Lite BERT for Self-supervised Learning of Language Representations",
        authors=["Zhenzhong Lan", "Mingda Chen", "Sebastian Goodman", "Kevin Gimpel"],
        abstract="ALBERT reduces the parameters of BERT while retaining performance...",
        publication_date="2019-09-26",
        link="https://arxiv.org/abs/1909.11942"
    ),
    Paper(
        title="T5: Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer",
        authors=["Colin Raffel", "Noam Shazeer", "Adam Roberts", "Katherine Lee"],
        abstract="T5 proposes a text-to-text framework for various NLP tasks...",
        publication_date="2019-10-22",
        link="https://arxiv.org/abs/1910.10683"
    ),
    Paper(
        title="XLNet: Generalized Autoregressive Pretraining for Language Understanding",
        authors=["Zhilin Yang", "Zihang Dai", "Yiming Yang", "Jaime Carbonell"],
        abstract="XLNet combines autoregressive and bidirectional contexts to improve over BERT...",
        publication_date="2019-06-19",
        link="https://arxiv.org/abs/1906.08237"
    ),
    Paper(
        title="DistilBERT, a distilled version of BERT: smaller, faster, cheaper and lighter",
        authors=["Victor Sanh", "Lysandre Debut", "Julien Chaumond", "Thomas Wolf"],
        abstract="DistilBERT is a smaller, faster version of BERT that retains much of its accuracy...",
        publication_date="2019-10-02",
        link="https://arxiv.org/abs/1910.01108"
    ),
    Paper(
        title="Longformer: The Long-Document Transformer",
        authors=["Iz Beltagy", "Matthew E. Peters", "Arman Cohan"],
        abstract="Longformer extends BERT-like models for long documents by using sparse attention...",
        publication_date="2020-04-27",
        link="https://arxiv.org/abs/2004.05150"
    ),
    Paper(
        title="ERNIE: Enhanced Language Representation with Informative Entities",
        authors=["Yu Sun", "Shikun Feng", "Hao Tian", "Hua Wu"],
        abstract="ERNIE incorporates knowledge graphs to improve understanding in NLP tasks...",
        publication_date="2019-03-26",
        link="https://arxiv.org/abs/1905.07129"
    )
]
