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

## Dataset Collection and Pipeline Execution (MANDATORY) (~3 hours)

In tutorial generation, we need a dataset that is **contamination-free**. This means the code repository must not have been part of the LLM's training data. Since every LLM has a specific knowledge-cutoff date, you should gather 3 code repositories that meet these criteria:
- **Recent**: Created *after* the knowledge-cutoff date of the LLM you are using.
- **Substantial**: Have sufficient size and complexity (at least 10K LOC) to warrant a tutorial.

On these repositories, you will run 2 pipelines:
- Pipeline 1: The baseline agent that generates tutorials for each repository in markdown format.
- Pipeline 2: You will use the combination of DeepAgents + Knowledge Base methodology to first create a knowledge base and then create the tutorials. 

#### Example Repos
Below are some example repositories you can use that are contamination-free:
- [DeepAgents](https://github.com/langchain-ai/deepagents)
- [TOON](https://github.com/toon-format/toon)
- [Agent Lightning](https://github.com/microsoft/agent-lightning)
- [POML](https://github.com/microsoft/poml)
- [RAG Anything](https://github.com/HKUDS/RAG-Anything)

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
PLEASE NOTE THAT YOU SHOULD ONLY USE THE KNOWLEDGE BASE AS AN EXTRA CONTEXT TO GUIDE YOUR DEEP AGENT. IN BOTH APPROACHES, WHEN IT COMES TO CREATING TUTORIALS, BOTH AGENTS (BASELINE AND DEEPAGENT) SHOULD BE ABLE TO DISCOVER THE CODEBASE. For example, you cannot only generate the knowledge base and then convert this knowledge base to a tutorial. For generating the tutorial, even the deep agent has to explore the codebase using the tools it has, but its context is enriched with the knowledge base you generated before.

AS A RESULT, YOUR KNOWLEDGE BASE SHOULD NOT BE VERY LARGE! It should be high-level, concise, and include diagrams (such as ASCII flow diagrams or Mermaid diagrams) that can give a high-level overview for the deep agent to plan and explore better. Otherwise, the agent's context will be filled in quickly and you will face context overflow.


## Experiment 1 (MANDATORY): Human Preference by Experts (~1 hour)
Gather some experts (at least N=3) who are familiar with programming or AI libraries, or know these libraries, or learned these libraries recently. Experts do **A/B testing** and **Likert** Scoring.
They are shown the 2 tutorials (generated by Baseline and DeepAgent) for each repository without knowing which is generated by which approach (blind test).

A/B testing means: they compare the 2 tutorials and select the best one (the one they prefer)
Likert: They score each tutorial on a scale of 1-5

They should consider 3 criteria:
They should evaluate based on 3 criteria:
1. **Fidelity**: Is the code accurate? Does it match the actual codebase? (Fact-checking)
2. **Pedagogy**: Is it easy for a beginner to understand? Is the structure logical?
3. **Coverage**: Does it cover the most important parts of the system? (Completeness)

## Experiment 2 (MANDATORY): Eval using LLM-as-judge (~30 min)
Similar to Experiment 1, but instead of human experts, we use a **SOTA (State-of-the-Art) AI Model** as the judge.

**Recommended Judge:** Use a "Vibe-coding" tool that has codebase awareness, such as **GitHub Copilot**, **Gemini CLI**, **Antigravity** or others.
**Procedure:**
1. Open the repository in the tool.
2. Provide both tutorials to the tool.
3. Ask it to evaluate them based on the 3 criteria above (Fidelity, Pedagogy, Coverage) and pick a winner.

Here N = 4 (use 4 different models if possible, e.g., GPT, Cluade, Gemini, Grok).

NOTE: Finally you can create a win-rate table to add results of both expert and llm-as-judge to aggregate all results. 

## Experiment 3 (OPTIONAL): Human Preference by Students (~1 hour)
Similar to Experiment 1, but instead of experts, we have students (who are not that proficient with programming or AI and are learning).
N at least must be N=5.

NOTE: if you do this, also add it to win-rate table.

## Experiment 4 (MANDATORY): Cost/Context Analysis (~30 min)
At runtime, during the **Tutorial Generation phase** (excluding the Knowledge Base generation time), measure the following metrics:

1. **Overall Cost:** How many tokens are in the agent's context at the end of the tutorial generation? (main agent vs baseline agent) (DO NOT CONSIDER SUBAGENTS!). This is similar to counting how much money we spent overall, but instead of dollars, we count tokens.

2. **Tool Calls:** Number of times the agent called tools when generating tutorials (main agent vs baseline agent) (DO NOT CONSIDER SUBAGENTS!).
 
3. **Context Overflow:** If any agent reached its maximum context length, please also report it as well (for example, how many times the incident of context overflow happened).

**Example:**
Agent context initially has 5K tokens -> Agent calls 1 tool by generating 1K tokens -> The tools returns a result which is 3.5K tokens.

- **Overall Cost** = 5K + 1K + 3.5K = 9.5K
- **Tool Calls** = 1 

You can report your results in a table like below (showing values for each codebase):

| Codebase            | Metric                | Baseline Agent | DeepAgent |
| :------------------ | :-------------------- | :------------- | :-------- |
| **TOON**            | Overall Cost (Tokens) | 125,400        | 98,200    |
|                     | Tool Calls            | 45             | 23        |
|                     | Context Overflow      | 2              | 0         |
| **Agent Lightning** | Overall Cost (Tokens) | 110,000        | 85,000    |
|                     | Tool Calls            | 30             | 15        |
|                     | Context Overflow      | 1              | 0         |
| **...**             | ...                   | ...            | ...       |

NOTE: For calculating the number of tokens you can use `tiktoken` library in Python.

## Experiment 5 (OPTIONAL): Ablation Study (~3 hours)
Ablation study means analyzing a system by removing/adding its internal components to see how much each component contributes to the overall success of the system.

Here you can do ablation for Experiment 2 and 4 by:
- Removing the knowledge base and doing experiments again

Below is an example table for ablation study: 

| Metric                      | DeepAgent (with KB) | DeepAgent (without KB) |
| :-------------------------- | :------------------ | :--------------------- |
| **Exp 2: Win Rate**         | 80%                 | 65%                    |
| **Exp 4: Overall Cost**     | 98,200              | 115,000                |
| **Exp 4: Tool Calls**       | 23                  | 35                     |
| **Exp 4: Context Overflow** | 0                   | 1                      |

The results will show if the knowledge base has any effect in the overall system success or not. For example, if without the knowledge base we see the results become worse, it means that the knowledge base is useful. If there is no change in results, it means that the knowledge base is not that useful!

Normally in Ablation Studies we expect to see lower metric values when removing a feature, because initially we hypothised that the feature we added is useful. But sometimes it does not make a difference, or it even makes the results better! Which implies that the feature we added is not that useful.
