from typing import Union
from fastapi import FastAPI, File, UploadFile,status
from fastapi.exceptions import HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import aiofiles
import uvicorn
import hashlib
import shutil
import os

from utils import scanpdf

def startServer():
    app = FastAPI()

    origins = [
    "http://localhost",
    "http://localhost:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def read_root():
        return {"Hello": "World"}

    class ScanTask(BaseModel):
        filename: str
        questions: list[str]
    
    class ScanResponse(BaseModel):
        filename: str
        questions: list[str]
        answers: list[str]
    
    # endpoint to get GPT3 completion given an uploaded filename and questions
    @app.post("/scan/", response_model=ScanResponse)
    async def scanFile(scanTask: ScanTask):
        #return response  status code 200
        answers = scanpdf(scanTask.filename, scanTask.questions)
        return ScanResponse(filename= scanTask.filename, questions=scanTask.questions, answers=answers)

        
    # endpoint to load a pdf file and return the text
    @app.get("/load/{filename}")
    async def load_file(filename: str):
        #check if file exists
        filename = "./data/" + filename
        if not os.path.exists(filename):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
        #read file 
        return FileResponse(path = filename)

    @app.post("/uploadfile/")
    async def create_upload_file(file: UploadFile):
        try:
            out_file_path = "./data/" + file.filename
            with open(out_file_path, 'wb') as out_file:
                shutil.copyfileobj(file.file, out_file)
        except Exception:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail='There was an error uploading the file')
        finally:
            file.file.close()
        return {"Result": "OK"}
    return app


if __name__ == "__main__":
    app = startServer()
    uvicorn.run(app, host="localhost", port=8000)