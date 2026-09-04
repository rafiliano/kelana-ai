from pydantic import BaseModel, EmailStr
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation
)
from services.bedrock_service import get_ai_recommendation
from services.kb_service import ask_knowledge_base, retrieve_knowledge_base
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message
from database import SessionLocal, init_db
from sqlalchemy import or_
from services.auth_service import register as auth_register, login as auth_login, get_current_user

app = FastAPI()

# Allow frontend at localhost:3000 to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000"],
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

init_db()


class TripRequest(BaseModel):
    destination  : str
    days         : int
    budget       : float
    travel_style : str

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically

class RegisterRequest(BaseModel):
    name     : str
    email    : str
    password : str

class LoginRequest(BaseModel):
    email    : str
    password : str

class QuestionRequest(BaseModel):
    question : str

class ConversationRequest(BaseModel):
    title : str = "New Conversation"

class MessageRequest(BaseModel):
    content    : str
    get_reply  : bool = True  # set False to just save without calling AI

# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message" : "Welcome to KelanaAI"
    }

@app.get("/health")
def health():
    return {
        "status" : "Ok"
    }

# AUTH endpoints
@app.post("/api/v1/auth/register")
def register(request: RegisterRequest):
    user = auth_register(
        name     = request.name,
        email    = request.email,
        password = request.password,
    )
    return {
        "id"         : user.id,
        "name"       : user.name,
        "email"      : user.email,
        "created_at" : user.created_at,
    }

@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    return auth_login(
        email    = request.email,
        password = request.password,
    )

@app.get("/api/v1/auth/me")
def get_me(user: User = Depends(get_current_user)):
    db           = SessionLocal()
    trip_count   = db.query(Trip).filter(Trip.user_id == user.id).count()
    db.close()
    return {
        "id"          : user.id,
        "name"        : user.name,
        "email"       : user.email,
        "created_at"  : user.created_at,
        "total_trips" : trip_count,
    }

# Knowledge Base endpoint — ask a travel question
@app.post("/api/v1/ask")
def ask_endpoint(request: QuestionRequest):
    # Step 1 — retrieve chunks and scores from knowledge base
    kb_result    = retrieve_knowledge_base(request.question)
    sources      = kb_result["sources"]

    # Step 2 — check if any source is relevant enough (score >= 0.6)
    top_score    = max((s["score"] or 0 for s in sources), default=0)

    if top_score < 0.6:
        return {
            "question"   : request.question,
            "answer"     : None,
            "sources"    : sources,
            "top_score"  : top_score,
            "message"    : "No relevant information found in the knowledge base.",
        }

    # Step 3 — generate grounded answer using retrieved context
    answer = ask_knowledge_base(request.question)

    return {
        "question"  : request.question,
        "answer"    : answer,
        "sources"   : sources,
        "top_score" : top_score,
    }

@app.get("/api/v1/trip_categories")
def trip_category():
    return {"Backpacker", "Standard", "Luxury"}

@app.get("/api/v1/recommendations")
def trip_recommendation():
    return {"Tokyo Tower", "Mount Fuji", "Shibuya"}

@app.get("/api/v1/transportations")
def trip_transportation():
    return {"Bus", "Train", "Flight"}


# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest, user: User = Depends(get_current_user)):
    # reuse Session 2 business logic
    daily_budget      = calculate_daily_budget(request.budget, request.days)
    category          = get_trip_category(request.budget)
    ai_recommendation: str = get_ai_recommendation(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        travel_style = request.travel_style,
    )
    # create a Trip ORM object — attach the logged-in user's id
    trip = Trip(
        user_id           = user.id,
        destination       = request.destination,
        days              = request.days,
        budget            = request.budget,
        category          = category,
        travel_style      = request.travel_style,
        daily_budget      = daily_budget,
        ai_recommendation = ai_recommendation,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)  # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips(user: User = Depends(get_current_user)):
    # Only return trips belonging to the logged-in user
    db    = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == user.id).all()
    db.close()
    return trips

@app.get("/api/v1/trips/search")
def search_trips(destination: str = "", travel_style: str = ""):
    db = SessionLocal()
    query = db.query(Trip)

    if destination.strip():
        query = query.filter(Trip.destination.ilike(f"%{destination.strip()}%"))
    if travel_style.strip():
        query = query.filter(Trip.travel_style.ilike(f"%{travel_style.strip()}%"))

    trips = query.all()
    db.close()
    return trips
    
@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.delete("/api/v1/trips/{trip_id}")
def del_trip(trip_id: int, user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    # if not found, return 404
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # reject if trip belongs to another user
    if trip.user_id != user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Not allowed to delete another user's trip")

    # if found and owned, delete it
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip {trip_id} deleted successfully"}

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest, user: User = Depends(get_current_user)):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    # if not found, return 404
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    # reject if trip belongs to another user
    if trip.user_id != user.id:
        db.close()
        raise HTTPException(status_code=403, detail="Not allowed to update another user's trip")

    # only update days and budget if provided
    if request.days:
        trip.days = request.days
    if request.budget:
        trip.budget = request.budget

    trip.category     = get_trip_category(trip.budget)
    trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)

    db.commit()
    db.refresh(trip)
    db.close()
    return trip

