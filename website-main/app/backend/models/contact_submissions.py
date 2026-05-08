from core.database import Base
from sqlalchemy import Boolean, Column, Integer, String


class Contact_submissions(Base):
    __tablename__ = "contact_submissions"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(String, nullable=True)
    read = Column(Boolean, nullable=True)
    created_at = Column(String, nullable=True)