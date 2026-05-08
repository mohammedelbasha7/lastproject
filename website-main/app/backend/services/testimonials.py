import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.testimonials import Testimonials

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class TestimonialsService:
    """Service layer for Testimonials operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Testimonials]:
        """Create a new testimonials"""
        try:
            obj = Testimonials(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created testimonials with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating testimonials: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Testimonials]:
        """Get testimonials by ID"""
        try:
            query = select(Testimonials).where(Testimonials.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching testimonials {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of testimonialss"""
        try:
            query = select(Testimonials)
            count_query = select(func.count(Testimonials.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Testimonials, field):
                        query = query.where(getattr(Testimonials, field) == value)
                        count_query = count_query.where(getattr(Testimonials, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Testimonials, field_name):
                        query = query.order_by(getattr(Testimonials, field_name).desc())
                else:
                    if hasattr(Testimonials, sort):
                        query = query.order_by(getattr(Testimonials, sort))
            else:
                query = query.order_by(Testimonials.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching testimonials list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Testimonials]:
        """Update testimonials"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Testimonials {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated testimonials {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating testimonials {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete testimonials"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Testimonials {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted testimonials {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting testimonials {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Testimonials]:
        """Get testimonials by any field"""
        try:
            if not hasattr(Testimonials, field_name):
                raise ValueError(f"Field {field_name} does not exist on Testimonials")
            result = await self.db.execute(
                select(Testimonials).where(getattr(Testimonials, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching testimonials by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Testimonials]:
        """Get list of testimonialss filtered by field"""
        try:
            if not hasattr(Testimonials, field_name):
                raise ValueError(f"Field {field_name} does not exist on Testimonials")
            result = await self.db.execute(
                select(Testimonials)
                .where(getattr(Testimonials, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Testimonials.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching testimonialss by {field_name}: {str(e)}")
            raise