# CONVERSATION endpoints

@app.post("/api/v1/conversations", status_code=201)
def create_conversation(
    request : ConversationRequest,
    user    : User = Depends(get_current_user),
):
    """Create a new conversation row and return its identifier."""
    db           = SessionLocal()
    conversation = Conversation(
        user_id = user.id,
        title   = request.title,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    db.close()
    return {"conversation_id": conversation.id}


@app.get("/api/v1/conversations")
def list_conversations(user: User = Depends(get_current_user)):
    """List all conversations for the authenticated user, sorted by last message time."""
    db            = SessionLocal()
    conversations = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    result = []
    for c in conversations:
        # Get the timestamp of the last message in this conversation
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == c.id)
            .order_by(Message.created_at.desc())
            .first()
        )
        result.append({
            "id"              : c.id,
            "title"           : c.title,
            "created_at"      : c.created_at,
            "last_message_at" : last_msg.created_at if last_msg else c.created_at,
        })

    db.close()

    # Sort by last_message_at descending — most recently active first
    result.sort(key=lambda x: x["last_message_at"], reverse=True)
    return result


@app.post("/api/v1/conversations/{conversation_id}/messages", status_code=201)
def post_message(
    conversation_id : int,
    request         : MessageRequest,
    user            : User = Depends(get_current_user),
):
    """
    Save a user message to the conversation.
    If get_reply=True, also call Bedrock AI with the full history and save the reply.
    Returns both the user message and (optionally) the assistant reply.
    """
    db = SessionLocal()

    # 1 — verify conversation exists and belongs to this user
    conversation = db.query(Conversation).filter(
        Conversation.id      == conversation_id,
        Conversation.user_id == user.id,
    ).first()

    if not conversation:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    # 2 — save the user message
    user_message = Message(
        conversation_id = conversation_id,
        role            = "user",
        content         = request.content,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    response_data = {
        "user_message" : {
            "id"         : user_message.id,
            "role"       : user_message.role,
            "content"    : user_message.content,
            "created_at" : user_message.created_at,
        },
        "assistant_message" : None,
    }

    # 3 — optionally get AI reply
    if request.get_reply:
        # load full conversation history for context
        history = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()

        # build message list for Bedrock
        bedrock_messages = [
            {"role": m.role, "content": [{"text": m.content}]}
            for m in history
        ]

        import boto3, json, os
        bedrock_client = boto3.client(
            service_name          = "bedrock-runtime",
            region_name           = os.getenv("AWS_REGION"),
            aws_access_key_id     = os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        body = json.dumps({"messages": bedrock_messages})

        bedrock_response = bedrock_client.invoke_model(
            modelId     = os.getenv("MODEL_ID"),
            body        = body,
            contentType = "application/json",
            accept      = "application/json",
        )

        result      = json.loads(bedrock_response["body"].read())
        ai_text     = result["output"]["message"]["content"][0]["text"]

        # 4 — save assistant reply
        assistant_message = Message(
            conversation_id = conversation_id,
            role            = "assistant",
            content         = ai_text,
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)

        response_data["assistant_message"] = {
            "id"         : assistant_message.id,
            "role"       : assistant_message.role,
            "content"    : assistant_message.content,
            "created_at" : assistant_message.created_at,
        }

    db.close()
    return response_data


@app.get("/api/v1/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id : int,
    user            : User = Depends(get_current_user),
):
    """Load full message history for a conversation."""
    db = SessionLocal()

    # verify ownership
    conversation = db.query(Conversation).filter(
        Conversation.id      == conversation_id,
        Conversation.user_id == user.id,
    ).first()

    if not conversation:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    db.close()
    return [
        {
            "id"         : m.id,
            "role"       : m.role,
            "content"    : m.content,
            "created_at" : m.created_at,
        }
        for m in messages
    ]


class ConversationUpdateRequest(BaseModel):
    title : str

@app.patch("/api/v1/conversations/{conversation_id}")
def update_conversation_title(
    conversation_id : int,
    request         : ConversationUpdateRequest,
    user            : User = Depends(get_current_user),
):
    """Rename a conversation title."""
    db           = SessionLocal()
    conversation = db.query(Conversation).filter(
        Conversation.id      == conversation_id,
        Conversation.user_id == user.id,
    ).first()

    if not conversation:
        db.close()
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.title = request.title
    db.commit()
    db.refresh(conversation)
    db.close()
    return {"id": conversation.id, "title": conversation.title}
