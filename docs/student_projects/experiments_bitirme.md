# Our Goal

In this experimental study, our goal is to measure if for our tasks (Tutorial Generation or Repository-level QA), the DeepAgents architecture shows improvement over the baseline agent and publish the results as a research paper.

# Requirements:

#### Implementing a **Baseline Agent**: (~1 hour)

An agent that has access to tools `read_file`, `read_file_bulk`, `write_file`, `file_search`, `get_tree`, `semantic_search` (which enables **RAG**)

#### Implementing a **DeepAgent**: (~1 hour)

An agent that has access to similar tools as the Baseline Agent PLUS:
1. `spawn_sub_agents`: To create and run **Subagents** at runtime.
2. `list_workspace_dirs` (or similar): To provide a **Virtual Filesystem** for managing sub-agent outputs.
3. `todo` (or similar): To enable **Explicit Planning** and task decomposition.

These three capabilities (Subagents, Virtual Filesystem, Explicit Planning) are the key differentiators that distinguish a DeepAgent from a standard ReAct agent. 

# Experimental Study

Overall, we will gather a dataset (which are code repositories) and perform different tests and experiments on them to see if we can improve over the baseline approach or not.

NOTE: Below are a set of experiments; some of them are MANDATORY and some are OPTIONAL. This paper that you are going to write can significantly improve your CV and boost your career journey either in Academia (if you want to do an MSc) or Industry (if you are going to apply for a job). 

At the end of these experiments you will come up with 3 scenarios:
1. You do the MANDATORY experiments, your experiments fail -> So you **cannot publish**.
2. You do the MANDATORY experiments, your experiments succeed and show improvement -> You can publish in a **C-level** conference/journal.
3. You do both the MANDATORY and OPTIONAL experiments, and both succeed -> You can publish in a **B or even A-level** conference/journal.

The more effort on this project EQUALS TO more achievements in your career. 

## Dataset Collection and Knowledge Base Generation (MANDATORY) (~3 hours)

