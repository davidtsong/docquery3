import React, { useState } from "react";
import Link from "next/link";
import Image from 'next/image';


function Home(props) {

  const [pdf, setPDF] = useState(null);
  const [filename, setFileName] = useState(null);
  const [state, setState] = useState("upload");
  const [answers, setAnswers] = useState(null);
  const [question, setQuestion] = useState([""]);

  function uploadClient(event) {
    if (event.target.files && event.target.files.length > 0) {
      var file = event.target.files[0];
      console.log("File:" + file);
      setPDF(file);
      setFileName(file.name);
    }
  }

  async function submitQuery(event) {
    const scanTask = {
      filename: filename,
      questions: question,
    };
    const JSONdata = JSON.stringify(scanTask);
    console.log(JSONdata);
    const response = await fetch("http://localhost:8000/scan/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSONdata,
    });
    const data = await response.json();
    console.log(data);
    setAnswers(data.answers);
  }
  async function uploadServer(event) {
    console.log("File:" + pdf);
    var formData = new FormData();
    formData.append("file", pdf);
    console.log(formData);
    const response = await fetch("http://localhost:8000/uploadfile/", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log(data);
    if (data.Result == "OK") {
      setState("uploaded");
    }
  }

  if (state == "uploaded") {
    return (
      <section className="h-screen">
        <div className="w-screen">
          <div className="flex">
            <div className="md:w-1/3">
              <div className="rounded border border-gray-200">
                <iframe
                  className="w-full h-screen"
                  src={"http://localhost:8000/load/" + filename}
                />
              </div>
            </div>
            <div className="p-4 md:w-3/4">
              <div className="p-6 rounded h-full border border-gray-200 prose prose-a:text-blue-600 max-w-none flex flex-col">
                <h2>Questions to query</h2>
                {/* next js form in tailwind */}
                <form className="space-y-8 divide-y divide-gray-200">
                  <div className="">
                    <div className="mt-2">
                      {question.map((q, index) => {
                        return (
                          <input
                            type="text"
                            name="question"
                            id="question"
                            value={q}
                            rows={4}
                            key={index}
                            onChange={(event) => {
                              var questionCopy = [...question];
                              questionCopy[index] = event.target.value;
                              setQuestion(questionCopy);
                            }}
                            autoComplete="question"
                            className="p-2 mt-4 border shadow-sm focus:ring-rose-500 focus:border-rose-500 block w-full sm:text-sm     border-gray-400 rounded-md"
                          />
                        );
                      })}
                    </div>
                    {/*button that add a new question */}
                    <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        var questionCopy = [...question];
                        questionCopy.push("");
                        setQuestion(questionCopy);
                      }}
                      className="items-center rounded-md border border-transparent bg-rose-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      +

                    </button>

                    <button
                      onClick={submitQuery}
                      type="button"
                      className="ml-6 items-center rounded-md border border-transparent bg-rose-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      Submit
                    </button>
                    </div>
                    
                    <h3 className="mt-12">Results</h3>

                    <div className="px-2">
                      <div className="mt-8 flex flex-col">
                        <div className="mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                              <table className="w-full break-words table-fixed divide-gray-300">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                      Questions
                                    </th>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                      Answer
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                    
                                    {question &&
                                      question.map((question, index) => {
                                        return (
                                          <tr key={filename}>
                                            <td className=" p-4 pr-3 text-sm text-gray-500 break-words">
                                              {question}
                                            </td>
                                            <td className="py-4 pr-3 text-sm text-gray-500 break-all">
                                              {answers && answers[index]}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if (state == "upload") {
    return (
      <section className="">
        <div className="container h-screen mx-auto">
          <div className="flex h-full place-content-center flex-wrap">
            <div className="p-4 w-full md:w-4/6">
              <div className="rounded border border-gray-200">
                <div className="p-4 flex flex-col md:flex-row">
                  <div className="flex flex-col p-4">
                    <h2 className="text-2xl font-bold mb-4">DocQuery3</h2>
                    <p className="mb-4">
                      Upload a document and extract any type of information from it using GPT-3.
                    </p>
                    <input
                      type="file"
                      onChange={uploadClient}
                      className="block w-full text-sm text-slate-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0
      file:text-sm file:font-semibold
      file:bg-violet-50 file:text-violet-700
      hover:file:bg-violet-100
    "
                    />
                    <button
                      type="button"
                      onClick={uploadServer}
                      className="mt-8 mx-auto rounded-md border border-transparent bg-rose-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      Upload
                    </button>
                  </div>
                  <div className="flex">
                    <Image
                      src="/image.png"
                      width={512}
                      height={512}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Home;
