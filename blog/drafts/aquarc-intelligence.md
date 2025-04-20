Aquarc Intelligence

Who needs Artifical Intelligence when you can have Aquarc Intelligence?
---

As a part of the Google Generative AI capstone project, I decided to integrate an intelligent SAT helper into aquarc. 

#### 4-4-2025
The model is drafted to include multiple features. Most obviously, the AI agent will be able to read the question and will have access to the different answers the user put into the boxes. Few-shot learning may be applied because those answers might vary in number and quality significantly. This question-answering model will be able to understand images in the form of SVGs that represent graphs, most frequently for the inferences questions. The model will also have access to the latest SAT information on specifications and weightage to design an optimal study plan if requested by the user.

In addition to study plans, the user will receive feedback on the specific type of question. A Tree of Thoughts (ToT) algorithm will be implemented so the Generative AI agent can generate multiple question thought processes to achieving the right answer as multiple methods are frequently available to achieve the same solution, which the model will have to output in JSON so they can be displayed separately. The agent will also be able to find similar questions that (potentially) use this answering method.

In order to find similar questions, a document based vector database will be used to find semantically related questions. `ngrok` will be used as an API in the Kaggle Notebook so that the main server can request similar questions using the context. This secondary webserver may not be necessary for the notebook but will be determined rather as the project continues to improve. 

So far, this agent constitutes the entire model. Fine-tuning and other modifications may be necessary past this prototype, but will be determined as we iterate on the project. That's why this blog post is structured by the day.

vocab?
practice will have to be reinforced - al;so what practice

#### 4-5-2025

It's time to address the elephant in the room: how to start? In order to even do simple Prompt Engineering, data has to flow from the [aquarc](https://aquarc.org) website to the Kaggle Notebook that does the HTTP requests. I can release the Notebook as a proof of concept that uses the terminal for now, using sample data from [aquarc](https://aquarc.org) and integrate it more tightly with the website later on. The Notebook can serve as a demo, rather than a direct implementation. Besides, translating code from the notebook to the Go backend should be a task complex enough to teach someone on the team about backend.


#### Introduction
Aquarc has XYZ problem

!!!

#### First Iteration

#### Future Direction


Tags: kaggle, development, competition
