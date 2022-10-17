from fastapi import FastAPI
from fastapi.testclient import TestClient
from main import startServer
import pytest
from httpx import AsyncClient

app = startServer()
client = TestClient(app)

def testRoot():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}

@pytest.mark.anyio
async def testUpload():
    filepath = "./test/data/lease.pdf"
    async with AsyncClient(app=app, base_url="http://localhost") as ac:
        #upload file to sever using async client
        with open(filepath, "rb") as f:
            response = await ac.post("/uploadfile/", files={"file": f})
            assert response.status_code == 200
            assert response.json() == {"Result": "OK"}


@pytest.mark.anyio
async def testLoadFile():
    filename = "lease.pdf"
    async with AsyncClient(app=app, base_url="http://localhost") as ac:
        #upload file to sever using async client
        response = await ac.get(f"/load/{filename}")
        assert response.status_code == 200

@pytest.mark.anyio
async def testScanFile():
    filename = "lease.pdf"
    questions = ["What is the payment period for the lease?", "When was the lease created?", "What is the lease term?"]
    scanTask = {"filename": filename, "questions": questions}
    async with AsyncClient(app=app, base_url="http://localhost") as ac:
        #upload file to sever using async client
        response = await ac.post('/scan/',json=scanTask)
        print(response.json())
        assert response.status_code == 200