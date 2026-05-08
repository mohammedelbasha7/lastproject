import json
import logging
from typing import List, Optional


from dependencies.auth import get_admin_user
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.testimonials import TestimonialsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/testimonials", tags=["testimonials"])


# ---------- Pydantic Schemas ----------
class TestimonialsData(BaseModel):
    """Entity data schema (for create/update)"""
    customer_name: str
    content: str
    rating: int
    created_at: str = None


class TestimonialsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    customer_name: Optional[str] = None
    content: Optional[str] = None
    rating: Optional[int] = None
    created_at: Optional[str] = None


class TestimonialsResponse(BaseModel):
    """Entity response schema"""
    id: int
    customer_name: str
    content: str
    rating: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class TestimonialsListResponse(BaseModel):
    """List response schema"""
    items: List[TestimonialsResponse]
    total: int
    skip: int
    limit: int


class TestimonialsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[TestimonialsData]


class TestimonialsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: TestimonialsUpdateData


class TestimonialsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[TestimonialsBatchUpdateItem]


class TestimonialsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=TestimonialsListResponse)
async def query_testimonialss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query testimonialss with filtering, sorting, and pagination"""
    logger.debug(f"Querying testimonialss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = TestimonialsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} testimonialss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying testimonialss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=TestimonialsListResponse)
async def query_testimonialss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query testimonialss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying testimonialss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = TestimonialsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} testimonialss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying testimonialss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=TestimonialsResponse)
async def get_testimonials(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single testimonials by ID"""
    logger.debug(f"Fetching testimonials with id: {id}, fields={fields}")
    
    service = TestimonialsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Testimonials with id {id} not found")
            raise HTTPException(status_code=404, detail="Testimonials not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching testimonials {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=TestimonialsResponse, status_code=201)
async def create_testimonials(
    data: TestimonialsData,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Create a new testimonials"""
    logger.debug(f"Creating new testimonials with data: {data}")
    
    service = TestimonialsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create testimonials")
        
        logger.info(f"Testimonials created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating testimonials: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating testimonials: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[TestimonialsResponse], status_code=201)
async def create_testimonialss_batch(
    request: TestimonialsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Create multiple testimonialss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} testimonialss")
    
    service = TestimonialsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} testimonialss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[TestimonialsResponse])
async def update_testimonialss_batch(
    request: TestimonialsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Update multiple testimonialss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} testimonialss")
    
    service = TestimonialsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} testimonialss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=TestimonialsResponse)
async def update_testimonials(
    id: int,
    data: TestimonialsUpdateData,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Update an existing testimonials"""
    logger.debug(f"Updating testimonials {id} with data: {data}")

    service = TestimonialsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Testimonials with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Testimonials not found")
        
        logger.info(f"Testimonials {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating testimonials {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating testimonials {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_testimonialss_batch(
    request: TestimonialsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Delete multiple testimonialss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} testimonialss")
    
    service = TestimonialsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} testimonialss successfully")
        return {"message": f"Successfully deleted {deleted_count} testimonialss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_testimonials(
    id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Delete a single testimonials by ID"""
    logger.debug(f"Deleting testimonials with id: {id}")
    
    service = TestimonialsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Testimonials with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Testimonials not found")
        
        logger.info(f"Testimonials {id} deleted successfully")
        return {"message": "Testimonials deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting testimonials {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
