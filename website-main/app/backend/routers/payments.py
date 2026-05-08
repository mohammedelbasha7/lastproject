import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from core.config import settings
from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, field_validator
from schemas.auth import UserResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

MAX_QUANTITY_PER_ITEM = 20
CARDCOM_CREATE_URL = "https://secure.cardcom.solutions/api/v11/LowProfile/Create"
CARDCOM_RESULT_URL = "https://secure.cardcom.solutions/api/v11/LowProfile/GetLpResult"


class CartItem(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, value: int) -> int:
        if value < 1:
            raise ValueError("Quantity must be at least 1")
        if value > MAX_QUANTITY_PER_ITEM:
            raise ValueError(f"Quantity cannot exceed {MAX_QUANTITY_PER_ITEM}")
        return value


class CheckoutSessionRequest(BaseModel):
    items: List[CartItem]

    @field_validator("items")
    @classmethod
    def validate_items(cls, value: List[CartItem]) -> List[CartItem]:
        if not value:
            raise ValueError("Cart cannot be empty")
        if len(value) > 50:
            raise ValueError("Too many items in cart")
        return value


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class PaymentVerificationRequest(BaseModel):
    session_id: str

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 6 or len(value) > 200:
            raise ValueError("Invalid session ID format")
        return value


class PaymentStatusResponse(BaseModel):
    status: str
    payment_status: str
    order_id: Optional[str] = None


def _get_cardcom_config() -> tuple[str, str]:
    terminal_number = str(getattr(settings, "cardcom_terminal_number", "")).strip()
    api_name = str(getattr(settings, "cardcom_api_name", "")).strip()
    if not terminal_number or not api_name:
        raise HTTPException(status_code=503, detail="Cardcom is not configured")
    return terminal_number, api_name


def _get_frontend_host(request: Request) -> str:
    frontend_host = request.headers.get("App-Host")
    if frontend_host and not frontend_host.startswith(("http://", "https://")):
        frontend_host = f"https://{frontend_host}"
    if frontend_host:
        return frontend_host.rstrip("/")
    origin = request.headers.get("origin")
    if origin:
        return origin.rstrip("/")
    return getattr(settings, "frontend_url", "http://127.0.0.1:3000").rstrip("/")


def _get_backend_host(request: Request) -> str:
    configured = getattr(settings, "backend_public_url", "")
    if configured:
        return configured.rstrip("/")
    return str(request.base_url).rstrip("/")


def _get_transaction_id(cardcom_data: dict) -> Optional[int]:
    transaction_id = (
        cardcom_data.get("TranzactionId")
        or cardcom_data.get("TransactionId")
        or (cardcom_data.get("TranzactionInfo") or {}).get("TranzactionId")
        or (cardcom_data.get("TranzactionInfo") or {}).get("TransactionId")
    )
    return transaction_id