As for the dataset, you can use SWE-QA ([paper](https://arxiv.org/html/2509.14635v1), [github](https://github.com/peng-weihan/SWE-QA-Bench)).

This dataset has 12 repositories, each with a different size and complexity. For each repository there are 48 questions and answers. 

Below is the statistics of the dataset:

| Repository   | # LOC         | # Questions |
| :----------- | :------------ | :---------- |
| astropy      | 402,824       | 48          |
| django       | 499,240       | 48          |
| flask        | 18,108        | 48          |
| matplotlib   | 266,896       | 48          |
| pylint       | 117,602       | 48          |
| pytest       | 100,111       | 48          |
| requests     | 11,248        | 48          |
| scikit-learn | 424,550       | 48          |
| sphinx       | 142,146       | 48          |
| sqlfluff     | 145,382       | 48          |
| sympy        | 779,192       | 48          |
| xarray       | 186,039       | 48          |
| **Overall**  | **3,093,338** | **576**     |

For your initial tests, you can start with the smaller ones such as `flask` and `requests`.


#### Example GPUs
You can deploy your LLM in Digital Ocean with one of these GPU droplets using Ollama:
- AMD Instinct™ MI300X×8 (GPU memory: 1,536 GB)
- NVIDIA HGX H100×8 (GPU memory: 640 GB)
  
You can [see the pricing here.](https://www.digitalocean.com/pricing/gpu-droplets)

#### Example LLMs
On these setups, you can deploy many LLMs, but among the best ones are:
- [GPT OSS 120B](https://ollama.com/library/gpt-oss:120b) (in Thinking=High or Thinking=Medium modes)
- [Qwen3 30B A3B Instruct](https://ollama.com/library/qwen3:30b-a3b-instruct-2507-q4_K_M) 

NOTE: Deploy the LLMs in **FULL CONTEXT**. Both of the models above support 128K context.

#### IMPORTANT NOTE: 

**CRITICAL INSTRUCTION:**
THE KNOWLEDGE BASE IS A **GUIDE**, NOT A REPLACEMENT. 
In both approaches, the agent must actively explore the codebase to answer the questions. The DeepAgent uses the Knowledge Base as a high-level map to plan its exploration better, but it must still read the actual code files to ensure accuracy.

**Constraint:** Your Knowledge Base should be **concise and high-level**. It should focus on architecture, data flow, and key components (using diagrams like Mermaid). If the Knowledge Base is too verbose (e.g., dumping entire files), it will clog the context window and lead to "Context Overflow," defeating the purpose of the experiment.

## Experiment 1 (MANDATORY): Results of the Benchmark (~1 hour)

You run the baseline agent and the deep agent on the dataset and compare their results. 

In order to compare the results of the agents with the actual answers provided by SWE-QA, use one of these methods:

1. Prompt a secondary LLM **(LLM-as-judge)** to compare the predicted answers with the actual answers.
The LLM-as-judge can use this policy to evaluate the answers:
- **5 = Perfect**: Fully correct, complete, and clear.
- **4 = Mostly correct**: Minor errors or missing small details.
- **3 = Partially correct**: Main idea right but significant gaps or errors.
- **2 = Mostly wrong**: Some relevant info but fundamentally incorrect.
- **1 = Completely wrong**: No useful information.

2. The LLM-as-judge can also use a simpler policy to classify the answers as **Correct (True)** or **Incorrect (False)**. Selection of the policy is up to you.

## Experiment 2 (OPTIONAL): Pass@k Metric (~1 hour)

For the Experiment 1, you can calculate the Pass@k metric for both agents. The Pass@k metric is the percentage of questions that the agent answers correctly in the first k answers. 
For example if k=1, then the metric is the percentage of questions that the agent answers correctly in the first answer. If k=2, then the metric is the percentage of questions that the agent answers correctly in the first two answers. 

But please note that for each answer in Pass@k, you should use a non-zero `temperature` parameter (e.g., 0.7 or 1.0) for the LLM to generate different answers. `Temperature` is a parameter that controls the randomness/creativity of the LLM. 
This is different than multi-turn answering, where the agent can use the context or results of the previous turns to improve its answer in next turns. Since LLMs are deterministic when temperature is 0, Pass@k metric allows us to run the experiments K times with higher temperature to make sure the results are reliable.

## Experiment 3 (OPTIONAL): Single-turn vs Multi-turn Answering (~1 hour)

Multi-turn answering is when the agent answers a question in multiple turns. Single-turn answering is when the agent answers a question in a single turn. 

For example in multi-turn answering, the agent after the first try, if it fails to answer the question correctly, it can try again. For the second turn, the context or results of the first turn MUST be included as well (history must be kept).
So the agent can learn from its mistakes and improve its answer in next turns.

## Experiment 4 (OPTIONAL): Different LLMs (~1 hour)

You can run the Experiment 1 with two or three different LLMs such as `Qwen3 30B A3B Instruct`, `GPT OSS 120B`, `GPT OSS 20B` 

## Experiment 5 (MANDATORY): Cost/Context Analysis (~30 mins) 

You compare the baseline agent and the deep agent in terms of the used context size. Meaning that for answering a question, how much context (measured in tokens) the agent uses.

For example you can add a table like this to compare the used context size (per tokens) for each agent:

| Repository | Baseline Agent | Deep Agent |
| :--------- | :------------- | :--------- |
| astropy    | 100            | 200        |
| django     | 150            | 250        |
| flask      | 200            | 300        |

NOTE: For calculating the number of tokens you can use `tiktoken` library in Python. 

## Experiment 6 (MANDATORY): Ablation Study (~3 hours) 

Ablation Study is when you remove or disable some internal features of the agent to compare the results with the full agent. Ablation Study allows you to understand the impact of each internal feature of the agent to the overall success of the system.

For example, you can remove the knowledge base, and then run experiments to compare the results with the full agent. If the experiments at the absence of knowledge base yield lower metric values, then it implies that the knowledge base is a good feature and contributes to the success of the system.

You can create a table like this for your ablation study:

| Method                  | Pass@1 | Pass@3 | LLM-Judge Score (1–5) ↑ | Cost (tokens/question) ↓ |
| :---------------------- | :----- | :----- | :---------------------- | :----------------------- |
| Baseline (ReAct + RAG)  | 34.2%  | 41.8%  | 3.41                    | 48k                      |
| DeepAgent w/o KB        | 42.7%  | 51.3%  | 3.88                    | 39k                      |
| DeepAgent w/o Subagents | 40%    | 50%    | 4                       | 35k                      |
| DeepAgent w/o Todo List | 45%    | 53%    | 3.9                     | 37k                      |
| DeepAgent + KB (Ours)   | 90%    | 80%    | 5                       | 31k                      |

In the table above `w/o` means `without`.

Normally in Ablation Studies we expect to see lower metric values when removing a feature, because initially we hypothesized that the feature we added is useful. But sometimes it does not make a difference, or it even makes the results better! Which implies that the feature we added is not that useful.



