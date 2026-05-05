"""
LoadSight SMS Alert Service
Twilio-ready structure with mock fallback.
Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER env vars to enable.
"""

import os
from datetime import datetime


def send_sms(phone: str, message: str) -> dict:
    """
    Send SMS alert. Uses Twilio if credentials are set, else prints mock.

    Args:
        phone: Recipient phone number (e.g. +923001234567)
        message: Alert message text

    Returns:
        dict with status and details
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")

    timestamp = datetime.utcnow().isoformat()

    if account_sid and auth_token and from_number:
        return _send_twilio(phone, message, account_sid, auth_token, from_number, timestamp)
    else:
        return _mock_send(phone, message, timestamp)


def _send_twilio(
    phone: str,
    message: str,
    account_sid: str,
    auth_token: str,
    from_number: str,
    timestamp: str,
) -> dict:
    """Send via Twilio REST API."""
    try:
        from twilio.rest import Client

        client = Client(account_sid, auth_token)
        msg = client.messages.create(
            body=message,
            from_=from_number,
            to=phone,
        )
        print(f"[LoadSight SMS] Sent to {phone} via Twilio. SID: {msg.sid}")
        return {
            "status": "sent",
            "provider": "twilio",
            "sid": msg.sid,
            "to": phone,
            "timestamp": timestamp,
        }
    except ImportError:
        print("[LoadSight SMS] twilio package not installed. Falling back to mock.")
        return _mock_send(phone, message, timestamp)
    except Exception as e:
        print(f"[LoadSight SMS] Twilio error: {e}")
        return {"status": "error", "error": str(e), "timestamp": timestamp}


def _mock_send(phone: str, message: str, timestamp: str) -> dict:
    """Mock SMS — prints to console for development."""
    print(f"\n{'='*60}")
    print(f"[LoadSight SMS MOCK] {timestamp}")
    print(f"  TO:  {phone}")
    print(f"  MSG: {message}")
    print(f"{'='*60}\n")
    return {
        "status": "mock_sent",
        "provider": "console",
        "to": phone,
        "message": message,
        "timestamp": timestamp,
    }
