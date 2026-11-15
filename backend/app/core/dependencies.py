from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db

# Re-export get_db for clean imports across routers
__all__ = ["get_db"]
