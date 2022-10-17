import ocrmypdf
import pdftotext

import os
import openai
openai.organization = "org-taPYDpLNSOgxFp9L9PZucpgO"
openai.api_key = os.getenv("OPENAI_API_KEY")


def createPrompt(pdfinput,questions):
    template = "You are a very smart and perceptive lawyer and realtor. This is a lease agreement:{pdf} Answer these questions based on the lease agreement: {questions}. If you can't find the answer from the document, respond with idk."
    prompt = template.format(pdf=pdfinput, questions=questions)
    return prompt

def createCompletion(prompt):
    completion = openai.Completion.create(engine="text-davinci-002", prompt=prompt, max_tokens=150, temperature=.5)
    return completion

def extractAnswers(question, completions):
    answer = ""
    prompt = "Based on this information:" + completions + ", answer this question: " + question
    completion = openai.Completion.create(engine="text-davinci-002", prompt=prompt, max_tokens=150, temperature=.5)
    answer = completion["choices"][0]["text"]
    return answer


# Load your PDF
def scanpdf(filename, questions):
    filepath = "./data/" + filename
    fileoutpath = "./data/scan-" + filename 
    ocrmypdf.ocr(filepath, fileoutpath , deskew=True, force_ocr=True)

    with open (fileoutpath, "rb") as f:
        pdf = pdftotext.PDF(f)

    completions_text = []

    for page in pdf:
        prompt = createPrompt(page, questions)
        c = createCompletion(prompt)
        completions_text.append(c.choices[0].text)

    completions_string = "".join(completions_text)

    answers = []
    for question in questions:
        answer = extractAnswers(question, completions_string)
        answers.append(answer)

    return answers
    
