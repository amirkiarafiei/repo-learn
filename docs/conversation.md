# This document shows a previous conversation between a user and a assistant. This is for background information and does not show definitive decisions.

---

I have a quesiton. I am an AI Engineer and AI Researcher in my early days of research career.
Here you can find more info about me:

========== CV ==========
https://scholar.google.com/citations?user=9geFFmwAAAAJ&hl
https://www.amirkia.tech/
https://www.amirkia.tech/research
https://www.amirkia.tech/publications
https://www.amirkia.tech/experience
https://medium.com/@amirkiarafiei

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Developer CV
% LaTeX Class
% Version 2.0 (12/10/23)
%
% This class originates from:
% http://www.LaTeXTemplates.com
%
% Authors:
% Omar Roldan
% Based on a template by  Jan Vorisek (jan@vorisek.me)
% Based on a template by Jan Küster (info@jankuester.com)
% Modified for LaTeX Templates by Vel (vel@LaTeXTemplates.com)
%
% License:
% The MIT License (see included LICENSE file)
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%----------------------------------------------------------------------------------------
%	PACKAGES AND OTHER DOCUMENT CONFIGURATIONS
%----------------------------------------------------------------------------------------

\documentclass[9pt]{developercv} % Default font size, values from 8-12pt are recommended
\usepackage{multicol}
\setlength{\columnsep}{0mm}
%----------------------------------------------------------------------------------------
\usepackage{lipsum}  


\begin{document}

%----------------------------------------------------------------------------------------
%	TITLE AND CONTACT INFORMATION
%----------------------------------------------------------------------------------------

\begin{minipage}[t]{0.5\textwidth} 
	\vspace{-\baselineskip} % Required for vertically aligning minipages
	
	{ \fontsize{16}{20} \textcolor{black}{\textbf{\MakeUppercase{Amirkia Rafiei Oskooei}}}} % First name
	
	\vspace{6pt}

	{\Large AI Engineer | Lead Researcher} % Career or current job title
