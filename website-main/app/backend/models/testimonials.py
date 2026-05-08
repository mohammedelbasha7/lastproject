from core.database import Base
from sqlalchemy import Column, Integer, String


class Testimonials(Base):
    __tablename__ = "testimonials"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    customer_name = Column(String, nullable=False)
    content = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    created_at = Column(String, nullable=True)