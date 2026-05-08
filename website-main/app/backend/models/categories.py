from core.database import Base
from sqlalchemy import Column, Integer, String


class Categories(Base):
    __tablename__ = "categories"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    display_order = Column(Integer, nullable=True)