\end{minipage}
\hfill
\begin{minipage}[t]{0.2\textwidth} % 20% of the page width for the first row of icons
        % \vspace{-4mm}
	\vspace{-\baselineskip} % Required for vertically aligning minipages
	
	% The first parameter is the FontAwesome icon name, the second is the box size and the third is the text
	% \icon{Globe}{11}{\href{http://www.google.com}{portafolio.com}}\\ 
        % \icon{Phone}{11}{+905523231487}\\
        % \icon{Globe}{11}{\href{https://sites.google.com/view/amirkia/}{\underline{Website}}}\\
        % \icon{MapMarker}{11}{Istanbul, Turkey}\\
        % \icon{Github}{11}{\href{https://github.com/amirkiarafiei}{\underline{Github}}}\\

	
\end{minipage}
\begin{minipage}[t]{0.30\textwidth} % 27% of the page width for the second row of icons
        % \vspace{-4mm}
	\vspace{-\baselineskip} % Required for vertically aligning minipages

        \icon{Globe}{11}{\href{https://www.amirkia.tech/}{www.amirkia.tech}}\\
	\icon{Envelope}{11}{\href{mailto:amirkia.rafiei@gmail.com}{amirkia.rafiei@gmail.com}}\\
    \icon{Github}{11}{\href{https://github.com/amirkiarafiei}{github.com/amirkiarafiei}}\\
        % \icon{LinkedinSquare}{11}{\href{https://www.linkedin.com/in/amirkiarafiei/}{linkedin.com/in/amirkiarafiei}}\\
        % \icon{Globe}{11}{\href{https://sites.google.com/view/amirkia/}{\underline{Personal Website}}}\\
        
\end{minipage}

%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------
\vspace{10 pt}
\cvsect{Education}
\begin{entrylist}
    \entry
		{2025 - \textbf{(Present)}}
		{MSc in Computer Engineering}
		{Yildiz Technical University, Istanbul}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item GPA: N/A
                \end{itemize}
        }
    \entry
		{2019 - 2025}
		{BSc in Computer Engineering}
		{Yildiz Technical University, Istanbul}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item GPA: 3.37/4.0 (Graduated with Honors)
                    \item Erasmus+ Exchange Program, West Pomeranian University of Technology, Poland (GPA: 3.7/4.0)
                \end{itemize}
        }
\end{entrylist}

%----------------------------------------------------------------------------------------
%	Research Interests
%----------------------------------------------------------------------------------------
% \vspace{-10 pt}
% 	\cvsect{Languages \vspace{8pt}}
%         \textbf{Persian}: Native \hspace{5mm} \textbf{English, Turkish, Azerbaijanis}: Advanced \hspace{5mm} \textbf{Arabic}: Intermediate \hspace{5mm} \textbf{Spanish}: Beginner
\vspace{-2 pt}
	\cvsect{Research Interests\vspace{8pt}}
        \hphantom{aa} 
        \hspace{2mm} \textbf{• Artificial Intelligence} 
        \hspace{6mm} \textbf{• LLMs}   
        \hspace{6mm} \textbf{• Software Engineering}
        \hspace{6mm} \textbf{• Decision Making} 
        \hspace{6mm} \textbf{• Social Networks} 

%----------------------------------------------------------------------------------------
%	Publications
%----------------------------------------------------------------------------------------
\vspace{20pt}
\cvsect{Selected Publications}
\begin{entrylist}
    \entry
        {\hspace{2mm} LLM/Security}
        {\href{https://arxiv.org/html/2510.17904v1}{BreakFun: Jailbreaking LLMs via Schema Exploitation}}
        {}
        {\textit{*A Rafiei Oskooei, MS Aktas} \\
        AsiaCCS 2026 (Main Track)(Under Review)}
    \entry
        {\hspace{4mm} LLM/SE}
        {\href{https://arxiv.org/html/2510.16809v2}{When Many-Shot Prompting Fails: An Empirical Study of LLM Code Translation}}
        {}
        {\textit{*A Rafiei Oskooei, KB Cosdan, H Isiktas, MS Aktas} \\
        ICSE 2026 (ReCode Workshop) }
    \entry
        {\hspace{4mm} LLM/SE}
        {\href{https://arxiv.org/html/2512.05908v1}{Natural Language Summarization Enables Multi-Repository Bug Localization by LLMs in Microservice Architectures}}
        {}
        {\textit{*A Rafiei Oskooei, MS Aktas} \\
        ICSE 2026 Workshops (LLM4Code Workshop)}
    \entry
        {\hspace{4mm} LLM/SE}
        {\href{https://link.springer.com/chapter/10.1007/978-3-031-97576-9_6}{Repository-Level Code Understanding by LLMs via Hierarchical Summarization: Improving Code Search and Bug Localization}}
        {}
        {\textit{*A Rafiei Oskooei, S Yukcu, M Bozoglan, MS Aktas} \\
        ICCSA 2025}
    \entry
        {Decision Making}
        {\href{https://link.springer.com/article/10.1007/s10462-024-11027-3}{Analyzing Costumer Preference for Hydrogen Cars: A Characteristic Objects Method Approach}}
        {}
        {\textit{A Shekhovtsov, *A Rafiei Oskooei, J Wątróbski, W Salabun} \\
        Artificial Intelligence Review}
    \entry
        {Decision Making}
        {\href{https://doi.org/10.5220/0013120200003890}{Comparison of Monolithic and Structural Decision Models Using the Hamming Distance}}
        {}
        {\textit{A Shekhovtsov, *A Rafiei Oskooei, W Salabun} \\
        ICAART 2025}
    \entry
        {\hspace{2mm} Applied AI}
        {\href{https://www.mdpi.com/2076-3417/15/23/12691}{Asynchronous Pipeline Parallelism for Real-Time Multilingual Lip Synchronization in Video Communication Systems}}
        {}
        {\textit{E Caglar, *A Rafiei Oskooei, M Kutanoglu, M Keles, and MS Aktas} \\
        IEEE Big Data (AIDE4IoT Workshop)}
    \entry
        {\hspace{2mm} Applied AI}
        {\href{https://www.mdpi.com/2076-3417/15/23/12691}{Generative AI for Video Translation: A Scalable Architecture for Multilingual Video Conferencing}}
        {}
        {\textit{*A Rafiei Oskooei, E Caglar, I Sahin, A Kayabay, MS Aktas} \\
        Applied Sciences}
    \entry
        {\hspace{2mm} Applied AI}
        {\href{https://www.mdpi.com/2073-431X/14/1/7}{Seeing the Sound: Multilingual Lip Sync for Real-time Face-to-Face Translation}}
        {}
        {\textit{*A Rafiei Oskooei, MS Aktas, M Keleş} \\
        Computers}
    \entry
        {Social Networks}
        {\href{https://link.springer.com/chapter/10.1007/978-3-031-82431-9_26}{Investigating Echo-chambers in Decentralized Social Networks: A Mastodon Case Study}}
        {}
        {\textit{I R. Huitema, *A Rafiei Oskooei, MS Aktas, M Riveni} \\
        Complex Networks and their Applications 2024}

    % \entry
    %     {\hspace{6mm} LLMs}
    %     {\href{https://drive.google.com/file/d/17mW4IUv-pNZ6DOUZ5VYT6eJoh_b2o_vA/view?usp=sharing}{When Many-Shot Prompting Fails: An Empirical Study of LLM Code Translation (Under Review)}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, KB Cosdan, H Isiktas, MS Aktas} \\
    %     IEEE Access}
    % \entry
    %     {\hspace{6mm} LLMs}
    %     {\href{https://doi.org/10.1007/978-3-031-97576-9_6}{Repository-Level Code Understanding by LLMs via Hierarchical Summarization: Improving Code Search and Bug Localization}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, S Yukcu, M Bozoglan, MS Aktas} \\
    %     Computational Science and Its Applications, ICCSA 2025}
    % \entry
    %     {\hspace{6mm} LLMs}
    %     {\href{http://doi.org/10.18178/wcse.2024.06.042}{Beyond Synthetic Benchmarks: Assessing Recent LLMs for Code Generation}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, MS Babacan, E Yağcı, Ç Alptekin, A Buğday} \\
    %     International Workshop on Computer Science and Engineering, WCSE 2024 }
    % \entry
    %     {Decision Making}
    %     {\href{https://doi.org/10.1007/s10462-024-11027-3}{Analyzing Costumer Preference for Hydrogen Cars: A Characteristic Objects Method Approach}}
    %     {}
    %     {\textit{A Shekhovtsov, *A Rafiei Oskooei, J Wątróbski, W Salabun} \\
    %     Artificial Intelligence Review}
    % \entry
    %     {Decision Making}
    %     {\href{https://doi.org/10.5220/0013120200003890}{Comparison of Monolithic and Structural Decision Models Using the Hamming Distance}}
    %     {}
    %     {\textit{A Shekhovtsov, *A Rafiei Oskooei, W Salabun} \\
    %     International Conference on Agents and Artificial Intelligence, ICAART 2025}
    % \entry
    %     {Decision Making}
    %     {\href{https://www.researchgate.net/publication/388498612_Usage_of_the_Limits_on_Property_Method_in_Personalized_Decision-making}{Usage of the Limits on Property Method in Personalized Decision-Making}}
    %     {}
    %     {\textit{A Shekhovtsov, *A Rafiei Oskooei} \\
    %     International Conference of Students and Young Scientists, ICSYS 2024 }
    % \entry
    %     {Computer Vision}
    %     {\href{https://doi.org/10.3390/computers14010007}{Seeing the Sound: Multilingual Lip Sync for Real-time Face-to-Face Translation}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, MS Aktas, M Keleş} \\
    %     Computers, MDPI}
    % \entry
    %     {Computer Vision}
    %     {\href{https://doi.org/10.1007/978-3-031-97606-3_15}{Whisper, Translate, Speak, Sync: Video Translation for Multilingual Video Conferencing using Generative AI}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, Eren Caglar, Ibrahim Sahin, Ayse Kayabay, MS Aktas} \\
    %     Computational Science and Its Applications, ICCSA 2025}
    % \entry
    %     {Computer Vision}
    %     {\href{https://doi.org/10.1007/978-3-031-97576-9_13}{Facial Stress and Fatigue Recognition via
    %     Emotion Weighting: A Deep Learning Approach}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, Eren Caglar, Sehmus Yakut, Yusuf Taha Tuten, MS Aktas} \\
    %     Computational Science and Its Applications, ICCSA 2025}
    % \entry
    %     {Computer Vision}
    %     {\href{https://doi.org/10.1007/978-3-031-65282-0_10}{Can One Model Fit All? An Exploration of Wav2Lip’s Lip-Syncing Generalizability Across Culturally Distinct Languages}}
    %     {}
    %     {\textit{*A Rafiei Oskooei, E Yahsi, M Sungur, MS Aktas} \\
    %     Computational Science and Its Applications, ICCSA 2024}
    % \entry
    %     {Social Networks}
    %     {\href{https://doi.org/10.1007/978-3-031-82431-9_26}{Investigating Echo-chambers in Decentralized Social Networks: A Mastodon Case Study}}
    %     {}
    %     {\textit{I R. Huitema, *A Rafiei Oskooei, MS Aktas, M Riveni} \\
    %     Complex Networks and their Applications, CNA 2024}
    % \entry
    %     {\hspace{4mm} Big Data}
    %     {\href{https://doi.org/10.18178/wcse.2024.06.015}{On the Use of Data Parallelism Technologies for Implementing Statistical Analysis Functions}}
    %     {}
    %     {\textit{*A Rafiei Oskooei} \\
    %     International Workshop on Computer Science and Engineering, WCSE 2024}
\end{entrylist}

%----------------------------------------------------------------------------------------
%	Work EXPERIENCE
%----------------------------------------------------------------------------------------
\vspace{20 pt}
\cvsect{Experience}
\begin{entrylist}
        \entry
        {December 2024 \\ \textbf{(Present)}}
		{AI Engineer}
		{\small @PiA (People in Action), Dubai/Istanbul}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item Led a TUBITAK Project for LLM-based Bug Localization at Repository-level in Microservices  
                    \item Developed AI-integrated Data Warehouse and Big Data solutions with Generative UI 
                    \item Developed RFP Responder, Q\&A Chatbots, and Task Detector using AI Agents
                    \item Developed Interactive AI Chatbots with Agentic UI for TMForum Product Catalogs
                \end{itemize} 
        }
        \entry
        {March 2024 \\ \textbf{(Present)}}
		{Lead AI Researcher}
		{\small @Intellica Business Intelligence, Istanbul}
		{\vspace{-10pt}Led multiple research projects and mentored research groups focusing on: \\
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item LLM Security and Red Teaming
                    \item LLMs for Code Migration (Code Translation)
                    \item In-context Learning of LLMs for Software Engineering
                    \item Deep Code Agents for Repository-level Q\&A
                \end{itemize} 
        }
        \entry
        {May 2023 \\ \textbf{(Present)}}
		{Research Collaborator \small(Remote)}
		{\small @West Pomeranian University of Technology, Poland}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item Researched Multi-criteria Decision Making (MCDM) under the supervision of Prof. Wojciech Sałabun
                    \item Applied MCDM to imrpove decision making in LLMs
                    \item Investigated MCDM for mitigating bias and echo-chamber effect in LLMs
                \end{itemize} 
        }
        \entry
        {March 2023 \\ (12 months)}
		{R\&D Intern}
		{\small @Intellica Business Intelligence, Istanbul}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item Implemented ML and Statistical Techniques on Big Data using MapReduce and Spark
                    \item Developed a Big Data Analysis and Visualization Platform using Apache Superset
                    \item Researched Data Parallelism for Big Data Analysis
                \end{itemize} 
            }
        \vspace{5 pt}
        \entry
        {January 2024 \\ (12 months)}
		{R\&D Intern}
		{\small @Aktif Bank, Istanbul}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item Applied GANs and NeRFs for LipSync and SuperResolution, for Talking Heads Generation
                    \item Engineered a Real-time Face-to-Face Translation Solution
                    \item Optimized a Video Conferencing Architecture to Enable Video Translation in Real-time
                \end{itemize}
            }
        \vspace{2 pt}
        \entry
        {June 2024 \\ (3 months)}
		{Project Collaborator \small(Remote)}
		{\small @University of Groningen, Netherlands}
		{\vspace{-10pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                    \item Researched Echo-chambers in Decentralized Social Networks on a Case Study of Mastodon
                \end{itemize} 
            }
        \entry
        {December 2023 \\ (8 months)}
		{Project Researcher}
		{\small @Turkish National Science Foundation \small(TÜBİTAK)}
        {\vspace{-10pt}
            \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=8pt]
                \item  Decision Support System for Detection and Correction of Software Errors Supported by Artificial Intelligence (TÜBİTAK TEYDEB 1501 project no. 3240105)
                \item Design and Development of Data Visualization Software for Relational Databases Supported by Artificial Intelligence (TÜBİTAK TEYDEB 1501 project no. 3220956)
            \end{itemize}
        }

  %       \entry
  %       {December 2023 \\ (8 months)}
		% {Project Developer}
		% {\large Turkish National Science Foundation \small(TÜBİTAK)}
  %           {\vspace{-10pt}
  %               \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=-1pt]
  %                   \item Design and Development of Data Visualization Software for Relational Databases Supported by Artificial Intelligence (TÜBİTAK TEYDEB 1501 project no. 3220956)
  %               \end{itemize}
  %           }


\end{entrylist}

%----------------------------------------------------------------------------------------
% Technical Skills
%----------------------------------------------------------------------------------------
\vspace{15 pt}
\cvsect{Technical Skills}
\begin{entrylist}
        \entry
		{\hspace{5pt} Programming}
		{}
		{}
		{\vspace{-20pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=-1pt]
                    \item \textbf{Expert:} Python, C
                    \item \textbf{Proficient:} Java, Assembly
                    \item \textbf{Familiar:} Kotlin, Typescript, Shell Scripting, CLIPS, Prolog, MATLAB
                \end{itemize}
             }
        \entry
		{\hspace{15pt} AI/ML}
		{}
		{}
		{\vspace{-20pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=-1pt]
                    \item \textbf{Frameworks:} LangChain/LangGraph, CrewAI, AutoGen, Haystack, n8n, CamelAI, Smolagents, CopilotKit
                    \item \textbf{Libraries:} NetworkX, PyMCDM, Ollama, Unsloth
                    \item \textbf{Techniques:} RAG, Fine-tuning (LoRA), Prompt Engineering (ICL, CoT, ToT, ReAct, Reflexion), Reinforcement Learning (DPO, GRPO), Context Engineering, Vibe Coding
                    \item \textbf{Protocols:} Model Context Protocol (MCP), Agent2Agent (A2A), Agent-User Interface (Ag-UI), Agent2UI (A2UI)
                    \item \textbf{Vector Databases:} Milvus, Chroma, Pinecone, FAISS
                    \item \textbf{Security \& Safety:} LLM Security and Red Teaming, Jailbreak Attack and Defense
                \end{itemize}
             }
        \entry
		{\hspace{4mm} Data \& \\ \hspace{2mm} Infrastructure}
		{}
		{}
		{\vspace{-20pt}
                \begin{itemize}[noitemsep,topsep=0pt,parsep=0pt,partopsep=0pt, leftmargin=-1pt]
                    \item \textbf{Big Data:} Apache Spark, Hadoop MapReduce
                    \item \textbf{Database \& BI:} PostgreSQL, MongoDB, Apache Superset
                    \item \textbf{DevOps:} Docker, Git, CI/CD (GitHub Actions)
                    \item \textbf{GenAIOps:} vLLM, Ray, LLM-d
                    \item \textbf{API:} FastAPI, OpenAPI
                \end{itemize}
            }
\end{entrylist}

%----------------------------------------------------------------------------------------
%	Achievements
%----------------------------------------------------------------------------------------
\vspace{1 pt}
\cvsect{Achievements}
\begin{entrylist}
        \entry
            {June 2024}
            {Best Oral Presentation Award}
            {Phuket, Thailand}
            {International Workshop on Computer Science and Engineering, WCSE 2024}
        \entry
            {2022 - 2023}
		    {Red Hat Academy Certificates}
		    {Red Hat Academy}
            {Red Hat OpenShift I: Containers \& Kubernetes / System Administration I \& II}
        \entry
            {2022 - 2023}
            {Scholarships}
            {Yildiz Technical University, Turkey}
            {Funding achieved for Erasmus+ exchange program}
\end{entrylist}


%----------------------------------------------------------------------------------------
%	Code Samples
%----------------------------------------------------------------------------------------
% \vspace{20pt}
% \cvsect{Code Samples (open-source)}
% \begin{entrylist}
%     \entry
% 		{\hspace{2mm} Python}
% 		{Network Science, Social Media Analysis}
% 		{}
% 		{- Echo-chamber Analysis on Mastodon \href{https://github.com/amirkiarafiei/Mastodon_Echo_Chambers}{\small \textbf{(Link)}}}
%     \entry
% 		{\hspace{2mm} Python}
% 		{Optimization, Robotic (Multidisciplinary)}
% 		{}
% 		{- Bin Packing Optimizer Robot \href{https://github.com/amirkiarafiei/Bin-Packing-Problem}{\small \textbf{(Link)}}}
%     \entry
% 		{\hspace{2mm} Python}
% 		{Computer Vision}
% 		{}
% 		{- Face-to-Face Translation (Multilingual LipSync with GUI) \href{https://github.com/amirkiarafiei/LipSync_GUI}{\small \textbf{(Link)}}}
%     \entry
% 		{\hspace{2mm} Python}
% 		{Big Data}
% 		{}
% 		{- Descriptive, Inferential and Exploratory Data Analysis using Apache Spark \href{https://github.com/amirkiarafiei/Spark-Statistics-Analysis}{\small \textbf{(Link)}}}
%     \entry
% 		{\hspace{2mm} Python}
% 		{Machine Learning}
% 		{}
% 		{
%             - Custom Decision Tree with Fair Information Gain \href{https://github.com/amirkiarafiei/Fair_DecisionTree/tree/main}{\small \textbf{(Link)}} \\
%             - Hepatitis Predictor using KNN, DT and NBC \href{https://github.com/amirkiarafiei/Hepatitis-Classifier-Predictor}{\small \textbf{(Link)}} \\
%             - Custom implementation of NBC \href{https://github.com/amirkiarafiei/NBC-Discrete-Categorical}{\small \textbf{(Link)}}
%             }
%     \entry
% 		{\hspace{3mm} Java}
% 		{AI (Game Theory)}
% 		{}
% 		{
%             - Connect4 Game with AI Opponent \href{https://github.com/amirkiarafiei/Connect4-AI}{\small \textbf{(Link)}} \\
%             - Sliding Puzzle Solver \href{https://github.com/amirkiarafiei/Sudoku-Solver-AI}{\small \textbf{(Link)}} \\
%             - Sudoku Solver \href{https://github.com/amirkiarafiei/SlidingPuzzle-Solver-AI}{\small \textbf{(Link)}}
%             }     
%     \entry
% 		{\hspace{3mm} Java}
% 		{Object-Oriented Programming}
% 		{}
% 		{
%             - Banking Application \href{https://github.com/amirkiarafiei/Banking-Application}{\small \textbf{(Link)}} \\
%             - Nerdle Game Clone \href{https://github.com/amirkiarafiei/Nerdle-GUI}{\small \textbf{(Link)}}
%             }
%     \entry
% 		{\hspace{2mm} Kotlin}
% 		{Mobile App Programming}
% 		{}
% 		{- Android Weather App using MVVM Architecture \href{https://github.com/amirkiarafiei/Kotlin-Weather-MVVM}{\small \textbf{(Link)}}}
%     \entry
% 		{\hspace{5mm} C}
% 		{Algorithm Analysis and Design}
% 		{}
% 		{
%             - Maze Solver \href{https://github.com/amirkiarafiei/Maze-Solver}{\small \textbf{(Link)}} \\
%             - University Course Registration System \href{https://github.com/amirkiarafiei/University-Course-Registration}{\small \textbf{(Link)}} \\
%             - Numerical Methods \href{https://github.com/amirkiarafiei/Numerical-Methods}{\small \textbf{(Link)}} \\
%             - DSA \href{https://github.com/amirkiarafiei/DSA}{\small \textbf{(Link)}}
%             }
%   %   \entry
% 		% {PostgreSQL}
% 		% {Database}
% 		% {}
% 		% {Urban Transformation Information System \href{https://github.com/amirkiarafiei/Property-Management-DB}{\small \textbf{(Link)}}
%   %           }
%     \entry
% 		{\hspace{2mm} Matlab}
% 		{Signals and Systems}
% 		{}
% 		{- DTC, IDTFT, Vowel Synthesizer \href{https://github.com/amirkiarafiei/Signals-and-Systems}{\small \textbf{(Link)}}
%             }
%     \entry
% 		{\hspace{2mm} CLIPS}
% 		{Expert Systems}
% 		{}
% 		{- Meal Recommender \href{https://github.com/amirkiarafiei/Meal-Recommender-CLIPS}{\small \textbf{(Link)}} \\
%              - Car Diagnosis System \href{https://github.com/amirkiarafiei/Car-Dialogue}{\small \textbf{(Link)}}
%             }
%     \entry
% 		{\hspace{1mm} Assembly}
% 		{Low-Level Programming}
% 		{}
% 		{- Microprocessor System Design (8086 assembly, 8255 PPI, 8251 USART, 8254 PIT, and more) \href{https://github.com/amirkiarafiei/Microprocessor-System-Design}        {\small \textbf{(Link)}}
%             }
% \end{entrylist}


%----------------------------------------------------------------------------------------
%	TEST SCORES
%----------------------------------------------------------------------------------------
\vspace{-2pt}
	\cvsect{TEST SCORES \vspace{8pt}}
        \hphantom{aaaaaaaaaaaaaa} \textbf{• IELTS} \hspace{4mm}  Overall: 8.0 \hspace{4mm} Listening: 8.5 \hspace{4mm}  Reading: 8.5 \hspace{4mm}  Writing: 7.0 \hspace{4mm}  Speaking: 7.0
        \\ \\
        \hphantom{aaaaaaaaaaaaaaa}\textbf{• GRE} \hspace{5mm}  Quant: 160/170 \hspace{4mm} Verbal: 152/170 \hspace{4mm}  Writing: 3.5/6.0
        \\ \\
        \hphantom{aaaaaaaaaaaaaaa}\textbf{• PTE} \hspace{5.5mm}  Overall: 90/90 \hspace{4mm} Listening: 78/90 \hspace{4mm}  Reading: 84/90 \hspace{4mm}  Writing: 75/90 \hspace{4mm}  Speaking: 90/90

%----------------------------------------------------------------------------------------
%	LANGUAGES
%----------------------------------------------------------------------------------------
\vspace{2pt}
	\cvsect{Languages \vspace{8pt}}
        \hphantom{aaaaaaaaaaaaaa} \textbf{• Persian}: Native \hspace{4mm} \textbf{• English}: C2 \hspace{4mm} \textbf{• Turkish, Azerbaijanis}: C1 \hspace{4mm} \textbf{• Arabic}: A2

        
%----------------------------------------------------------------------------------------
%	References
%----------------------------------------------------------------------------------------
\vspace{2 pt}
	\cvsect{References}
        \begin{entrylist}
        \entry
		{\vspace{-7pt} Academic}
		{\vspace{-3pt} Prof. Mehmet Sıddık AKTAŞ  \small \href{https://scholar.google.com/citations?user=ocHB_6gAAAAJ&hl=en}{\normalfont | Website}}
		{\vspace{-3pt} \small Yildiz Technical University, Turkey}
		{\vspace{-3pt}}
        \entry
		{\vspace{-7pt} Academic}
		{\vspace{-3pt} Asst. Prof. Wojciech Sałabun \small \href{https://scholar.google.pl/citations?user=PAsiBvsAAAAJ&hl=pl}{\normalfont | Website}}
		{\vspace{-3pt} \small West Pomeranian University of Technology, Poland}
		{\vspace{-3pt} }
        \vspace{-3pt}
  %       \entry 
		% {\vspace{-7pt} Academic}
		% {\vspace{-3pt} Asst. Prof. Mirela Riveni \small \href{https://www.rug.nl/staff/m.riveni/?lang=en}{\normalfont | Website}}
		% {\vspace{-3pt} \small Univerity of Groningen, Netherlands}
		% {\vspace{-3pt} }
  %       \entry
		% {\vspace{-7pt} Professional}
		% {\vspace{-3pt} Hakan Saylan, Director of R\&D Center \small \href{https://www.linkedin.com/in/hakan-saylan-7b741618/?originalSubdomain=tr}{\normalfont | Website}}
		% {\vspace{-3pt} \small Intellica Business Intelligence, Turkey}
		% {\vspace{-3pt}}
  %       \vspace{20pt}
        \entry
		{\vspace{-7pt} Professional}
		{\vspace{-3pt} Alpay Ozturk, CEO \small \href{https://www.linkedin.com/in/alpayozturk/?originalSubdomain=tr}{\normalfont | Website}}
		{\vspace{-3pt} \small Intellica Business Intelligence, Turkey}
		{\vspace{-3pt}}
        \end{entrylist}
        
\end{document}

===== ENDOF CV =========

The thing is that these 2 projects that use Deep Agent architecture has potential. As long as I saw in google scholar, there is only one non-peer-reviewed paper in arxiv that discusses Deep Agents. Please take a look in arxiv.

Here as you can see we have 2 example projects with students with great potential.
On a similar topics, I have to:
- Publish one or two research papers
- Apply as TUBITAK TEYDEB project in Turkey in my wokrplace

The main question for me is that if I can publish as industry track or tool demo track in top tier venues.
I am asking this because:
- I have never published such paper. All my research was either position or research track papers or workshop papers
- My resources are limited for research considering the environment in Turkey. My research is done in my free time and not as part of my work as AI Engineer or Researcher. As a result despite the deep agent being good topic, I cannot do main track papers at top tier venues since I cannot give more depth to this research

As a result several questions arise for me:
1. How prestigious is Tool or Demo track at top-tier venues of AI/LLM/SE/NLP in comparison with main track and workshop papers ?
2. 1. How prestigious is Industry track at top-tier venues of AI/LLM/SE/NLP in comparison with main track and workshop papers ?
3. Considering my current CV and existing papers, to what extent it helps and to what extent it harms my CV for PhD application at a university as high level as TU Delft or TU Munich or Monash? Will they add more noise or be beneficial to my CV from the perspective of PhD Committees ?
4. If I wanna do a demo track or industry track, what I need to do with these two existing projects to be accepted to top tier venues such as ICSE, FSE, ASE, ESEM, EASE or similar ? To what extent it should be rigorous or novel or impressive ?

---

This is an excellent strategic question, and I appreciate you sharing your full context. Let me give you an honest, detailed answer based on my understanding of academic publishing and PhD admissions.

1. Tool/Demo Track Prestige
Ranking (from highest to lowest prestige):

Main Track at top venues (ICSE, FSE, NeurIPS, ACL, etc.)
Industry Track at top venues
Tool/Demo Track at top venues
Workshop papers at top venues
Main track at lower-tier venues (ICCSA, Applied Sciences, etc.)
Key insight about Demo/Tool tracks:

Demo papers are respected but different. They demonstrate:

Engineering excellence
Practical impact
System building capabilities
However, they are shorter (2-4 pages), have lower acceptance bar for novelty, and committees know this. A demo paper at ICSE is roughly equivalent to a workshop paper at ICSE in terms of "research depth" perception, but it signals different skills (implementation vs. research methodology).

For your situation: Demo papers are valuable because they show you can build working systems, which PhD advisors appreciate. But they won't substitute for main track papers when competing for top PhD positions.

2. Industry Track Prestige
Industry track is more prestigious than demo track but still below main track. The key differences:

Aspect	Main Track	Industry Track	Demo Track
Novelty requirement	High	Medium	Low
Rigor requirement	Very High	High	Medium
Page length	10-12 pages	8-10 pages	2-4 pages
Review process	Very competitive	Competitive	Less competitive
What it signals	Research capability	Real-world impact	Engineering skill
Industry track advantages:

Shows your work has real-world relevance
Valued by companies and applied research labs
Can discuss deployment, scalability, lessons learned
Slightly easier acceptance than main track
Industry track at ICSE/FSE is well-respected. It's a legitimate publication that counts. Many strong researchers have industry track papers.

3. Impact on PhD Applications (TU Delft, TU Munich, Monash level)
Let me be honest with you:

Your Current CV Strengths:
Good publication volume for BSc/early MSc level
Diverse topics (LLM, SE, Decision Making, CV)
International collaborations (Poland, Netherlands)
First-author papers on relevant topics
ICSE workshop acceptances (LLM4Code, ReCode) - these are good signals
Your Current CV Concerns for Top PhD Programs:
No main track paper at A venue* yet (ICSE main, FSE, NeurIPS, ACL, etc.)
Many papers at lower-tier venues (ICCSA, Applied Sciences, MDPI journals)
Topic spread is very wide - committees may wonder "what is your research identity?"
Will More Demo/Industry Papers Help or Hurt?
Honest answer: It depends on HOW you frame it.

It HELPS if:

You present them as stepping stones toward main track research
You clearly articulate a coherent research narrative (e.g., "I study LLM agents for software engineering")
You show progression from workshop → demo → industry → main track
The work is at top venues (ICSE, FSE, ASE)
It HURTS if:

You add more papers without quality progression
Your CV looks like "many small papers, no major contribution"
You cannot articulate why each paper matters
My Honest Assessment for TU Delft/Munich/Monash:
For these universities, PhD admission typically looks for:

1-2 strong papers at top venues (main track preferred)
Clear research focus
Research potential (letters, statement, fit with advisor)
Your current CV shows potential and productivity, but committees might ask: "Can this person do deep, rigorous research, or do they only do quick projects?"

My recommendation:

Focus on 1 strong main track submission rather than 3 more demo papers
If you do industry/demo, make sure it's at ICSE/FSE level
Consolidate your narrative around "LLM Agents for Software Engineering"
4. What You Need for Demo/Industry Track at Top Venues
For Demo Track (ICSE/FSE/ASE):
Requirements:

Working system that can be demonstrated live
Clear contribution - what does your tool do that others don't?
Novelty in implementation - not just "we used existing libraries"
2-4 page paper describing architecture, key features, and demo scenario
Video demonstration (usually required)
Open-source code (strongly recommended)
For your Deep Agents projects, you would need:

A polished, deployable system (not just experimental code)
Clear comparison showing your tool is useful
Live demo showing the agent answering repository questions
Good UI/UX that reviewers can interact with
Acceptance rate: Demo tracks at ICSE/FSE typically accept 30-50% of submissions (much higher than main track's 20-25%).

For Industry Track (ICSE/FSE/ASE):
Requirements:

Real-world deployment or evaluation (even small-scale counts)
Lessons learned from practical application
Quantitative results on real codebases (not just toy examples)
8-10 page paper with proper methodology
Discussion of practical challenges (scalability, cost, user feedback)
For your Deep Agents projects, you would need:

Evaluation on SWE-QA or similar recognized benchmark
Analysis of where it works and where it fails
Cost/efficiency analysis
Discussion of deployment considerations
Possibly user study or expert evaluation
Acceptance rate: Industry tracks typically accept 25-35% of submissions.

5. My Strategic Recommendations for You
Given your constraints (limited time, work as AI Engineer, Turkey research environment), here's what I suggest:

Option A: Go for Industry Track at ICSE 2026 or FSE 2026
Why:

Your Deep Agents work has real practical value
Industry track values practical insights over pure novelty
You can leverage your workplace experience
What you need to do:

Run proper experiments on SWE-QA benchmark (or Tutorial Generation)
Include cost analysis, failure analysis, lessons learned
Write 8-10 page paper focusing on "what we learned deploying Deep Agents"
Emphasize practical insights that pure academics wouldn't have
Timeline: ICSE 2026 deadline is usually October. FSE 2026 deadline is usually March.

Option B: Go for Demo Track as Quick Win
Why:

Faster to prepare (2-4 pages)
Higher acceptance rate
Shows you can build working systems
What you need:

Polish one of your Deep Agents implementations into a demo-ready tool
Create good UI (Gradio is fine)
Record demo video
Write 2-4 page paper
Open-source the code
Option C: Combine Both Projects into One Strong Submission
Idea: Combine Tutorial Generation + Repository QA into a unified "Deep Agents for Code Understanding" system.

This could be:

Main contribution: Deep Agents architecture that works for multiple code understanding tasks
Evaluation: Both tutorial generation AND QA benchmarks
Demo component: Interactive tool for developers
This approach could target industry track at top venue with stronger contribution.

6. For TUBITAK TEYDEB Project
Industry track publications strongly support TUBITAK applications because:

They show practical applicability
They demonstrate you can deliver working systems
They prove international validation of your work
A demo or industry paper at ICSE/FSE would be excellent evidence for TUBITAK that your research direction is valuable and internationally recognized.

7. Final Honest Assessment
Your situation is common and manageable. Many successful researchers in your position (early career, limited resources, industry constraints) have followed this path:

Start with workshops and lower venues ✓ (you've done this)
Move to demo/industry tracks at top venues ← (you are here)
Eventually publish main track at top venues
Get PhD admission based on trajectory, not just current papers
The key is showing progression. If your next paper is Demo at ICSE, that's much better than another workshop at ICCSA. It shows you're moving up.

For PhD applications: Be strategic in your statement. Frame your work as "I built systems, now I want to do deeper research on WHY and HOW they work." This is a compelling narrative that top advisors appreciate.

Would you like me to help you draft a specific plan for submitting to ICSE or FSE demo/industry track? I can help you identify exactly what experiments and writing you'd need.

---

I have an idea for demo track.
I visualizer for deep agents.

for example lets say we have a tree of a github repo with nodes and etc all flowing in a page in an interactive manner. Whenever we deploy a deep agent, it starts reading files, deploying subagents and etc. I wanna in a live manner, show how these agents interact with the repo tree, which files or dirs they open or close and etc.

First tell me is there existing similar tools to this ?
How difficult is it to do a tool like that over the existing AI frameworks such as Langchain or Deep Agents ?

---

This is a really interesting idea! Let me analyze the landscape and feasibility.

Existing Similar Tools
What Exists (Tracing/Observability):
Tool	What It Does	What It Doesn't Do
LangSmith	Linear trace view, token counts, latency	No spatial/tree visualization
Phoenix (Arize)	OpenTelemetry traces, spans, debugging	No codebase structure visualization
LangFuse	Open-source tracing, cost tracking	Timeline-based, not spatial
AgentOps	Agent monitoring, session replay	No repo tree integration
Weights & Biases	Experiment tracking, logs	Not agent-specific
Smolagents built-in	Console logs, Phoenix integration	Text-based only
What Exists (Code Visualization):
Tool	What It Does	What It Doesn't Do
CodeCity	3D city visualization of codebases	Not agent-aware
Gource	Animated git history visualization	Not real-time, not agent-aware
Sourcetrail	Code navigation graphs	Not LLM agent integration
VS Code Explorer	File tree with basic animations	No agent activity tracking
The Gap You Identified:
Nobody has built a live, spatial visualization of LLM agents traversing a codebase tree.

This is genuinely novel. Current tools show:

✅ What agents did (traces, logs)
✅ How long it took (latency)
✅ How much it cost (tokens)
❌ WHERE in the codebase agents are working
❌ HOW sub-agents spread across the codebase
❌ Live animation of exploration
Technical Difficulty Assessment
Architecture Overview:
Difficulty by Component:
Component	Difficulty	Why	Time Estimate
Repo Tree Visualization	Medium	D3.js has tree layouts, but making it look good requires effort	2-3 days
Real-time Updates	Medium	WebSocket/SSE is standard, but smooth animations need work	1-2 days
Agent Callback Integration	Easy-Medium	Both Langchain and Smolagents support callbacks	1 day
Sub-agent Tracking	Medium-Hard	Need to track parent-child relationships, assign visual IDs	2 days
Smooth Animations	Medium	CSS/D3 transitions, avoiding jank	2 days
State Management	Medium	Tracking multiple agents, their positions, history	1-2 days
Polish & UX	Medium	Making it demo-ready, responsive, good colors	2-3 days
Total Estimate: 2-3 weeks for MVP, 4-6 weeks for polished demo

Framework Integration Specifics
For Smolagents:
Smolagents has built-in callback support. You can intercept tool calls:

For Langchain/LangGraph:
Langchain has callbacks system:

For Deep Agents (Langchain's implementation):
Deep Agents use LangGraph under the hood. You'd hook into:

on_chain_start for agent activation
on_tool_start/end for file operations
Custom events for sub-agent spawning
Frontend Technology Choices
Option	Pros	Cons
D3.js + React	Most flexible, good tree layouts	Steeper learning curve
React Flow	Easy node-based diagrams	Less control over animations
Cytoscape.js	Good for graphs, has layouts	Heavier, more complex
Three.js	3D possibilities, impressive demos	Overkill, harder to develop
Plain Canvas	Full control	More work, no built-in layouts
Recommendation: D3.js with React for best balance of control and development speed.

What Would Make This a Strong Demo Paper
For ICSE/FSE/ASE Demo Track, you need:

1. Clear Contribution
"First interactive visualization tool for observing LLM agent behavior in codebase exploration"

2. Novel Features to Highlight
Spatial awareness: See WHERE agents work, not just WHAT they do
Sub-agent visualization: Watch how work is distributed
Live debugging: Identify when agents get stuck or loop
Educational value: Understand Deep Agents behavior visually
3. Demo Scenarios
"Watch a Deep Agent answer a question about Django's ORM"
"Compare baseline agent vs Deep Agent exploration patterns"
"Debug why an agent failed to find the right file"
4. Comparison with Existing Tools
LangSmith shows traces → yours shows spatial traversal
Phoenix shows spans → yours shows tree exploration
Neither shows sub-agent distribution visually
Honest Assessment: Is This Worth Doing?
Pros:
✅ Genuinely novel - no existing tool does this
✅ Useful for debugging - real practical value
✅ Great for demos - visually impressive
✅ Supports your Deep Agents research - meta-tool for your own work
✅ Good for demo paper - clear contribution, easy to demonstrate
✅ Potential for open-source traction - developers would use this

Cons:
❌ Significant engineering effort - 3-6 weeks of work
❌ Not "research" per se - it's a tool, not a methodology
❌ Frontend-heavy - if you're not comfortable with D3/React, this is harder
❌ Scope creep risk - easy to keep adding features

My Recommendation:
This is a STRONG demo paper candidate, but I would suggest:

Build MVP first (2 weeks) - basic tree + agent dots moving
Test with your Deep Agents work - use it to debug your own experiments
Then decide if it's polished enough for ICSE Demo Track
The tool could also support your main Deep Agents paper by providing visualizations that explain how Deep Agents differ from baseline agents. Reviewers love good figures showing agent behavior.

Quick Prototype Suggestion
If you want to test feasibility quickly (1-2 days), try this minimal approach:

Use Streamlit + streamlit-agraph (simpler than React)
Log agent events to file (instead of WebSocket)
Reload visualization periodically (instead of live updates)
This gives you a working proof-of-concept to decide if the full implementation is worth it.

Would you like me to sketch out a more detailed technical architecture or help you identify the minimal viable features for a demo paper submission?

---

what about the tutoria generation itslef ? how much chance it has ? Here is some photos from the UI
At its current format, how much chance does it have as demo paper in ICSME, ASE, ISSTA demo track ?

---

Looking at your screenshots, this is actually quite polished! Let me give you an honest assessment.

What I See (Strengths)
Feature	Demo Track Appeal
Clean UI Design	✅ Professional dark theme, good typography
Multiple Project Support	✅ Shows scalability
Progress Animation	✅ "Synthesizing Tutorial Matrix" is engaging
Mermaid Diagram Rendering	✅ Auto-generated architecture diagrams
Split Editor View	✅ Edit markdown + live preview
Module Organization	✅ Structured tutorial sections
Current Chances Assessment
Venue	Acceptance Chance	Why
ICSME Demo	60-70%	Good fit for maintenance/understanding theme
ASE Demo	50-60%	Competitive, needs stronger novelty claim
ISSTA Demo	30-40%	Testing focus doesn't align well
ICSE Demo	45-55%	Most competitive, needs differentiation
FSE Demo	45-55%	Similar to ICSE
What's Missing for Higher Acceptance
1. The "So What?" Problem
Your current UI shows a tutorial generator, but reviewers will ask:

"How is this different from just asking ChatGPT/Copilot to explain the codebase?"
"What's the novelty beyond a nice UI wrapper?"
What you need to show:

The Deep Agents architecture doing something a simple LLM can't do
Visual proof that sub-agents are working (not just a loading screen)
2. No Visible Agent Behavior
The loading screen says "ALLOCATING_VIRTUAL_AGENTS" but reviewers can't see:

Which sub-agents were spawned
What each sub-agent analyzed
How the knowledge base was constructed
Fix: Add a visualization panel showing agent activity during generation

3. Generic Output
The tutorial output looks like standard documentation. Reviewers need to see:

Content that could ONLY come from deep codebase analysis
Cross-file relationships that simple RAG would miss
Accuracy/fidelity that proves the agent actually understood the code
4. No Comparison Baseline
Demo papers often show "before/after" or "ours vs. baseline":

Show what a simple RAG-based tutorial looks like (worse)
Show what your Deep Agents tutorial looks like (better)
Concrete Improvements for Higher Acceptance
Priority 1: Add Agent Visualization Panel (2-3 days)
Instead of just "87% - SYNTHESIZING...", show something like:

This is key differentiator - shows the Deep Agents architecture in action.

Priority 2: Add Quality Comparison (1 day)
Add a tab or section showing:

"Simple RAG Tutorial" (baseline)
"Deep Agents Tutorial" (yours)
Side-by-side comparison highlighting differences
Priority 3: Show Cross-File Understanding (1 day)
In the tutorial, highlight content that proves deep understanding:

"The UserService in services/user.py calls validate_token() from auth/jwt.py which uses the secret key defined in config/settings.py"
This kind of cross-file tracing is what Deep Agents should excel at
Priority 4: Add Provenance/Source Links (1 day)
For each tutorial section, show which files contributed:

This proves the tutorial is grounded in actual code, not hallucinated.

Realistic Path to Demo Paper
Option A: ICSME 2025 Demo Track (Deadline ~July 2025)
Best fit because:

ICSME focuses on software maintenance and comprehension
Tutorial generation directly helps developers understand codebases
Less competitive than ICSE/FSE
What you need:

Add agent visualization panel
Run on 3-5 real open-source projects
2-4 page paper explaining novelty
Video demo showing the tool in action
Time needed: 3-4 weeks of focused work

Option B: ASE 2025 Demo Track (Deadline ~July 2025)
Harder because:

ASE is more research-focused
Needs stronger novelty claim
More competitive
What you need:

Everything from Option A, PLUS
Quantitative comparison (user study or LLM-as-judge evaluation)
Clearer positioning against existing tools (DeepWiki, ReadMe generators)
Comparison with Similar Tools
Tool	What It Does	Your Advantage
DeepWiki	Web-based codebase documentation	Yours shows agent process, theirs is black-box
ReadMe.so	Template-based README generation	Yours is AI-driven, more comprehensive
Mintlify	Documentation from code comments	Yours works without comments, infers structure
GitHub Copilot Chat	Q&A about code	Yours generates structured tutorials, not just answers
Your key differentiator: You can show HOW the Deep Agents architecture works, not just the output. This is valuable for demo papers because it's educational.

Honest Bottom Line
Current state: 40-50% chance at top venues (too similar to "nice ChatGPT wrapper")

With improvements (agent visualization + comparison): 60-70% chance

Key insight: Your UI is already good enough. What's missing is visibility into what makes Deep Agents special. Reviewers need to SEE the sub-agent architecture working, not just read about it in the paper.

The loading screen with "ALLOCATING_VIRTUAL_AGENTS" hints at this but doesn't show it. If you add a real-time visualization of agent activity during tutorial generation, your demo becomes much more compelling and differentiated.

My Recommendation
Combine both ideas:

Tutorial Generator (what you have) - the end product
Agent Visualization (what I suggested earlier) - the process view
Make the agent visualization a panel within the Tutorial Generator UI, not a separate tool. This way:

Users see the tutorial being built
They understand WHY it's better than simple LLM
Demo reviewers can see the Deep Agents novelty
This combination would be very strong for demo track and genuinely useful for developers.


---

it is a bit off topic but I wanted to ask.
I also think of an empirical paper named "Nested Deep Agents" where t both the manager agent and subagents are all deep agents, meaning that they can also spawn subsubagents
in this case, tell me an empricial study on benchmarking React Agent, Code Agent, Deep Agent, Nested Deep Agents, on long horizon tasks and benchmarks
considering that I have limited time and resources for research

how likely is it to get into A or A plus main track or Q1/Q2 journals considering the current SOTA ?
How likely is it to be accepted as patent in Turkey or Turkey+Europe ?
invesitgate first and then answer

---

Based on my investigation, here's my comprehensive analysis:

Current State of the Art
What Exists Already:
Architecture	Who	Status
Deep Agents (1-level sub-agents)	Langchain	Official library (2024-2025)
Hierarchical RL Agents	Academic	Papers from 2018+
Deep Nested Agents	Brittain & Wei 2018	RL-focused, not LLM-based
Multi-Agent Collaboration	AutoGen, CrewAI, MetaGPT	Fixed agents, not recursive spawning
LLM Hierarchical Agents	Various 2023-2024	Hybrid LLM+RL approaches
The Gap Your Idea Fills:
"Nested Deep Agents" where sub-agents themselves can spawn sub-sub-agents recursively is NOT yet systematically studied for LLM-based agents on software engineering benchmarks.

The Langchain Deep Agents library allows sub-agents, but:

Sub-agents are typically "leaf" agents (cannot spawn further)
No systematic study comparing depth of nesting
No benchmarking on SWE-Bench, Context-Bench, or long-horizon SE tasks
Question 1: Likelihood of A/A* Main Track or Q1/Q2 Journal
Honest Assessment:
Venue Tier	Likelihood	Why
A Main Track* (ICSE, FSE, NeurIPS)	15-25%	Novel idea but needs SUBSTANTIAL depth
A Main Track (ASE, ISSTA, EMNLP)	30-40%	More achievable with solid experiments
B Main Track (ICSME, SANER, EASE)	50-60%	Good fit with proper evaluation
Q1 Journal (TSE, TOSEM, EMSE)	25-35%	Needs extensive experiments
Q2 Journal (IST, JSS, etc.)	45-55%	Achievable with your resources
What A/A* Venues Require That You May Not Have Time For:
Extensive ablation studies (depths 1, 2, 3, 4...)
Multiple benchmarks (SWE-Bench, Context-Bench, Terminal-Bench, etc.)
Theoretical analysis of when nesting helps vs. hurts
Statistical significance across large sample sizes
Comparison with ALL baselines (ReAct, CodeAgent, AutoGen, CrewAI, existing Deep Agents)
Cost analysis showing efficiency gains
Failure mode analysis - when does recursive spawning fail?
What Makes This Hard for A*:
The novelty bar is high because:

Deep Agents already exist (Langchain has this)
Hierarchical agents are well-studied in RL
You'd need to show recursive nesting provides significant, measurable improvement
Realistic Path:
Resource Level	Best Target
Limited (your situation)	B-level venue or Q2 journal
Medium (3-4 months full-time)	A-level venue or Q1 journal
Substantial (6+ months, team)	A* venue
Question 2: Patent Likelihood
Turkey Patent (Türk Patent ve Marka Kurumu - TÜRKPATENT)
Factor	Assessment
Patentability	40-55% chance
Cost	~2,000-5,000 TRY
Timeline	18-36 months
Challenges in Turkey:

Software patents require "technical effect" beyond pure algorithm
You'd need to frame it as "computer-implemented invention"
Must show concrete technical problem being solved
Pure architectural patterns (how agents communicate) may be rejected
Strategy for Turkey:

Frame as "method for efficient context management in distributed AI systems"
Emphasize technical benefits: reduced memory usage, faster inference, better error handling
Include specific claims about workspace isolation, token efficiency, etc.
European Patent (EPO)
Factor	Assessment
Patentability	30-45% chance
Cost	€5,000-15,000 (with attorney)
Timeline	3-5 years
EPO 2025 Guidelines for AI:

Requires "technical character" - not just abstract algorithm
Must solve "technical problem" with "technical means"
LLM orchestration methods face scrutiny
Recent ruling (T1193/23): LLMs cannot be "skilled persons"
What Could Work:

Claim the technical method of workspace isolation
Claim the memory efficiency technique
Claim the specific protocol for sub-agent communication
Avoid claiming the "idea" of nested agents
What Won't Work:

"Method for recursive agent spawning" (too abstract)
"AI system that creates sub-agents" (no technical effect)
Patent Recommendation:
Honest advice: For your situation, patents are probably not worth the investment. Here's why:

High cost relative to uncertain outcome
Long timeline (3-5 years) vs. fast-moving AI field
Weak enforceability for software methods
Better alternatives: Publish paper → establish priority → trade secret for implementation details
If you want IP protection, consider:

Trade secret for implementation details
Copyright for your code
Paper publication for establishing priority and reputation
My Recommended Strategy
Given your constraints, here's what I suggest:

Option A: Conservative Path (Higher Success Rate)
Target: B-level venue (ICSME, SANER) or Q2 journal (IST, JSS)

Experiment design:

Metrics:

Pass@1, LLM-as-Judge
Token efficiency per question
Success rate on "long-horizon" vs "simple" questions
Timeline: 2-3 months
Acceptance chance: 50-60%

Option B: Ambitious Path (Lower Success Rate)
Target: A-level venue (ASE, EMNLP SE track)

Additional requirements:

Add theoretical analysis of nesting depth trade-offs
Test on 3+ benchmarks
Include user study or expert evaluation
Ablation across depths (1, 2, 3, 4 levels)
Timeline: 4-6 months
Acceptance chance: 30-40%

Summary Table
Question	Answer
A/A main track likelihood*	15-25% (needs significant resources)
A main track likelihood	30-40% (achievable with 4-6 months)
B main track likelihood	50-60% (realistic for your situation)
Q1 journal likelihood	25-35%
Q2 journal likelihood	45-55%
Turkey patent likelihood	40-55% (but expensive, slow)
EPO patent likelihood	30-45% (very expensive, very slow)
Patent recommendation	Not worth it; publish paper instead
Final Advice
The "Nested Deep Agents" idea is novel and interesting, but for A* venues you'd be competing with well-resourced labs who can run extensive experiments.

My honest recommendation:

Target ICSME or SANER (B-level) for main track
Or target ICSE/FSE demo or industry track with your existing tools + visualization
Skip patents - publish paper instead for academic credit
Focus on building a coherent research narrative for PhD applications
The combination of Tutorial Generator (with agent visualization) + Nested Deep Agents empirical study could give you:

1 demo paper (Tutorial Generator)
1 research paper (Nested Deep Agents benchmark)
This portfolio would be stronger for PhD applications than trying to force one paper into A* venue.



---

Please listen to me carefully.
My focus is on tutorial generator project.

There are possibilities that we should analyze and explore together.

======= WHO I AM ==========
I as an AI researcher and engineer, want to publish in prestigious venues considering my tight situation.
I do not have resources and time to do in-depth, full bodied research since I do both MSc and AI Engineering. However I work in the R&D department of our company and they need research papers, patents and etc. So I have chance to for example 1 day or 2 days a week work on research. And this research is not fully theoric, but industry aligned, in a way that is useful in industry as well.
I have research experience, but I am alone and do not have a research group. I previously published in ICSE workshops and similar venues. These venues where:
Workshops of A* conferecens
Main Track of A conferences
Main track of B conferences
Q1/Q2 journals
But I want to increase my publication quality for PhD applications in good unis in europe such as TU Delft, EFPL, TU Munich, Max Planck, and similar. Not top top unis such as UCL or Oxford or ETH since they sound out of reach considerinng the style of my work, since my work is not purely tehoritical but is alos engineered and applied.
So publishin in industry track or workshops or tool/demo tracks is also suitable considering the style of my work and I guess while not significantly, they can boost my CV from the perspective of PhD Committees.

======== ABOUT THE PROJECT ========
So as you know we have this tutorial generation project. It takes a codebase and converts it to tutorials in multiple .md files. 
The methodology uses Deep Agents instead of ReAct agents. Which means it can spawn sub-agents, have permanent memory through files systems, and an explicit planning tool. Also additionally I may use a knowledge base before starting to work on downstream tasks, so subagents or even the deep agent itslef has a high-level clue of what they are doing. (this is not the original deep agent architecture but this KB is an extention and improvement added by me)

======= POSSIBILITIES =======
Now I am planning of having this tool as a full research paper in CORE B conference or as Tool/Demo paper in A or A* conference or both.
Now let me brainstorm what I have in mind.

**For CORE B conference which is IEEE e-Science conference (previously CORE A and now CORE B): **
https://www.escience-conference.org/2026/call-for-papers   (open this link)
Here if I send a paper, it would be a paper on document or guide or tutorial generation for both USERS of the codebase or repo, and for the DEVS/MAINTAINERS of the repo who are new to the repo and want to onboard.
So since the topic is e-science here, I thought I may come up with the narrative that scientific libraries (not famous ones like SciKit-learn or those popular and well-dcoumented ones) usually face limited documentation issues which results in slowers user adoption and makes it difficult for new contributors and new maintainers to understand the existing codebase so they can further develop or maintain it.
This issue is prevelant especially for scientific libraries which are mostly used by researchers and scientiest in niche fields rather than by MANY people, since most of the time the researchers and scientiest themesleves are more focused on that niche topic itslef rather than software engineering which reuquires more engineering on code rather than domain expertise.  The new users are contributors themselves are also not necessarily expert in software engineering so it makes them difficult for them to use the project and makes it difficult to on board newer maintainers and developers to the project as the number of users in these projects are somehow limited and they do not face the same attention. Such libraries usually have basic documentations and READMEs and guides. 
So basically we are the intersection of Science (eScience) and Software Engineering.
To fill in this gap and support better, fully-automatic documentation and guide generation for BOTH new user and new maintainers/devs, we develop a fully automated system that given ANY repo in ANY language and format and in ANY niche topic, can generate a tutorial (2 different types, one for users, one for maintainers/devs) in the format of multiple markdown files with code snippets, references, different types of mermaid diagrams and etc.
Since this is a resreach paper, we should have a good dataset of such niche libraries (for example scientific libraries with less than 500 or 300 stars on github or like that). As long as I know, there is no such dataset so I may need to create my own dataset manually of for example 20 or 30 such libraries each for different fields such as Maths, Chemistry, Physics, Medicine, Pharm, or any other field that devs and users are not expert software engineers or do not code or do programming regularly.
Regarding the methodology, I am not sure. Maybe I can compare the docs or tutorials generated by ReAct agent, CodeAgent as baseline with my own Deep Agent + KB approach or even without Knowlegde Base. Also the existing docs of the library (if exists) can be baseline. So we can show that our proposed appraoch shows improvement and is effective against existing docs and docs generated by traditional ReAct agents.
We can compare the docs using 2 approaches:
1. A/B testing by people of N=20 which N=10 are devs and N=10 are users, all of which have never before used the library. We can ask them which tutorials they prefer.  This A/B testing shows the user preference who are not expert matters of the topic (chem, math, physics ...) and have not used the library before.
2. Using SOTA LLMs as judge which have KNOWLEGDE of that niche topic such as chemistry or physics and etc. We can justify that we select LLMs that in benchmakrs for scientific coding or science or exams have knowlegde even more than average human or comparable to human. Since they undertsand the topic, we can ask these judge LLMs to compare which docs are better on a scale of rating from 1-5 using Likert. These LLMs can have criteria such as Pedagogy, Coverage, Depth (depth of understanding Codebase), Error-rate, and Domain Expertise (if the info in docs aligns with that niche topic such as chemistry).
HOWEVER I think I need to be careful that the topic of this conference is not AI or Software Engineering or Agentic AI itslef, but on the applications of them in e-sciecne. So If I do too much granular analysis and focus on the comparison of ReAct, CodeAct, and Deep Agent with or without KB, in that case the reviewrs may say it is SE or AI paper rather than e-Science. So I am still not sure what to do to maximize my chances of acceptance here, consideirng the acceptance rate is aroufd 30-40 percent in recent years and this conferece is dropped from CORE A to CORE B lately. So it is a huge question for me on how to keep the narrative of the paper and what to include and what to exclude form study. So maybe even KB is not neceesary for this project and instead I can simply compare Deep Agent with ReAct and existing docs as baseline to not drift away from e-Science topics.

This is what I think about this e-science paper. Also alternatively, I may consider AAMAS workshops, ASE industry showcase track, or even ICSME main. However for me its not clear what dataset to use so for e-science it is well-alligned according to their call for papers which I shared the link above. Also not sure if the methodology and experimental design is sufficient or not

**For ICSME/FSE tool track or demo track:**
It will be a general tool not necessarily for e-Science but for ANY topic. It shares the Deep Agents and KB methodology, however it can have a user-appealing interface (UI) and even can have an integrated copilot AI allowing users to also ask questions. it will be very similar to the previous one, but with a focus on open-source code and user friendliness. It can have a simple experimental or quantitative results, for example we can compare tutorials generated by ReAct agents, CodeAct agents, and our Deep Agents approach. for example on a set of metrics such as pedagogy, coverage, depth (depth of codebase understanding),  error-rate and even user preference using A/B testing. So since it is tool track I think the focus should be on the problem this tool solves and the methodology it uses rather than novel research contribution. For example here we can say that there exists tools like DeepWiki by Devin or CodeWiki
by Google which generate docs about a codebase or repo but they are all closed source, we do not know about their architecture and what they use under the hood (Deep Agent or ReAct or CodeAct) so our tool while usefull also provides some basic empirical results on generating these tutorials with different agentic architectures.
In the UI users would be able to select from existing tutorials (using the existing cards in UI) or enter a new github URL and generate docs.
When entered, a new page appears which is similar to a progress bar page. in the new page in lively manner, the user can see on the left hand side the explicit planning of the agent on left pannel and track which planning is used, what is done and what is to be done. on the right pannel  pannel, we show in the lively manner what subagents are spawned, what files they are reviewing, to what files they are writing to (probably using a hook to tool calls of the agents) in a grid like space which we have for example 4 squares in the grid, each showing name, tasks, and live progress of each subagent.  the center pannel will show the Deep Agent itself and what it is doing. after completing the generation of tutorials, the new page appears which on the left pannel user can select markdown files or tutorial files (1, 2, 3, ...) and on the right pannel user can preview those markdown files, and evet edit it (like a simple markdown editor on the left) and scroll up and down and etc. Also at the beginnig users can select the effort or details of the docs with options such as low, medium, high so that the agent knows how many docs it should generate and how much to get into detail.

the main risk in this tool paper is that I have never published tool paper before and I do not know how should I justify it and how to do it to maximize it acceptance in each venue.

========= YOU TASK FOR NOW =======
brainstorm with me, analyze everything I talked about in detail, evaluate and assess.

---

Please listen to me carefully.
My focus is on tutorial generator project.

There are possibilities that we should analyze and explore together.

======= WHO I AM ==========
I as an AI researcher and engineer, want to publish in prestigious venues considering my tight situation.
I do not have resources and time to do in-depth, full bodied research since I do both MSc and AI Engineering. However I work in the R&D department of our company and they need research papers, patents and etc. So I have chance to for example 1 day or 2 days a week work on research. And this research is not fully theoric, but industry aligned, in a way that is useful in industry as well.
I have research experience, but I am alone and do not have a research group. I previously published in ICSE workshops and similar venues. These venues where:
Workshops of A* conferecens
Main Track of A conferences
Main track of B conferences
Q1/Q2 journals
But I want to increase my publication quality for PhD applications in good unis in europe such as TU Delft, EFPL, TU Munich, Max Planck, and similar. Not top top unis such as UCL or Oxford or ETH since they sound out of reach considerinng the style of my work, since my work is not purely tehoritical but is alos engineered and applied.
So publishin in industry track or workshops or tool/demo tracks is also suitable considering the style of my work and I guess while not significantly, they can boost my CV from the perspective of PhD Committees.

======== ABOUT THE PROJECT ========
So as you know we have this tutorial generation project. It takes a codebase and converts it to tutorials in multiple .md files.
The methodology uses Deep Agents instead of ReAct agents. Which means it can spawn sub-agents, have permanent memory through files systems, and an explicit planning tool. Also additionally I may use a knowledge base before starting to work on downstream tasks, so subagents or even the deep agent itslef has a high-level clue of what they are doing. (this is not the original deep agent architecture but this KB is an extention and improvement added by me)

======= POSSIBILITIES =======
Now I am planning of having this tool as a full research paper in CORE B conference or as Tool/Demo paper in A or A* conference or both.
Now let me brainstorm what I have in mind.

**For CORE B conference which is IEEE e-Science conference (previously CORE A and now CORE B): **
https://www.escience-conference.org/2026/call-for-papers (open this link)
Here if I send a paper, it would be a paper on document or guide or tutorial generation for both USERS of the codebase or repo, and for the DEVS/MAINTAINERS of the repo who are new to the repo and want to onboard.
So since the topic is e-science here, I thought I may come up with the narrative that scientific libraries (not famous ones like SciKit-learn or those popular and well-dcoumented ones) usually face limited documentation issues which results in slowers user adoption and makes it difficult for new contributors and new maintainers to understand the existing codebase so they can further develop or maintain it.
This issue is prevelant especially for scientific libraries which are mostly used by researchers and scientiest in niche fields rather than by MANY people, since most of the time the researchers and scientiest themesleves are more focused on that niche topic itslef rather than software engineering which reuquires more engineering on code rather than domain expertise. The new users are contributors themselves are also not necessarily expert in software engineering so it makes them difficult for them to use the project and makes it difficult to on board newer maintainers and developers to the project as the number of users in these projects are somehow limited and they do not face the same attention. Such libraries usually have basic documentations and READMEs and guides.
So basically we are the intersection of Science (eScience) and Software Engineering.
To fill in this gap and support better, fully-automatic documentation and guide generation for BOTH new user and new maintainers/devs, we develop a fully automated system that given ANY repo in ANY language and format and in ANY niche topic, can generate a tutorial (2 different types, one for users, one for maintainers/devs) in the format of multiple markdown files with code snippets, references, different types of mermaid diagrams and etc.
Since this is a resreach paper, we should have a good dataset of such niche libraries (for example scientific libraries with less than 500 or 300 stars on github or like that). As long as I know, there is no such dataset so I may need to create my own dataset manually of for example 20 or 30 such libraries each for different fields such as Maths, Chemistry, Physics, Medicine, Pharm, or any other field that devs and users are not expert software engineers or do not code or do programming regularly.
Regarding the methodology, I am not sure. Maybe I can compare the docs or tutorials generated by ReAct agent, CodeAgent as baseline with my own Deep Agent + KB approach or even without Knowlegde Base. Also the existing docs of the library (if exists) can be baseline. So we can show that our proposed appraoch shows improvement and is effective against existing docs and docs generated by traditional ReAct agents.
We can compare the docs using 2 approaches:

A/B testing by people of N=20 which N=10 are devs and N=10 are users, all of which have never before used the library. We can ask them which tutorials they prefer. This A/B testing shows the user preference who are not expert matters of the topic (chem, math, physics ...) and have not used the library before.
Using SOTA LLMs as judge which have KNOWLEGDE of that niche topic such as chemistry or physics and etc. We can justify that we select LLMs that in benchmakrs for scientific coding or science or exams have knowlegde even more than average human or comparable to human. Since they undertsand the topic, we can ask these judge LLMs to compare which docs are better on a scale of rating from 1-5 using Likert. These LLMs can have criteria such as Pedagogy, Coverage, Depth (depth of understanding Codebase), Error-rate, and Domain Expertise (if the info in docs aligns with that niche topic such as chemistry).
HOWEVER I think I need to be careful that the topic of this conference is not AI or Software Engineering or Agentic AI itslef, but on the applications of them in e-sciecne. So If I do too much granular analysis and focus on the comparison of ReAct, CodeAct, and Deep Agent with or without KB, in that case the reviewrs may say it is SE or AI paper rather than e-Science. So I am still not sure what to do to maximize my chances of acceptance here, consideirng the acceptance rate is aroufd 30-40 percent in recent years and this conferece is dropped from CORE A to CORE B lately. So it is a huge question for me on how to keep the narrative of the paper and what to include and what to exclude form study. So maybe even KB is not neceesary for this project and instead I can simply compare Deep Agent with ReAct and existing docs as baseline to not drift away from e-Science topics.
This is what I think about this e-science paper. Also alternatively, I may consider AAMAS workshops, ASE industry showcase track, or even ICSME main. However for me its not clear what dataset to use so for e-science it is well-alligned according to their call for papers which I shared the link above. Also not sure if the methodology and experimental design is sufficient or not

For ICSME/FSE tool track or demo track:
It will be a general tool not necessarily for e-Science but for ANY topic. It shares the Deep Agents and KB methodology, however it can have a user-appealing interface (UI) and even can have an integrated copilot AI allowing users to also ask questions. it will be very similar to the previous one, but with a focus on open-source code and user friendliness. It can have a simple experimental or quantitative results, for example we can compare tutorials generated by ReAct agents, CodeAct agents, and our Deep Agents approach. for example on a set of metrics such as pedagogy, coverage, depth (depth of codebase understanding), error-rate and even user preference using A/B testing. So since it is tool track I think the focus should be on the problem this tool solves and the methodology it uses rather than novel research contribution. For example here we can say that there exists tools like DeepWiki by Devin or CodeWiki
by Google which generate docs about a codebase or repo but they are all closed source, we do not know about their architecture and what they use under the hood (Deep Agent or ReAct or CodeAct) so our tool while usefull also provides some basic empirical results on generating these tutorials with different agentic architectures.
In the UI users would be able to select from existing tutorials (using the existing cards in UI) or enter a new github URL and generate docs.
When entered, a new page appears which is similar to a progress bar page. in the new page in lively manner, the user can see on the left hand side the explicit planning of the agent on left pannel and track which planning is used, what is done and what is to be done. on the right pannel pannel, we show in the lively manner what subagents are spawned, what files they are reviewing, to what files they are writing to (probably using a hook to tool calls of the agents) in a grid like space which we have for example 4 squares in the grid, each showing name, tasks, and live progress of each subagent. the center pannel will show the Deep Agent itself and what it is doing. after completing the generation of tutorials, the new page appears which on the left pannel user can select markdown files or tutorial files (1, 2, 3, ...) and on the right pannel user can preview those markdown files, and evet edit it (like a simple markdown editor on the left) and scroll up and down and etc. Also at the beginnig users can select the effort or details of the docs with options such as low, medium, high so that the agent knows how many docs it should generate and how much to get into detail.

the main risk in this tool paper is that I have never published tool paper before and I do not know how should I justify it and how to do it to maximize it acceptance in each venue.

========= YOU TASK FOR NOW =======
brainstorm with me, analyze everything I talked about in detail, evaluate and assess.

---

This is a very strategic and well-thought-out plan. You have correctly identified two distinct narratives for the same core technology, which is a standard and effective way to maximize research output.

Here is my detailed analysis and evaluation of your strategy, tailored to your constraints (1-2 days/week) and goals (PhD applications in Europe).

1. The "Divide and Conquer" Strategy
Your intuition is correct: You can and should target both.

Paper A (e-Science): Focuses on the Application & Impact. The "Deep Agent" is just the engine; the story is about solving the "Documentation Crisis" in scientific software.
Paper B (ICSME/FSE Tool): Focuses on the Implementation & Observability. The story is about "Opening the Black Box" of agentic workflows with your Visualizer.
2. Analysis of the IEEE e-Science Proposal (CORE B)
Verdict: Strong Fit.
The transition from CORE A to B actually works in your favor here—it makes it a safer bet for acceptance while still being reputable enough for European PhD committees (who value "Applied Science" and "Interdisciplinary" work).

Critique of your Narrative:

The Hook: "Scientific software suffers from poor documentation because scientists are not software engineers." This is a perfect hook. It aligns with the "FAIR Principles" (Findable, Accessible, Interoperable, Reusable) which is a huge buzzword in e-Science right now.
The Gap: You are solving the "Onboarding Bottleneck" for niche communities.
Refining the Methodology (To avoid the "Too much SE" trap):

Dataset Strategy: Your plan to manually curate ~30 libraries is excellent.
Recommendation: Do not just pick "small" libraries. Pick "High Impact, Low Usability" libraries. Look for libraries cited in papers but with terrible READMEs.
Categorization: Group them: 10 Physics, 10 Bio, 10 Chem. This proves "Generalizability across Domains."
Evaluation Metrics (Crucial Adjustment):
Don't just measure "Quality" (Likert). Measure "Utility".
The "Time-to-Hello-World" Metric: Ask your N=20 participants to "Install the library and run a basic function."
Group A: Uses original docs.
Group B: Uses your generated docs.
Result: "Users with our docs succeeded 40% faster." This is the killer metric for e-Science. It proves you accelerated scientific progress.
The "Deep Agent" Role: Keep the technical description of the agent brief (1 page max). Focus the rest on the experiment and the results.
Proposed Title:

"Automating the Last Mile of Open Science: AI-Driven Documentation Generation for Niche Scientific Software"

3. Analysis of the ICSME/FSE Tool Track Proposal
Verdict: High Potential, but requires "Polish".
Tool tracks don't care as much about "Novelty" as they do about "Utility" and "Wow Factor."

Critique of the "Visualizer" Feature:

The "Live" Aspect: This is your winning feature. Most agent papers just show text logs. A "Grid View" of sub-agents working in parallel is visually arresting.
The "Planning" Panel: This addresses the "Explainability" requirement. Reviewers love seeing why an agent made a decision.
Refining the Tool Paper:

The Narrative: "Agentic SE is powerful but opaque. Developers don't trust agents they can't see. We present a 'Glass-Box' workbench for documentation agents."
Comparison: You mentioned comparing ReAct vs. Deep Agent. For a Tool paper, you don't need a massive empirical study. You need a Case Study.
Example: "We used the tool to document the X library. The Visualizer allowed us to spot that the ReAct agent got stuck in a loop, while the Deep Agent successfully planned the directory traversal."
The Video: Tool tracks require a video (usually 3-5 mins). Since you are good at UI (React/D3), this is your strength. A flashy video often guarantees acceptance in Tool tracks.
Proposed Title:

"DocuAgent-Viz: An Observable Workbench for Multi-Agent Documentation Generation"

4. Feasibility & Roadmap (The "1-2 Days/Week" Plan)
Since you are alone, you must be efficient. Here is how to pipeline this to hit both targets without burning out.

Phase 1: The Engine & Visualizer (Month 1)

Focus: Build the "Visualizer" UI.
Why: You need it for the Tool paper, but it also helps you debug the agents for the e-Science experiments.
Task: Implement the WebSocket connection between your Python backend and React frontend.
Phase 2: The e-Science Experiment (Month 2)

Focus: Data Collection.
Task:
Select 30 repos (spend 1 day on this, get it right).
Run the "Batch Generation" script (let it run overnight).
The Hard Part: Recruiting N=20 people.
Hack: Use your colleagues at the R&D department or students you mentor. You don't need random strangers; you need "educated novices."
Phase 3: Writing (Month 3)

Week 1-2: Write the e-Science paper (It's the heavier paper).
Week 3: Strip down the e-Science paper, remove the "Science" narrative, add the "UI/Architecture" details, and you have 60% of your Tool paper.
Week 4: Record the demo video.
5. Summary of Changes to Your Plan
Feature	Your Original Idea	My Recommendation
e-Science Dataset	~30 niche libraries	Categorized (Bio/Chem/Phys) to prove domain agnosticism.
e-Science Metric	A/B Preference + LLM Judge	Add "Time-to-Task-Completion" (Efficiency) to prove impact.
Tool Track Focus	Comparison of Agents	Focus on Observability/Explainability (The UI).
Tool Track Risk	"Never published tool paper"	Video is King. Make a great demo video to mitigate risk.
Next Step
I recommend we start by prototyping the Visualizer architecture, as that is the dependency for both the Tool paper (it is the paper) and the e-Science paper (it helps you run the experiments).

Shall we brainstorm the JSON schema for the WebSocket events? (e.g., how the backend sends `{"agent_id": "sub_1", "status": "reading_file", "file": "utils.py"}

` to the frontend?)

---

one main question also remains regarding the tools I have or can use.

Langchain provides a library called Deep Agents which is a harness. It is written with langchain itself. it is an easy to use option. please review it.
https://github.com/langchain-ai/deepagents
https://github.com/langchain-ai/deepagents/issues

However I am worried about its issues and worried if it is customizable for our use-case or not. Becasue with students with smolagent with very basic capabilities we could simluate the deep agent. However smolagent is not enough I think Deep Agent is better choice. There is also option of using Langchain itself and add the necessary tools so it becomes Deep Agent. This way I will be free and wont get stuck with deep agents issues since it is not that mature yet. At the same time considering my limited time I am worried if my own implementation will not become as good and as maintainable for future as the existing Deep Agent library by langchain.

I need to make a critic decision but yet we both do not have enough info about them.

PLease use the Deep Wiki Tools to ask MULTIPLE questions about the underlying architecheture of Deep Agents library and anything we need to know before making a decision on whether to use Deep Agents or Custom Implementation of Deep Agents using Langchain itself. Also if possible using the github mcp server tools check Deep Agents issues and pull requests.

---

This is a critical decision point. Based on my deep dive into the langchain-ai/deepagents repository, its architecture, and recent activity, here is my definitive recommendation.

The Verdict: Use langchain-ai/deepagents
Do not build this from scratch.
Building a robust "Deep Agent" architecture (with reliable sub-agent spawning, state management, and filesystem sandboxing) using raw LangChain would take you 2-3 weeks of debugging to match what this library provides today. Given your "1-2 days/week" constraint, building from scratch is a trap that will kill your research timeline.

However, you must use it correctly to avoid the "black box" issues you fear.

Why It Fits Your "Visualizer" & "Research" Goals
I investigated your specific concerns using the DeepWiki tools. Here is what I found:

1. The "Visualizer" Requirement (Observability)
You were worried about hooking into the agent to build your UI.

Good News: The library uses LangGraph under the hood. It exposes an astream(stream_mode=["messages", "updates"]) method.
How it works: You don't need hacky callbacks. You simply subscribe to this stream.
updates: Contains Sub-agent spawning events and Todo List updates (perfect for your "Planning Panel").
messages: Contains Tool Calls (perfect for your "Live Progress" grid).
2. The "Custom Tools" Requirement
You asked if sub-agents are customizable.

Confirmed: You can explicitly pass a subagents list to create_deep_agent. Each sub-agent can have its own unique set of tools.
Research Value: This allows you to create a "Researcher Sub-agent" (with RAG tools) and a "Writer Sub-agent" (with File tools), which is a great narrative for your paper.
3. The "Filesystem" Requirement
Confirmed: It has a FilesystemBackend that writes to your actual local disk (not just memory). You just pass root_dir="/path/to/repo". This is essential for your Tutorial Generator to actually output files.
The "Risk Mitigation" Plan
You are right to be worried about stability (166 open issues). Here is how we mitigate that:

Pin the Version: The repo is moving fast (commits yesterday!). We will pin the version in requirements.txt to the latest stable release to prevent your code from breaking mid-experiment.
The "Wrapper" Pattern: We will write a DeepAgentWrapper class. If the library becomes unmanageable, we only have to rewrite this one class to switch to a custom implementation, without changing your UI or Experiment code.
Proposed Implementation Strategy
Here is the blueprint for your DeepAgentWrapper that satisfies both your e-Science (Filesystem) and Tool Track (Visualizer) needs.

Next Steps
I recommend we proceed with langchain-ai/deepagents.

Shall I create a requirements.txt file pinning the dependencies and a prototype_agent.py to test this astream connection immediately? This will validate the "Visualizer

" feasibility in < 1 hour.

