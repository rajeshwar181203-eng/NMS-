from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import database
from .models import models
from .api import routes

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Network Correlation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Network Correlation API"}
