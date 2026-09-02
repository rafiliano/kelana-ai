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

    if top_score < 0.7:
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
