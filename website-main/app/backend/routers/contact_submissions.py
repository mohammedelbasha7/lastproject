import json
import logging
import smtplib
from email.message import EmailMessage
from typing import List, Optional


from dependencies.auth import get_admin_user
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from services.contact_submissions import Contact_submissionsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/contact_submissions", tags=["contact_submissions"])


# ---------- Pydantic Schemas ----------
class Contact_submissionsData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str
    mobile: str
    email: str
    message: Optional[str] = None
    read: Optional[bool] = None
    created_at: Optional[str] = None


class Contact_submissionsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None
    read: Optional[bool] = None
    created_at: Optional[str] = None


class Contact_submissionsResponse(BaseModel):
    """Entity response schema"""
    id: int
    name: str
    mobile: str
    email: str
    message: Optional[str] = None
    read: Optional[bool] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class Contact_submissionsListResponse(BaseModel):
    """List response schema"""
    items: List[Contact_submissionsResponse]
    total: int
    skip: int
    limit: int


class Contact_submissionsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Contact_submissionsData]


class Contact_submissionsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Contact_submissionsUpdateData


class Contact_submissionsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Contact_submissionsBatchUpdateItem]


class Contact_submissionsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Contact_submissionsListResponse)
async def query_contact_submissionss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Query contact_submissionss with filtering, sorting, and pagination"""
    logger.debug(f"Querying contact_submissionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Contact_submissionsService(db)
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
        logger.debug(f"Found {result['total']} contact_submissionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying contact_submissionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Contact_submissionsListResponse)
async def query_contact_submissionss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    # Query contact_submissionss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying contact_submissionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Contact_submissionsService(db)
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
        logger.debug(f"Found {result['total']} contact_submissionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying contact_submissionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Contact_submissionsResponse)
async def get_contact_submissions(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Get a single contact_submissions by ID"""
    logger.debug(f"Fetching contact_submissions with id: {id}, fields={fields}")
    
    service = Contact_submissionsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Contact_submissions with id {id} not found")
            raise HTTPException(status_code=404, detail="Contact_submissions not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching contact_submissions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


def _get_contact_notification_recipient() -> str:
    return (
        str(getattr(settings, "order_notification_email", "")).strip()
        or str(getattr(settings, "admin_user_email", "")).strip()
        or "albashadesign@gmail.com"
    )


def _send_contact_notification_email_sync(*, recipient: str, subject: str, body: str, reply_to: Optional[str] = None):
    smtp_host = str(getattr(settings, "smtp_host", "")).strip()
    smtp_port = int(getattr(settings, "smtp_port", 587) or 587)
    smtp_user = str(getattr(settings, "smtp_user", "")).strip()
    smtp_password = str(getattr(settings, "smtp_password", "")).strip()
    smtp_from = str(getattr(settings, "smtp_from", "")).strip() or smtp_user

    if not smtp_host or not smtp_user or not smtp_password or not smtp_from or not recipient:
        logger.warning(
            "Contact email notification skipped because SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, or recipient is missing"
        )
        return

    message = EmailMessage()
    message["From"] = smtp_from
    message["To"] = recipient
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)


def _send_contact_notification_email_safe(*, recipient: str, subject: str, body: str, reply_to: Optional[str] = None):
    try:
        _send_contact_notification_email_sync(recipient=recipient, subject=subject, body=body, reply_to=reply_to)
        logger.info("Contact submission notification email sent to %s", recipient)
    except Exception as exc:
        logger.error("Failed to send contact submission notification email: %s", exc, exc_info=True)


@router.post("", response_model=Contact_submissionsResponse, status_code=201)
async def create_contact_submissions(
    data: Contact_submissionsData,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new contact_submissions"""
    logger.debug(f"Creating new contact_submissions with data: {data}")
    
    service = Contact_submissionsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create contact_submissions")
        
        logger.info(f"Contact_submissions created successfully with id: {result.id}")

        recipient = _get_contact_notification_recipient()
        subject = f"New contact submission from {result.name}"
        body = (
            f"Name: {result.name}\n"
            f"Mobile: {result.mobile}\n"
            f"Email: {result.email}\n"
            f"Message:\n{result.message or '(no message)'}\n\n"
            f"Read: {result.read}\n"
            f"Created at: {result.created_at or 'unknown'}\n"
        )
        background_tasks.add_task(
            _send_contact_notification_email_safe,
            recipient=recipient,
            subject=subject,
            body=body,
            reply_to=result.email,
        )

        return result
    except ValueError as e:
        logger.error(f"Validation error creating contact_submissions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating contact_submissions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Contact_submissionsResponse], status_code=201)
async def create_contact_submissionss_batch(
    request: Contact_submissionsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Create multiple contact_submissionss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} contact_submissionss")
    
    service = Contact_submissionsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} contact_submissionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Contact_submissionsResponse])
async def update_contact_submissionss_batch(
    request: Contact_submissionsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Update multiple contact_submissionss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} contact_submissionss")
    
    service = Contact_submissionsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} contact_submissionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Contact_submissionsResponse)
async def update_contact_submissions(
    id: int,
    data: Contact_submissionsUpdateData,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Update an existing contact_submissions"""
    logger.debug(f"Updating contact_submissions {id} with data: {data}")

    service = Contact_submissionsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Contact_submissions with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Contact_submissions not found")
        
        logger.info(f"Contact_submissions {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating contact_submissions {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating contact_submissions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_contact_submissionss_batch(
    request: Contact_submissionsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Delete multiple contact_submissionss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} contact_submissionss")
    
    service = Contact_submissionsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} contact_submissionss successfully")
        return {"message": f"Successfully deleted {deleted_count} contact_submissionss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_contact_submissions(
    id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: UserResponse = Depends(get_admin_user),
):
    """Delete a single contact_submissions by ID"""
    logger.debug(f"Deleting contact_submissions with id: {id}")
    
    service = Contact_submissionsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Contact_submissions with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Contact_submissions not found")
        
        logger.info(f"Contact_submissions {id} deleted successfully")
        return {"message": "Contact_submissions deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contact_submissions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