async def _ensure_orders_table(db: AsyncSession):
    await db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'guest',
                stripe_session_id TEXT,
                cardcom_low_profile_id TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                total_amount INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    await db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER REFERENCES orders(id),
                product_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1
            )
            """
        )
    )
    try:
        await db.execute(text("ALTER TABLE orders ADD COLUMN cardcom_low_profile_id TEXT"))
    except Exception:
        pass
    await db.commit()


async def _get_product_from_db(db: AsyncSession, product_id: int) -> Optional[dict]:
    result = await db.execute(
        text("SELECT id, name, price, image_url FROM products WHERE id = :pid LIMIT 1"),
        {"pid": product_id},
    )
    row = result.fetchone()
    if not row:
        return None
    return {"id": row[0], "name": row[1], "price": row[2], "image_url": row[3]}


async def _get_optional_user(request: Request) -> Optional[UserResponse]:
    try:
        from core.database import get_db as _get_db

        db_gen = _get_db()
        db = await db_gen.__anext__()
        try:
            return await get_current_user(request=request, db=db)
        except Exception:
            return None
        finally:
            try:
                await db_gen.__anext__()
            except StopAsyncIteration:
                pass
    except Exception:
        return None


async def _create_cardcom_payment(
    *,
    terminal_number: str,
    api_name: str,
    order_id: int,
    total: int,
    frontend_host: str,
    backend_host: str,
) -> dict:
    payload = {
        "TerminalNumber": int(terminal_number),
        "ApiName": api_name,
        "Operation": "ChargeOnly",
        "ReturnValue": str(order_id),
        "Amount": f"{total:.2f}",
        "SuccessRedirectUrl": f"{frontend_host}/payment-success?order_id={order_id}",
        "FailedRedirectUrl": f"{frontend_host}/cart",
        "WebHookUrl": f"{backend_host}/api/v1/payment/cardcom_webhook",
        "ProductName": f"ALBASHA order {order_id}"[:50],
        "Language": "he",
        "ISOCoinId": 1,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(CARDCOM_CREATE_URL, json=payload)
    response.raise_for_status()
    return response.json()


async def _get_cardcom_result(terminal_number: str, api_name: str, low_profile_id: str) -> dict:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            CARDCOM_RESULT_URL,
            json={
                "TerminalNumber": int(terminal_number),
                "ApiName": api_name,
                "LowProfileId": low_profile_id,
            },
        )
    response.raise_for_status()
    return response.json()


@router.post("/create_payment_session", response_model=CheckoutSessionResponse)
async def create_payment_session(
    data: CheckoutSessionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        terminal_number, api_name = _get_cardcom_config()
        await _ensure_orders_table(db)

        current_user = await _get_optional_user(request)
        user_id = current_user.id if current_user else "guest"

        resolved_items: list[dict] = []
        for cart_item in data.items:
            product = await _get_product_from_db(db, cart_item.product_id)
            if not product:
                raise HTTPException(status_code=400, detail=f"Product {cart_item.product_id} not found")
            resolved_items.append(
                {
                    "product_id": product["id"],
                    "name": product["name"],
                    "price": product["price"],
                    "quantity": cart_item.quantity,
                }
            )

        total = sum(item["price"] * item["quantity"] for item in resolved_items)

        result = await db.execute(
            text(
                "INSERT INTO orders (user_id, status, total_amount, created_at, updated_at) "
                "VALUES (:uid, 'pending', :total, :now, :now) RETURNING id"
            ),
            {"uid": user_id, "total": total, "now": datetime.now()},
        )
        order_row = result.fetchone()
        order_id = order_row[0]

        for item in resolved_items:
            await db.execute(
                text(
                    "INSERT INTO order_items (order_id, product_id, name, price, quantity) "
                    "VALUES (:oid, :pid, :name, :price, :qty)"
                ),
                {
                    "oid": order_id,
                    "pid": item["product_id"],
                    "name": item["name"],
                    "price": item["price"],
                    "qty": item["quantity"],
                },
            )
        await db.commit()

        cardcom_data = await _create_cardcom_payment(
            terminal_number=terminal_number,
            api_name=api_name,
            order_id=order_id,
            total=total,
            frontend_host=_get_frontend_host(request),
            backend_host=_get_backend_host(request),
        )

        if int(cardcom_data.get("ResponseCode", -1)) != 0:
            logger.error("Cardcom create failed: %s", cardcom_data)
            raise HTTPException(status_code=502, detail=cardcom_data.get("Description") or "Cardcom payment failed")

        low_profile_id = cardcom_data.get("LowProfileId")
        payment_url = cardcom_data.get("Url")
        if not low_profile_id or not payment_url:
            logger.error("Cardcom create response missing fields: %s", cardcom_data)
            raise HTTPException(status_code=502, detail="Invalid Cardcom payment response")

        await db.execute(
            text(
                "UPDATE orders SET cardcom_low_profile_id = :sid, stripe_session_id = :sid, "
                "updated_at = :now WHERE id = :oid"
            ),
            {"sid": low_profile_id, "now": datetime.now(), "oid": order_id},
        )
        await db.commit()

        return CheckoutSessionResponse(session_id=low_profile_id, url=payment_url)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Payment session creation error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create payment session") from exc


@router.post("/verify_payment", response_model=PaymentStatusResponse)
async def verify_payment(
    data: PaymentVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        terminal_number, api_name = _get_cardcom_config()
        low_profile_id = data.session_id
        if data.session_id.isdigit():
            result = await db.execute(
                text("SELECT cardcom_low_profile_id, stripe_session_id FROM orders WHERE id = :oid LIMIT 1"),
                {"oid": int(data.session_id)},
            )
            row = result.fetchone()
            if row:
                low_profile_id = row[0] or row[1] or data.session_id

        cardcom_data = await _get_cardcom_result(terminal_number, api_name, low_profile_id)

        response_code = int(cardcom_data.get("ResponseCode", -1))
        mapped_status = "paid" if response_code == 0 and _get_transaction_id(cardcom_data) else "failed"
        payment_status = "paid" if mapped_status == "paid" else "unpaid"
        order_id = cardcom_data.get("ReturnValue")

        if not order_id:
            result = await db.execute(
                text("SELECT id FROM orders WHERE cardcom_low_profile_id = :sid OR stripe_session_id = :sid LIMIT 1"),
                {"sid": data.session_id},
            )
            row = result.fetchone()
            order_id = str(row[0]) if row else None

        if order_id:
            await db.execute(
                text("UPDATE orders SET status = :status, updated_at = :now WHERE id = :oid"),
                {"status": mapped_status, "now": datetime.now(), "oid": int(order_id)},
            )
            await db.commit()

        return PaymentStatusResponse(status=mapped_status, payment_status=payment_status, order_id=order_id)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Payment verification error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to verify payment") from exc


@router.post("/cardcom_webhook")
async def cardcom_webhook(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Receive Cardcom LowProfile callback and verify it server-to-server."""
    try:
        terminal_number, api_name = _get_cardcom_config()
        low_profile_id = payload.get("LowProfileId")
        if not low_profile_id:
            raise HTTPException(status_code=400, detail="Missing LowProfileId")

        cardcom_data = await _get_cardcom_result(terminal_number, api_name, str(low_profile_id))
        response_code = int(cardcom_data.get("ResponseCode", -1))
        status = "paid" if response_code == 0 and _get_transaction_id(cardcom_data) else "failed"
        order_id = cardcom_data.get("ReturnValue") or payload.get("ReturnValue")

        if order_id:
            await db.execute(
                text("UPDATE orders SET status = :status, updated_at = :now WHERE id = :oid"),
                {"status": status, "now": datetime.now(), "oid": int(order_id)},
            )
            await db.commit()

        return {"ok": True}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Cardcom webhook error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process Cardcom webhook") from exc
