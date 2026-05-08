from core.database import Base
from sqlalchemy import Boolean, Column, Integer, String


class Products(Base):
    __tablename__ = "products"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    stock_quantity = Column(Integer, nullable=True, default=0)
    category_id = Column(Integer, nullable=False)
    featured = Column(Boolean, nullable=True)
    created_at = Column(String, nullable=True)
