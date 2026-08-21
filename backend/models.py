from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True) # Clerk User ID (e.g. user_2...)
    email = Column(String, unique=True, index=True)
    is_pro = Column(Integer, default=0) # 0 for false, 1 for true
    query_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repositories = relationship("Repository", back_populates="owner")

class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    path = Column(String)
    tech_debt_score = Column(Integer, default=0)
    complexity_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="repositories")
    messages = relationship("Message", back_populates="repository", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_id = Column(String, ForeignKey("repositories.id"))
    role = Column(String) # 'user' or 'ai'
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    repository = relationship("Repository", back_populates="messages")

# Initialize Database
DATABASE_URL = "sqlite:///./saas_db.sqlite"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
